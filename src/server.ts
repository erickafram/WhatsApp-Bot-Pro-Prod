import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import * as fs from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Baileys imports
import { 
    default as makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    Browsers,
    MessageType,
    proto,
    jidNormalizedUser,
    isJidBroadcast,
    isJidGroup,
    isJidUser,
    downloadContentFromMessage,
    areJidsSameUser,
    WAMessage,
    WASocket,
    getContentType
} from '@whiskeysockets/baileys';

// Carregar variáveis de ambiente
dotenv.config();

// Importar configurações e modelos
import { createDatabaseIfNotExists, connectDatabase, executeQuery, closePool, closeDatabaseConnection } from './config/database';
import { runMigrations } from './migrations/migrations';
import { UserModel } from './models/User';
import { WhatsAppInstanceModel } from './models/WhatsAppInstance';
import { MessageProjectModel, AutoMessageModel } from './models/MessageProject';
import { ContactModel, MessageModel, HumanChatModel } from './models/Message';
import { UserSessionModel } from './models/UserSession';
import { authenticate } from './middleware/auth';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import whatsappRoutes from './routes/whatsapp';
import messageRoutes from './routes/messages';
import deviceRoutes from './routes/devices';
import operatorRoutes from './routes/operators';
import managerRoutes from './routes/managers';
import subscriptionRoutes from './routes/subscription';
import documentsRoutes from './routes/documents';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para disponibilizar Socket.IO nas rotas
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

// Servir arquivos estáticos do React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Types
interface ConnectionStatus {
    connected: boolean;
    message: string;
}

interface MessageEvent {
    from: string;
    body: string;
    timestamp: Date;
}

// Gerenciamento de instâncias WhatsApp por gestor - AGORA COM BAILEYS
interface BaileysInstance {
    sock: WASocket;
    isReady: boolean;
    messageCount: number;
    startTime: Date;
    qrCode?: string;
    authState?: any;
}

const whatsappInstances = new Map<number, BaileysInstance>();

// Sistema de controle de chats encerrados - IGUAL AO SERVER.JS ORIGINAL
const finishedChats = new Map<number, Set<string>>(); // managerId -> Set de chatIds

// Disponibilizar instâncias globalmente para uso em outros módulos
(global as any).whatsappInstances = whatsappInstances;
(global as any).io = io;
(global as any).finishedChats = finishedChats;

// ===== SISTEMA DE FLUXO JSON =====

interface FlowNode {
    id: string;
    type: string;
    data: {
        title: string;
        triggers?: string[];
        response?: string;
        active?: number;
        priority?: number;
        post_closure_only?: boolean;
        stop_processing?: boolean;
        action?: string;
        description?: string;
    };
    connections: string[];
}

interface FlowData {
    metadata: any;
    nodes: FlowNode[];
    connections: any[];
    settings: any;
}

let cachedFlow: FlowData | null = null;

// Cache para contexto dos usuários (simples para rastrear onde estão no fluxo)
const userContexts = new Map<string, string>();

// Função para carregar fluxo JSON
function loadFlowFromJSON(): FlowData | null {
    try {
        if (cachedFlow) return cachedFlow;
        
        const flowPath = path.join(__dirname, '..', 'fluxo-kleiber-passagens-tocantins.json');
        if (!fs.existsSync(flowPath)) {
            console.log('⚠️ Arquivo de fluxo JSON não encontrado:', flowPath);
            return null;
        }
        
        const flowContent = fs.readFileSync(flowPath, 'utf8');
        cachedFlow = JSON.parse(flowContent);
        console.log('✅ Fluxo JSON carregado com sucesso!');
        return cachedFlow;
    } catch (error) {
        console.error('❌ Erro ao carregar fluxo JSON:', error);
        return null;
    }
}

// Função para processar mensagem usando fluxo JSON
function processMessageWithFlow(message: string, flowData: FlowData, currentContext?: string, isAfterClosure: boolean = false): { node: FlowNode | null, response: string | null } {
    if (!flowData) return { node: null, response: null };
    
    const messageText = message.toLowerCase().trim();
    
    // 🛒 SE ESTAMOS NO CONTEXTO DE COMPRA, QUALQUER MENSAGEM VAI PARA PROCESS-TICKET-REQUEST
    if (currentContext === 'purchase') {
        console.log(`🛒 Contexto de compra ativo - qualquer mensagem vai para process-ticket-request`);
        
        // Buscar o nó process-ticket-request primeiro
        const processNode = flowData.nodes.find(node => node.id === 'process-ticket-request');
        if (processNode) {
            console.log(`🎯 Nó process-ticket-request encontrado: ${processNode.id} - ${processNode.data.title}`);
            return {
                node: processNode,
                response: processNode.data.response || null
            };
        }
        
        // Se não encontrar, usar fallback-auto
        const fallbackNode = flowData.nodes.find(node => node.id === 'fallback-auto');
        if (fallbackNode) {
            console.log(`🎯 Fallback: Nó fallback-auto encontrado: ${fallbackNode.id}`);
            return {
                node: fallbackNode,
                response: fallbackNode.data.response || null
            };
        }
    }
    
    // 🔄 PROCESSAR NÓS POR PRIORIDADE
    const sortedNodes = flowData.nodes
        .filter(node => node.data.active === 1)
        .sort((a, b) => (a.data.priority || 999) - (b.data.priority || 999));
    
    for (const node of sortedNodes) {
        // Verificar se é nó pós-encerramento
        if (node.data.post_closure_only && !isAfterClosure) {
            continue; // Pular nós pós-encerramento se não estivermos nesse contexto
        }
        
        if (!node.data.post_closure_only && isAfterClosure) {
            continue; // Pular nós normais se estivermos no contexto pós-encerramento
        }
        
        if (node.data.triggers) {
            // Verificar se algum trigger corresponde
            const triggerMatch = node.data.triggers.some(trigger => {
                if (trigger === '*') return true; // Wildcard match
                return messageText.includes(trigger.toLowerCase()) || 
                       messageText === trigger.toLowerCase();
            });
            
            if (triggerMatch) {
                console.log(`🎯 Nó encontrado no fluxo JSON: ${node.id} - ${node.data.title} (Priority: ${node.data.priority || 'nenhuma'})`);
                return { 
                    node, 
                    response: node.data.response || null 
                };
            }
        }
    }
    
    // Se estivermos no contexto pós-encerramento e não encontrou nada, não usar fallback
    if (isAfterClosure) {
        console.log(`🔄 Nenhum nó pós-encerramento encontrado para: "${messageText}"`);
        return { node: null, response: null };
    }
    
    // 🔍 SE NÃO ENCONTROU NENHUM NÓ ESPECÍFICO, USAR FALLBACK-AUTO
    console.log(`🔄 Nenhum nó específico encontrado - usando fallback-auto para: "${messageText}"`);
    const fallbackNode = flowData.nodes.find(node => node.id === 'fallback-auto');
    if (fallbackNode) {
        console.log(`🎯 Nó fallback-auto encontrado: ${fallbackNode.id}`);
        return {
            node: fallbackNode,
            response: fallbackNode.data.response || null
        };
    }
    
    return { node: null, response: null };
}

// Função para executar ações específicas de nós
async function executeNodeAction(node: FlowNode, activeChat: any, managerId: number, dbContact: any, contactName: string, phoneNumber: string) {
    if (!node.data.action) return;
    
    console.log(`🎬 Executando ação do nó: ${node.data.action} para chat ${activeChat?.id}`);
    
    switch (node.data.action) {
        case 'reactivate_same_operator':
            // Reativar chat com mesmo operador
            console.log(`✅ REATIVANDO chat ${activeChat.id} automaticamente - Status: finished → pending`);
            try {
                await executeQuery(
                    'UPDATE human_chats SET status = ?, updated_at = NOW() WHERE id = ?',
                    ['pending', activeChat.id]
                );
                activeChat.status = 'pending';
                console.log(`✅ Chat ${activeChat.id} reativado com sucesso para status 'pending'`);
                
                // Buscar chat atualizado do banco para garantir consistência
                const updatedChat = await HumanChatModel.findById(activeChat.id);
                if (updatedChat) {
                    Object.assign(activeChat, updatedChat);
                    console.log(`🔄 Chat atualizado na memória - Status confirmado: ${activeChat.status}`);
                }
                
                // Notificar dashboard sobre chat reaberto
                (global as any).io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                    type: 'chat_reopened',
                    chatId: activeChat.id,
                    customerName: contactName,
                    customerPhone: phoneNumber,
                    status: 'pending',
                    timestamp: new Date()
                });
            } catch (error) {
                console.error(`❌ Erro ao reativar chat ${activeChat.id}:`, error);
            }
            break;
            
        case 'reset_chat_status':
            // Resetar status do chat para permitir navegação normal
            console.log(`🔄 Resetando status do chat ${activeChat.id} para permitir navegação normal`);
            await executeQuery(
                'UPDATE human_chats SET status = NULL, operator_id = NULL, assigned_to = NULL, updated_at = NOW() WHERE id = ?',
                [activeChat.id]
            );
            break;
            
        case 'reactivate_new_operator':
            // Reativar chat para novo operador
            console.log(`✅ REATIVANDO chat ${activeChat.id} para novo operador - Status: finished → pending`);
            try {
                await executeQuery(
                    'UPDATE human_chats SET status = ?, operator_id = NULL, assigned_to = NULL, updated_at = NOW() WHERE id = ?',
                    ['pending', activeChat.id]
                );
                
                // Atualizar objeto na memória
                activeChat.status = 'pending';
                activeChat.operator_id = null;
                activeChat.assigned_to = null;
                
                // Buscar chat atualizado do banco
                const updatedChatResult = await executeQuery(
                    'SELECT * FROM human_chats WHERE id = ?',
                    [activeChat.id]
                ) as any[];
                
                if (updatedChatResult && updatedChatResult.length > 0) {
                    const updatedChat = updatedChatResult[0];
                    Object.assign(activeChat, updatedChat);
                    console.log(`✅ Chat ${activeChat.id} reativado com sucesso - Status: ${activeChat.status}`);
                }
                
                // Emitir eventos para dashboard
                (global as any).io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                    type: 'chat_reopened',
                    chatId: activeChat.id,
                    customerName: contactName,
                    customerPhone: phoneNumber,
                    status: 'pending',
                    timestamp: new Date()
                });
                
                // Emitir evento de nova mensagem para atualizar lista de chats pendentes
                (global as any).io.to(`manager_${managerId}`).emit('customer_message', {
                    chatId: activeChat.id,
                    customerName: contactName,
                    customerPhone: phoneNumber,
                    message: 'Cliente solicitou novo atendimento',
                    timestamp: new Date(),
                    status: 'pending'
                });
                
                console.log(`📨 Eventos emitidos para chat ${activeChat.id} aparecer na lista de pendentes`);
            } catch (error) {
                console.error(`❌ Erro ao reativar chat ${activeChat.id} para novo operador:`, error);
            }
            break;
    }
}

// ===== INICIALIZAÇÃO DO SISTEMA =====

async function initializeSystem() {
    try {
        console.log('🚀 Iniciando sistema...');
        
        // Inicializar banco de dados
        await createDatabaseIfNotExists();
        await connectDatabase();
        await runMigrations();
        
        console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        process.exit(1);
    }
}

// ===== GERENCIAMENTO DE INSTÂNCIAS WHATSAPP COM BAILEYS =====

// Função para inicializar cliente WhatsApp com Baileys para um gestor específico
async function initializeWhatsAppClientBaileys(managerId: number, instanceId: number): Promise<void> {
    console.log(`🔄 Inicializando cliente WhatsApp Baileys para gestor ${managerId}, instância ${instanceId}...`);
    
    try {
        // Configurar diretório de autenticação específico para cada gestor
        const authDir = path.join(__dirname, '..', 'auth_baileys', `manager_${managerId}_instance_${instanceId}`);
        
        // Manter cache - não limpar automaticamente como no exemplo que funciona
        
        // Criar diretório se não existir
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }
        
        // Configuração de autenticação
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        // Criar socket do WhatsApp - CONFIGURAÇÃO SIMPLES COMO SEU EXEMPLO
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false // Usar configuração mínima igual seu exemplo
        });
        
        // Salvar instância
        const instanceData: BaileysInstance = {
            sock,
            isReady: false,
            messageCount: 0,
            startTime: new Date(),
            authState: state
        };
        
        whatsappInstances.set(managerId, instanceData);
        
        // Atualizar status no banco como "connecting"
        try {
            await WhatsAppInstanceModel.updateStatus(instanceId, 'connecting');
            console.log(`💾 Status 'connecting' salvo no banco para gestor ${managerId}`);
        } catch (dbError) {
            console.error('❌ Erro ao salvar status connecting no banco:', dbError);
        }
        
        // Evento para QR Code - EXATAMENTE COMO SEU EXEMPLO QUE FUNCIONA
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            console.log(`🔍 Connection update para gestor ${managerId}:`, { connection, hasQR: !!qr, hasError: !!lastDisconnect?.error });
            
            if (qr) {
                console.log(`\n📱 QR CODE para gestor ${managerId} - Escaneie com seu WhatsApp:`);
                console.log('==========================================');
                console.log('🎯 QR RAW STRING:', qr.substring(0, 50) + '...');
                console.log('==========================================');
                
                try {
                    // Gerar QR code como data URL para enviar via Socket
                    const qrDataURL = await QRCode.toDataURL(qr, { 
                        width: 256,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    
                    instanceData.qrCode = qrDataURL;
                    
                    // Salvar QR code no banco
                    try {
                        await WhatsAppInstanceModel.updateStatus(instanceId, 'connecting', {
                            qr_code: qrDataURL
                        });
                        console.log(`💾 QR Code salvo no banco para gestor ${managerId}`);
                    } catch (dbError) {
                        console.error('❌ Erro ao salvar QR code no banco:', dbError);
                    }
                    
                    console.log(`📤 Enviando QR Code para gestor ${managerId} via Socket.IO...`);
                    
                    // Emitir QR code para o cliente (compatibilidade com frontend)
                    io.to(`manager_${managerId}`).emit('qr_code', {
                        managerId,
                        instanceId,
                        qrCode: qrDataURL,
                        message: 'Escaneie o QR Code com seu WhatsApp'
                    });
                    
                    // Evento compatível com frontend existente
                    io.to(`manager_${managerId}`).emit('qr', qrDataURL);
                    
                    // Status indicando QR disponível
                    io.to(`manager_${managerId}`).emit('status', {
                        connected: false,
                        message: 'QR Code gerado! Escaneie com seu WhatsApp'
                    });
                    
                    console.log(`✅ QR Code enviado com sucesso para interface do gestor ${managerId}`);
                } catch (qrError) {
                    console.error('❌ Erro ao gerar QR Code:', qrError);
                    
                    // Emitir erro para frontend
                    io.to(`manager_${managerId}`).emit('status', {
                        connected: false,
                        message: `Erro ao gerar QR: ${qrError instanceof Error ? qrError.message : 'Erro desconhecido'}`
                    });
                }
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`❌ Conexão fechada para gestor ${managerId} devido a:`, lastDisconnect?.error, ', reconectando:', shouldReconnect);
                
                instanceData.isReady = false;
                
                // Emitir status de desconexão
                io.to(`manager_${managerId}`).emit('connection_status', {
                    managerId,
                    instanceId,
                    status: 'disconnected',
                    message: 'Conexão perdida. Tentando reconectar...'
                });
                
                // Evento compatível com frontend existente
                io.to(`manager_${managerId}`).emit('status', {
                    connected: false,
                    message: 'Conexão perdida. Tentando reconectar...'
                });
                
                // Atualizar status no banco
                try {
                    await WhatsAppInstanceModel.updateStatus(instanceId, 'disconnected');
                    console.log(`💾 Status de desconexão salvo no banco para gestor ${managerId}`);
                } catch (dbError) {
                    console.error('❌ Erro ao atualizar status de desconexão no banco:', dbError);
                }
                
                                 if (shouldReconnect) {
                     // Aumentar delay para evitar rate limiting
                     const reconnectDelay = Math.min(15000, 3000 * Math.random() + 2000); // 2-5s + até 15s
                     console.log(`🔄 Tentando reconectar em ${Math.round(reconnectDelay/1000)}s...`);
                     setTimeout(() => {
                         initializeWhatsAppClientBaileys(managerId, instanceId);
                     }, reconnectDelay);
                 } else {
                     console.log(`❌ Não reconectando - usuário foi deslogado`);
                 }
            } else if (connection === 'open') {
                console.log(`🎉 CONECTADO COM SUCESSO! Gestor ${managerId}`);
                console.log(`📱 Bot está pronto e funcionando para gestor ${managerId}!`);
                console.log(`📨 Aguardando mensagens...\n`);
                
                instanceData.isReady = true;
                instanceData.qrCode = undefined;
                
                // Emitir status de conexão
                io.to(`manager_${managerId}`).emit('connection_status', {
                    managerId,
                    instanceId,
                    status: 'connected',
                    message: 'WhatsApp conectado com sucesso!'
                });
                
                // Evento compatível com frontend existente
                io.to(`manager_${managerId}`).emit('status', {
                    connected: true,
                    message: 'WhatsApp conectado com sucesso!'
                });
                
                // Salvar status no banco de dados
                try {
                    // Obter informações do usuário conectado
                    const userInfo = sock.user;
                    const phoneNumber = userInfo?.id?.replace(/:\d+/, ''); // Remove sufixo :1 ou :0
                    
                    // Atualizar status no banco
                    await WhatsAppInstanceModel.updateStatus(instanceId, 'connected', {
                        phone_number: phoneNumber,
                        qr_code: undefined,
                        connected_at: new Date()
                    });
                    
                    console.log(`✅ WhatsApp conectado para gestor ${managerId} - Status salvo no banco`);
                } catch (dbError) {
                    console.error('❌ Erro ao atualizar status no banco:', dbError);
                }
            }
        });
        
        // Salvar credenciais quando atualizadas
        sock.ev.on('creds.update', saveCreds);
        
        // Evento para mensagens
        sock.ev.on('messages.upsert', async (messageUpsert) => {
            const messages = messageUpsert.messages;
            
            for (const msg of messages) {
                if (!msg.message) continue; // Ignorar mensagens sem conteúdo
                if (msg.key.fromMe) continue; // Ignorar nossas próprias mensagens
                
                // Verificar se é mensagem privada (não grupo)
                if (!isJidUser(msg.key.remoteJid!)) continue;
                
                await processMessageBaileys(msg, managerId, instanceData);
            }
        });
        
        console.log(`✅ Cliente WhatsApp Baileys configurado para gestor ${managerId}`);
        
    } catch (error) {
        console.error(`❌ Erro ao inicializar cliente WhatsApp Baileys para gestor ${managerId}:`, error);
        console.error(`🔍 Stack trace:`, error instanceof Error ? error.stack : 'Sem stack trace');
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Emitir erro para o cliente
        io.to(`manager_${managerId}`).emit('connection_error', {
            managerId,
            instanceId,
            error: errorMessage
        });
        
        // Evento compatível com frontend existente
        io.to(`manager_${managerId}`).emit('status', {
            connected: false,
            message: `Erro: ${errorMessage}`
        });
        
        // Log detalhado para debug
        console.error(`💥 DETALHES DO ERRO:`, {
            managerId,
            instanceId,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: errorMessage,
            errorCode: (error as any)?.code || 'Sem código'
        });
    }
}

// Função para processar mensagens com Baileys
async function processMessageBaileys(msg: WAMessage, managerId: number, instanceData: BaileysInstance) {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    try {
        // Detectar tipo de conteúdo da mensagem
        const messageType = getContentType(msg.message || {});
        
        // Verificar se é mídia primeiro
        const hasMedia = messageType !== 'conversation' && messageType !== 'extendedTextMessage';
        
        // Extrair identificadores da mensagem
        const sender = msg.key.remoteJid!;
        const phoneNumber = sender.replace('@s.whatsapp.net', '');
        
        // Criar ou encontrar contato (usando nome do push se disponível)
        const contactName = msg.pushName || phoneNumber;
        
        const dbContact = await ContactModel.findOrCreate({
            manager_id: managerId,
            phone_number: phoneNumber,
            name: contactName
        });
        
        // Verificar se é primeira mensagem ANTES de processar texto
        let isFirstMessage = false;
        try {
            const messageCount = await executeQuery(
                'SELECT COUNT(*) as count FROM messages WHERE contact_id = ? AND manager_id = ?',
                [dbContact.id, managerId]
            ) as any[];
            
            isFirstMessage = messageCount && messageCount[0].count === 0;
            console.log(`🔍 Primeira mensagem do contato? ${isFirstMessage} (${messageCount[0]?.count || 0} mensagens anteriores)`);
        } catch (error) {
            console.error('❌ Erro ao verificar histórico de mensagens:', error);
            isFirstMessage = true; // Assumir primeira mensagem em caso de erro
        }
        
        // Extrair texto da mensagem
        let messageText = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || 
                         msg.message?.imageMessage?.caption ||
                         msg.message?.videoMessage?.caption ||
                         msg.message?.documentMessage?.caption ||
                         '';
        
        // Se não há texto e é mídia, verificar contexto da conversa
        if (!messageText && hasMedia) {
            if (isFirstMessage) {
                // Para primeira mensagem com mídia, usar trigger de boas-vindas
                messageText = 'oi';
                console.log(`👋 Primeira mensagem com mídia - usando "oi" para mostrar menu de boas-vindas`);
            } else {
                // Para mensagens subsequentes, mapear tipos de mídia
                switch (messageType) {
                    case 'audioMessage':
                        messageText = 'audio';
                        break;
                    case 'imageMessage':
                        messageText = 'imagem';
                        break;
                    case 'videoMessage':
                        messageText = 'video';
                        break;
                    case 'documentMessage':
                        messageText = 'documento';
                        break;
                    default:
                        messageText = 'mídia';
                }
                console.log(`📎 Mídia em conversa existente - usando "${messageText}" para processamento`);
            }
        }
        
        console.log('\n📨 ========== NOVA MENSAGEM BAILEYS ==========');
        console.log('⏰ Hora:', new Date().toLocaleString());
        console.log('📱 De:', sender);
        console.log('💬 Texto:', messageText);
        console.log('🔍 Tipo:', messageType);
        console.log('📎 Tem mídia:', hasMedia);
        console.log('👋 Primeira mensagem:', isFirstMessage);
        console.log('==========================================\n');
        
        // Incrementar contador de mensagens
        instanceData.messageCount++;
        
        // 🗄️ SALVAR MENSAGEM RECEBIDA NO BANCO DE DADOS
        console.log(`💾 Salvando mensagem recebida de ${sender}: "${messageText}"`);
        
        // Verificar se o chat foi encerrado e reativar com menu - IGUAL AO SERVER.JS ORIGINAL
        let managerFinishedChats = finishedChats.get(managerId) || new Set();
        const userChatId = phoneNumber + '@c.us'; // Formato original
        
        if (managerFinishedChats.has(userChatId)) {
            console.log(`🚫 REATIVAÇÃO AUTOMÁTICA DESABILITADA - Chat ${userChatId} estava encerrado mas NÃO será reativado automaticamente`);
            console.log(`💡 Para reativar, usuário deve solicitar explicitamente: "quero falar com operador"`);
            
            // Remover da lista para não ficar checando sempre
            managerFinishedChats.delete(userChatId);
            finishedChats.set(managerId, managerFinishedChats);
            
            // NÃO mostrar menu automaticamente - deixar que o bot funcione normalmente
            console.log(`🤖 Processamento normal do bot continuará...`);
            // Continuar o processamento normal (não fazer return aqui)
        }
        
        // 📎 PROCESSAR MÍDIA SE PRESENTE
        let mediaInfo: MediaInfo = { mediaType: 'text' };
        
        if (hasMedia) {
            console.log(`📎 Detectada mídia do tipo: ${messageType}`);
            mediaInfo = await processMediaMessage(msg, messageType!, managerId);
        }
        
        // Verificar se existe chat humano para este contato (qualquer status)
        let activeChat = await HumanChatModel.findAnyByContact(dbContact.id);
        
        // 🔄 VERIFICAR SE É MENSAGEM APÓS ENCERRAMENTO
        // Verificar se a última mensagem do bot foi de encerramento
        let isAfterClosure = false;
        let isValidPostChatOption = false;
        
        if (activeChat) {
            try {
                const lastBotMessage = await executeQuery(
                    'SELECT content FROM messages WHERE contact_id = ? AND manager_id = ? AND sender_type = "bot" ORDER BY created_at DESC LIMIT 1',
                    [dbContact.id, managerId]
                ) as any[];
                
                if (lastBotMessage && lastBotMessage.length > 0) {
                    const lastContent = lastBotMessage[0].content;
                    // Verificar se a última mensagem foi de encerramento
                    if (lastContent.includes('✅ *CONVERSA ENCERRADA*') || lastContent.includes('CONVERSA ENCERRADA')) {
                        isAfterClosure = true;
                        console.log(`🔍 Mensagem após encerramento detectada! Mensagem: "${messageText}"`);
                        
                        // Verificar se é opção válida (1, 2, 3)
                        if (['1', '2', '3'].includes(messageText)) {
                            isValidPostChatOption = true;
                            console.log(`✅ Opção válida pós-encerramento: ${messageText}`);
                        } else {
                            console.log(`❌ Opção inválida pós-encerramento: "${messageText}" - Deve ser 1, 2 ou 3`);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao verificar última mensagem do bot:', error);
            }
        }
        
        // 🔄 PROCESSAR OPÇÕES PÓS-ENCERRAMENTO VIA JSON
        if (isAfterClosure && activeChat) {
            console.log(`🔄 Processando mensagem pós-encerramento via JSON: "${messageText}"`);
            
            // Buscar operador do chat anterior para substituir placeholders
            const operatorId = activeChat.assigned_to || activeChat.operator_id;
            const previousOperator = operatorId ? await UserModel.findById(operatorId) : null;
            const operatorName = previousOperator ? previousOperator.name : 'operador';
            
            // Processar via JSON com contexto pós-encerramento
                const flowData = loadFlowFromJSON();
                if (flowData) {
                const flowResult = processMessageWithFlow(messageText, flowData, undefined, true);
                
                if (flowResult.node && flowResult.response) {
                    console.log(`🎯 Nó pós-encerramento processado: ${flowResult.node.id} - ${flowResult.node.data.title}`);
                    
                    // Substituir placeholders
                    const name = msg.pushName ? msg.pushName.split(" ")[0] : 'amigo';
                    let response = flowResult.response.replace(/{name}/g, name);
                    response = response.replace(/{operatorName}/g, operatorName);
                    
                    // Executar ações específicas baseadas no node
                    await executeNodeAction(flowResult.node, activeChat, managerId, dbContact, contactName, phoneNumber);
                    
                    // Enviar resposta
                if (instanceData.sock && instanceData.isReady) {
                    await instanceData.sock.sendMessage(sender, { text: response });
                        console.log(`✅ Resposta pós-encerramento enviada: ${flowResult.node.id}`);
                    
                    // Salvar resposta no banco
                    await saveBotMessage(response, managerId, dbContact, activeChat);
                    }
                    
                    return; // Parar processamento
                }
            }
            
            // Se não encontrou nenhum nó válido, não fazer nada (deixa o fluxo normal processar)
            console.log(`❓ Nenhum nó pós-encerramento encontrado para: "${messageText}"`);
        }
        
        // Salvar mensagem do cliente no banco (incluindo mídia)
        const customerMessage = await MessageModel.create({
            manager_id: managerId,
            chat_id: activeChat?.id || null,
            contact_id: dbContact.id,
            sender_type: 'contact',
            content: messageText || (hasMedia ? `[${mediaInfo.mediaType.toUpperCase()}]` : ''),
            message_type: mediaInfo.mediaType,
            media_url: mediaInfo.mediaUrl || undefined
        });
        
        console.log(`💾 Mensagem do cliente salva no banco - ID: ${customerMessage.id}`);
        
        // 📨 EMITIR MENSAGEM PARA OPERADORES EM TEMPO REAL - COMPATIBILIDADE COM FRONTEND
        // Verificar se existe chat humano com vários status possíveis
        // ✅ RECALCULAR isChatActive APÓS POSSÍVEL REATIVAÇÃO DO CHAT
        const isChatActive = activeChat && ['pending', 'active', 'waiting_payment', 'transfer_pending'].includes(activeChat.status);
        
        console.log(`🔍 Verificação de chat ativo: Chat ID: ${activeChat?.id || 'nenhum'}, Status: ${activeChat?.status || 'nenhum'}, isChatActive: ${isChatActive}`);
        
        if (isChatActive) {
            // Converter chatId para formato compatível com frontend (@c.us)
            const frontendChatId = phoneNumber + '@c.us';
            
            const customerMessageData = {
                chatId: frontendChatId,
                message: messageText || (hasMedia ? `[${mediaInfo.mediaType.toUpperCase()}]` : ''),
                timestamp: new Date(),
                customerName: contactName,
                managerId: managerId,
                messageId: customerMessage.id, // ✅ INCLUIR ID REAL DA MENSAGEM DO BANCO
                // Incluir informações de mídia se presente
                ...(hasMedia && {
                    messageType: mediaInfo.mediaType,
                    mediaUrl: mediaInfo.mediaUrl,
                    fileName: mediaInfo.fileName,
                    fileSize: mediaInfo.fileSize,
                    mimeType: mediaInfo.mimeType,
                    hasMedia: true
                })
            };
            
            console.log(`📨 Emitindo customer_message para sala manager_${managerId}:`, customerMessageData);
            io.to(`manager_${managerId}`).emit('customer_message', customerMessageData);
            
            // Emitir evento para atualizar dashboard
            io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                type: 'new_message',
                chatId: activeChat!.id,
                customerName: contactName,
                customerPhone: phoneNumber,
                status: activeChat!.status,
                timestamp: new Date()
            });
            
            console.log(`📨 Evento customer_message emitido para gestor ${managerId} - Chat ID: ${activeChat!.id} (Status: ${activeChat!.status})`);
        } else if (activeChat) {
            console.log(`🚫 BLOQUEADO: Chat existe mas status não ativo (${activeChat.status}) - NÃO enviando para operadores`);
            console.log(`🤖 Mensagem será processada pelo BOT normalmente`);
            
            // 🚫 NÃO EMITIR customer_message para chats inativos
            // Isso previne que mensagens de chats encerrados/resetados sejam enviadas para operadores
            // Deixar que o bot processe normalmente
        }
        
        // Verificar se há chat humano ativo primeiro - IGUAL AO SERVER.JS ORIGINAL
        if (isChatActive) {
            console.log(`👤 Mensagem redirecionada para chat humano - ID: ${activeChat!.id} (Status: ${activeChat!.status})`);
            console.log(`🤖 CHATBOT DESATIVADO - Operador/Gestor está no controle`);
            return; // 🚨 NÃO PROCESSAR MENSAGENS AUTOMÁTICAS - BOT DESATIVADO
        }
        
        // 🔄 PROCESSAR MENSAGEM VIA FLUXO JSON (NOVA ARQUITETURA GENÉRICA)
        let messageProcessed = false;
        
        console.log(`🔄 Processando mensagem via fluxo JSON: "${messageText}"`);
            
            try {
                const flowData = loadFlowFromJSON();
                if (flowData) {
                    // Verificar se usuário tem contexto ativo
                    const userContext = userContexts.get(sender);
                    console.log(`🔍 Contexto do usuário ${sender}: ${userContext || 'nenhum'}`);
                    
                const flowResult = processMessageWithFlow(messageText, flowData, userContext, false);
                    
                    if (flowResult.node && flowResult.response) {
                    console.log(`🎯 Fluxo JSON processou mensagem - Nó: ${flowResult.node.id} (Priority: ${flowResult.node.data.priority || 'nenhuma'})`);
                    
                    // Verificar se deve parar o processamento
                    if (flowResult.node.data.stop_processing) {
                        console.log(`⏹️ Nó configurado para parar processamento: ${flowResult.node.id}`);
                    }
                        
                        await delay(2000);
                        
                        // Substituir placeholders
                        const name = msg.pushName ? msg.pushName.split(" ")[0] : 'amigo';
                        let response = flowResult.response.replace(/{name}/g, name);
                        response = response.replace(/{operatorName}/g, 'operador');
                        
                        if (instanceData.sock && instanceData.isReady && response.trim()) {
                            await instanceData.sock.sendMessage(sender, { text: response.trim() });
                            console.log(`✅ Resposta enviada via fluxo JSON para ${sender}: "${response.substring(0, 50)}..."`);
                            
                            // 🗄️ SALVAR RESPOSTA DO BOT NO BANCO
                            await saveBotMessage(response.trim(), managerId, dbContact, activeChat);
                            
                            messageProcessed = true;
                            
                        // 🛒 DEFINIR CONTEXTO BASEADO NO NÓ PROCESSADO
                        if (flowResult.node.id === 'option-1-buy-ticket') {
                            userContexts.set(sender, 'purchase');
                            console.log(`🛒 Contexto de compra definido para ${sender} (${flowResult.node.id})`);
                        }
                            
                                                    // 🏠 LIMPAR CONTEXTO SE VOLTAR AO MENU PRINCIPAL
                        if (flowResult.node.id === 'welcome-message') {
                            if (userContexts.has(sender)) {
                                userContexts.delete(sender);
                                console.log(`🧹 Contexto limpo para ${sender} - voltou ao menu principal (welcome-message)`);
                            }
                        }
                            
                        // 👨‍💼 SE O NÓ É DO TIPO 'HUMAN', TRANSFERIR PARA ATENDIMENTO HUMANO
                        if (flowResult.node.type === 'human') {
                            console.log(`👨‍💼 Nó de transferência humana detectado no FLUXO JSON (${flowResult.node.id}) - iniciando transferência`);
                            // Limpar contexto pois a conversa será transferida
                            userContexts.delete(sender);
                            await delay(1000);

                            // Criar chat humano explicitamente
                            await createHumanChatExplicit(managerId, sender, contactName, dbContact);
                        }
                        }
                    }
                }
            } catch (flowError) {
                console.error('❌ Erro ao processar fluxo JSON:', flowError);
                messageProcessed = false; // Continuar para mensagem padrão
        }
        
        // 🔄 SE NÃO FOI PROCESSADO, USAR APENAS O FALLBACK-AUTO DO JSON
        if (!messageProcessed) {
            console.log(`❓ Mensagem não processada - Sistema totalmente dependente do JSON agora`);
            console.log(`⚠️ Certifique-se de que o fluxo JSON tem um nó 'fallback-auto' configurado!`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem Baileys:', error);
    }
}

// Função auxiliar para salvar mensagem do bot
async function saveBotMessage(response: string, managerId: number, dbContact: any, activeChat: any) {
    try {
        const botMessage = await MessageModel.create({
            manager_id: managerId,
            chat_id: activeChat?.id || null,
            contact_id: dbContact.id,
            sender_type: 'bot',
            content: response,
            message_type: 'text'
        });
        
        console.log(`💾 Resposta do bot salva no banco - ID: ${botMessage.id}`);
    } catch (error) {
        console.error('❌ Erro ao salvar resposta do bot:', error);
    }
}

// Interface para informações de mídia
interface MediaInfo {
    fileName?: string;
    mediaUrl?: string;
    mimeType?: string;
    fileSize?: number;
    mediaType: 'text' | 'image' | 'audio' | 'video' | 'document';
}

// Função para processar e salvar mídias
async function processMediaMessage(msg: WAMessage, messageType: string, managerId: number): Promise<MediaInfo> {
    try {
        const mediaDir = path.join(__dirname, '..', 'uploads', 'media');
        
        // Criar diretório de mídia se não existir
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }
        
        let mediaInfo: MediaInfo = {
            mediaType: 'text'
        };
        
        // Processar diferentes tipos de mídia
        if (messageType === 'imageMessage') {
            const imageMsg = msg.message?.imageMessage;
            if (imageMsg) {
                console.log('📷 Processando imagem...');
                
                // Baixar imagem
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                const fileName = `IMG_${Date.now()}_${managerId}.jpg`;
                const filePath = path.join(mediaDir, fileName);
                
                // Salvar arquivo
                const fileStream = createWriteStream(filePath);
                await pipeline(stream, fileStream);
                
                mediaInfo = {
                    fileName: fileName,
                    mediaUrl: `/uploads/media/${fileName}`,
                    mimeType: imageMsg.mimetype || 'image/jpeg',
                    fileSize: typeof imageMsg.fileLength === 'number' ? imageMsg.fileLength : Number(imageMsg.fileLength) || 0,
                    mediaType: 'image'
                };
                
                console.log(`✅ Imagem salva: ${fileName}`);
            }
        } else if (messageType === 'audioMessage') {
            const audioMsg = msg.message?.audioMessage;
            if (audioMsg) {
                console.log('🎵 Processando áudio...');
                
                const stream = await downloadContentFromMessage(audioMsg, 'audio');
                const extension = audioMsg.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
                const fileName = `AUD_${Date.now()}_${managerId}.${extension}`;
                const filePath = path.join(mediaDir, fileName);
                
                const fileStream = createWriteStream(filePath);
                await pipeline(stream, fileStream);
                
                mediaInfo = {
                    fileName: fileName,
                    mediaUrl: `/uploads/media/${fileName}`,
                    mimeType: audioMsg.mimetype || 'audio/ogg',
                    fileSize: typeof audioMsg.fileLength === 'number' ? audioMsg.fileLength : Number(audioMsg.fileLength) || 0,
                    mediaType: 'audio'
                };
                
                console.log(`✅ Áudio salvo: ${fileName}`);
            }
        } else if (messageType === 'videoMessage') {
            const videoMsg = msg.message?.videoMessage;
            if (videoMsg) {
                console.log('🎥 Processando vídeo...');
                
                const stream = await downloadContentFromMessage(videoMsg, 'video');
                const fileName = `VID_${Date.now()}_${managerId}.mp4`;
                const filePath = path.join(mediaDir, fileName);
                
                const fileStream = createWriteStream(filePath);
                await pipeline(stream, fileStream);
                
                mediaInfo = {
                    fileName: fileName,
                    mediaUrl: `/uploads/media/${fileName}`,
                    mimeType: videoMsg.mimetype || 'video/mp4',
                    fileSize: typeof videoMsg.fileLength === 'number' ? videoMsg.fileLength : Number(videoMsg.fileLength) || 0,
                    mediaType: 'video'
                };
                
                console.log(`✅ Vídeo salvo: ${fileName}`);
            }
        } else if (messageType === 'documentMessage') {
            const docMsg = msg.message?.documentMessage;
            if (docMsg) {
                console.log('📄 Processando documento...');
                
                const stream = await downloadContentFromMessage(docMsg, 'document');
                const originalName = docMsg.fileName || 'document';
                const extension = path.extname(originalName) || '.pdf';
                const fileName = `DOC_${Date.now()}_${managerId}${extension}`;
                const filePath = path.join(mediaDir, fileName);
                
                const fileStream = createWriteStream(filePath);
                await pipeline(stream, fileStream);
                
                mediaInfo = {
                    fileName: originalName,
                    mediaUrl: `/uploads/media/${fileName}`,
                    mimeType: docMsg.mimetype || 'application/pdf',
                    fileSize: typeof docMsg.fileLength === 'number' ? docMsg.fileLength : Number(docMsg.fileLength) || 0,
                    mediaType: 'document'
                };
                
                console.log(`✅ Documento salvo: ${fileName} (${originalName})`);
            }
        }
        
        return mediaInfo;
        
    } catch (error) {
        console.error('❌ Erro ao processar mídia:', error);
        return { mediaType: 'text' };
    }
}

// ⚠️ FUNÇÃO REMOVIDA: processAutoMessagesBaileys
// Toda a lógica hardcodeada foi migrada para nós configuráveis no JSON do fluxo.
// Agora o sistema é 100% configurável via interface web!

// Função para criar/reutilizar chat humano mantendo histórico completo
async function createHumanChatExplicit(managerId: number, sender: string, contactName: string, dbContact: any) {
    try {
        console.log(`👨‍💼 INICIANDO chat humano - Contato: ${contactName} (ID: ${dbContact.id})`);
        
        // 🔍 SEMPRE BUSCAR CHAT EXISTENTE PRIMEIRO PARA MANTER HISTÓRICO
        let existingChat = await HumanChatModel.findAnyByContact(dbContact.id);
        
        let humanChat;
        
        if (existingChat) {
            console.log(`♻️ REUTILIZANDO chat existente ${existingChat.id} - Status: ${existingChat.status || 'NULL'} → pending`);
            
            // Reativar chat existente em vez de criar novo
            const updateQuery = `
                UPDATE human_chats 
                SET status = 'pending', 
                    updated_at = NOW(),
                    operator_id = NULL,
                    assigned_to = NULL,
                    transfer_reason = 'Continuação da conversa anterior'
                WHERE id = ?
            `;
            await executeQuery(updateQuery, [existingChat.id]);
            
            // Buscar chat atualizado
            humanChat = await HumanChatModel.findById(existingChat.id);
            console.log(`✅ Chat ${existingChat.id} reativado com sucesso - Histórico mantido!`);
            
        } else {
            console.log(`🆕 CRIANDO novo chat humano - Nenhum encontrado para contato ${dbContact.id}`);
            
            // Criar novo chat apenas se não existir nenhum
            humanChat = await HumanChatModel.create({
                manager_id: managerId,
                contact_id: dbContact.id,
                status: 'pending',
                transfer_reason: 'Primeira solicitação de atendimento'
            });
            console.log(`💾 Novo chat humano criado - ID: ${humanChat.id}`);
        }
        
        // 🔗 ASSOCIAR MENSAGENS ÓRFÃS AO CHAT (se houver)
        try {
            const updateQuery = `
                UPDATE messages 
                SET chat_id = ? 
                WHERE contact_id = ? 
                  AND manager_id = ? 
                  AND chat_id IS NULL
                  AND sender_type IN ('bot', 'contact')
            `;
            
            const updateResult = await executeQuery(updateQuery, [humanChat!.id, dbContact.id, managerId]);
            const affectedRows = (updateResult as any).affectedRows || 0;
            if (affectedRows > 0) {
                console.log(`🔄 ${affectedRows} mensagens órfãs associadas ao chat humano ${humanChat!.id}`);
            }
        } catch (updateError) {
            console.error('❌ Erro ao associar mensagens órfãs ao chat humano:', updateError);
        }

        // Emitir evento de novo chat
        const frontendChatId = dbContact.phone_number + '@c.us';
        const recentMessages = await MessageModel.findByContact(dbContact.id, 10);
        
        const humanChatRequestData = {
            chatId: frontendChatId,
            customerName: contactName,
            customerPhone: dbContact.phone_number,
            timestamp: new Date(),
            messages: recentMessages || []
        };
        
        console.log(`📨 Emitindo human_chat_requested para sala manager_${managerId}:`, humanChatRequestData);
        (global as any).io.to(`manager_${managerId}`).emit('human_chat_requested', humanChatRequestData);
        
        console.log(`✅ Chat humano criado explicitamente e evento emitido para gestor ${managerId}`);
        
        return humanChat;
    } catch (error) {
        console.error('❌ Erro ao criar chat humano explícito:', error);
        throw error;
    }
}

// Função para transferir conversa para atendimento humano com Baileys
async function transferToHumanBaileys(managerId: number, sender: string, contactName: string, dbContact: any) {
    try {
        console.log(`🧑‍💼 Transferindo conversa para atendimento humano - Contato: ${contactName}`);
        
        let humanChat;
        try {
            const existingChatQuery = `
                SELECT * FROM human_chats 
                WHERE contact_id = ? AND manager_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            const existingChats = await executeQuery(existingChatQuery, [dbContact.id, managerId]) as any[];
            
            if (existingChats && existingChats.length > 0) {
                // Reutilizar chat existente
                humanChat = existingChats[0];
                
                if (humanChat.status === 'finished' || humanChat.status === 'resolved' || humanChat.status === null) {
                    // 🚫 REATIVAÇÃO DE CHAT ENCERRADO DESABILITADA
                    console.log(`🚫 BLOQUEADO: Chat ${humanChat.id} está encerrado (${humanChat.status}) - não será reativado automaticamente`);
                    console.log(`💡 Status permanecerá como: ${humanChat.status}`);
                    // Não reativar chats encerrados
                    // const updateQuery = `
                    //     UPDATE human_chats 
                    //     SET status = 'pending', updated_at = NOW(), operator_id = NULL, assigned_to = NULL
                    //     WHERE id = ?
                    // `;
                    // await executeQuery(updateQuery, [humanChat.id]);
                    // humanChat.status = 'pending';
                    console.log(`🔄 Chat ${humanChat.id} REABERTO - Status: ${humanChat.status || 'NULL'} → pending`);
                    
                    // 🔄 ASSOCIAR MENSAGENS RECENTES SEM CHAT_ID (podem ter surgido após o último encerramento)
                    try {
                        const updateQuery = `
                            UPDATE messages 
                            SET chat_id = ? 
                            WHERE contact_id = ? 
                              AND manager_id = ? 
                              AND chat_id IS NULL
                              AND sender_type IN ('bot', 'contact')
                        `;
                        
                        const updateResult = await executeQuery(updateQuery, [humanChat.id, dbContact.id, managerId]);
                        console.log(`🔄 ${(updateResult as any).affectedRows || 0} mensagens recentes associadas ao chat reaberto ${humanChat.id}`);
                    } catch (updateError) {
                        console.error('❌ Erro ao associar mensagens recentes ao chat reaberto:', updateError);
                    }
                } else {
                    console.log(`♻️ Reutilizando chat humano existente - ID: ${humanChat.id} (Status: ${humanChat.status})`);
                }
            } else {
                // ⚠️ VERIFICAR SE DEVE CRIAR NOVO CHAT HUMANO ⚠️
                // Não criar automaticamente se não há solicitação explícita de atendimento
                console.log(`⚠️ AVISO: Seria criado um novo chat humano, mas vamos verificar se é realmente necessário`);
                console.log(`📝 Motivo: Contact ${dbContact.id} não tem chat humano ativo`);
                
                // Por enquanto, não criar automaticamente - deixar que seja criado apenas por solicitação explícita
                console.log(`🚫 BLOQUEADO: Criação automática de chat humano desabilitada para evitar recreação indesejada`);
                return; // Não criar chat automaticamente
            }
        } catch (error) {
            console.error('❌ Erro ao gerenciar chat humano:', error);
            return;
        }
        
        // Buscar mensagens recentes para contexto
        const recentMessages = await MessageModel.findByContact(dbContact.id, 10);
        
        // Converter chatId para formato compatível com frontend (@c.us)
        const frontendChatId = dbContact.phone_number + '@c.us';
        
        // Preparar dados do evento compatíveis com o frontend
        const eventData = {
            chatId: frontendChatId,
            customerName: contactName,
            customerPhone: dbContact.phone_number,
            lastMessage: 'Solicitou atendimento humano',
            timestamp: new Date(),
            messages: recentMessages || [],
            managerId: managerId,
            humanChatId: humanChat.id,
            contactId: dbContact.id
        };
        
        console.log(`📤 Emitindo evento human_chat_requested para gestor ${managerId}:`, eventData);
        
        // Emitir solicitação de chat humano via Socket.IO
        io.to(`manager_${managerId}`).emit('human_chat_requested', eventData);
        
        // 🚨 ALERTAS INSTANTÂNEOS PARA DASHBOARD - IGUAL AO SERVER.JS ORIGINAL
        io.to(`manager_${managerId}`).emit('dashboard_instant_alert', {
            type: 'new_conversation',
            title: '🔔 Nova Conversa Pendente',
            message: `${contactName} solicitou atendimento`,
            priority: 'high',
            chatId: humanChat.id,
            customerName: contactName,
            customerPhone: dbContact.phone_number,
            timestamp: new Date()
        });
        
        // Enviar alerta para todos os operadores do gestor
        io.to(`manager_${managerId}`).emit('operator_instant_alert', {
            type: 'new_pending_chat',
            title: '🔔 Nova Conversa Disponível',
            message: `${contactName} precisa de atendimento`,
            priority: 'high',
            chatId: humanChat.id,
            customerName: contactName,
            customerPhone: dbContact.phone_number,
            timestamp: new Date()
        });
        
        // Emitir evento para atualizar dashboard com nova conversa
        io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
            type: 'new_chat',
            chatId: humanChat.id,
            customerName: contactName,
            customerPhone: dbContact.phone_number,
            status: 'pending',
            timestamp: new Date(),
            lastMessage: 'Solicitou atendimento humano'
        });
        
        console.log(`✅ Solicitação de chat humano enviada via Socket.IO para gestor ${managerId}`);
        
    } catch (error) {
        console.error('❌ Erro ao transferir para atendimento humano:', error);
    }
}

// ===== ROTAS DA API =====

// Servir arquivos de mídia
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Usar rotas existentes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/documents', documentsRoutes);

// Rota principal para servir o React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ===== SOCKET.IO =====

io.on('connection', async (socket) => {
    console.log('\n=======================================');
    console.log('🔌 NOVA CONEXÃO SOCKET.IO:', socket.id);
    console.log('=======================================\n');
    
    // Handler para entrar na sala do gestor
    socket.on('join_manager_room', (managerId: number) => {
        socket.join(`manager_${managerId}`);
        console.log(`👥 Socket ${socket.id} entrou na sala manager_${managerId}`);
    });
    
    // Handler para inicializar WhatsApp Baileys
    socket.on('initialize_whatsapp_baileys', async (data: { managerId: number; instanceId: number }) => {
        console.log(`🔄 Solicitação para inicializar WhatsApp Baileys - Gestor: ${data.managerId}, Instância: ${data.instanceId}`);
        
        try {
            await initializeWhatsAppClientBaileys(data.managerId, data.instanceId);
        } catch (error) {
            console.error('❌ Erro ao inicializar WhatsApp Baileys:', error);
            socket.emit('initialization_error', {
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    });

    // Handler compatível com o frontend atual (start_instance)
    socket.on('start_instance', async (data: { managerId: number; instanceId: number }) => {
        console.log(`🔄 Solicitação start_instance (compatibilidade) - Gestor: ${data.managerId}, Instância: ${data.instanceId}`);
        
        // Emitir status inicial
        socket.emit('status', {
            connected: false,
            message: 'Inicializando WhatsApp...'
        });
        
        try {
            await initializeWhatsAppClientBaileys(data.managerId, data.instanceId);
        } catch (error) {
            console.error('❌ Erro ao inicializar WhatsApp Baileys:', error);
            socket.emit('initialization_error', {
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
            socket.emit('status', {
                connected: false,
                message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            });
        }
    });
    
    // Handler para obter status da conexão
    socket.on('get_connection_status', (data: { managerId: number }) => {
        const instance = whatsappInstances.get(data.managerId);
        
        socket.emit('connection_status', {
            managerId: data.managerId,
            connected: instance?.isReady || false,
            qrCode: instance?.qrCode,
            messageCount: instance?.messageCount || 0,
            uptime: instance ? Date.now() - instance.startTime.getTime() : 0
        });
    });
    
    // Handler para enviar mensagens do operador
    socket.on('send_operator_message', async (data: {
        chatId: string;
        message: string;
        operatorName?: string;
    }) => {
        console.log('📤 Tentativa de envio de mensagem do operador:', data);
        
        try {
            // Autenticar usuário via token (do socket.handshake.auth.token)
            let token = socket.handshake.auth?.token;
            
            // Fallback para authorization header
            if (!token) {
                const authHeader = socket.handshake.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }
            
            if (!token) {
                console.error('❌ Token não encontrado em auth nem authorization header');
                socket.emit('operator_message_error', { error: 'Token de autenticação não fornecido' });
                return;
            }
            
            console.log('🔍 Token encontrado:', token ? 'Token presente' : 'Token ausente');
            
            // Validar sessionToken usando UserModel.verifySession
            let authenticatedUser;
            try {
                const sessionResult = await UserModel.verifySession(token);
                
                if (!sessionResult) {
                    console.error('❌ SessionToken inválido ou expirado');
                    socket.emit('operator_message_error', { error: 'Token inválido ou expirado' });
                    return;
                }
                
                authenticatedUser = sessionResult.user;
                console.log('✅ SessionToken válido, usuário autenticado:', authenticatedUser?.name);
            } catch (sessionError) {
                console.error('❌ Erro ao validar sessionToken:', sessionError);
                socket.emit('operator_message_error', { error: 'Erro na validação do token' });
                return;
            }
            
            if (!authenticatedUser) {
                socket.emit('operator_message_error', { error: 'Usuário não encontrado' });
                return;
            }
            
            const managerId = authenticatedUser.role === 'operator' ? authenticatedUser.manager_id : authenticatedUser.id;
            const instance = whatsappInstances.get(managerId);
            
            if (!instance || !instance.isReady) {
                socket.emit('operator_message_error', { error: 'WhatsApp não está conectado' });
                return;
            }
            
            // Converter chatId do formato antigo (@c.us) para Baileys (@s.whatsapp.net)
            let baileyChatId = data.chatId;
            if (data.chatId.includes('@c.us')) {
                baileyChatId = data.chatId.replace('@c.us', '@s.whatsapp.net');
                console.log(`🔄 Convertendo chatId: ${data.chatId} → ${baileyChatId}`);
            }
            
            // 👤 INCLUIR NOME DO OPERADOR NA MENSAGEM PARA WHATSAPP
            const operatorName = authenticatedUser.name || 'Operador';
            const messageWithName = `*${operatorName}:* ${data.message}`;
            
            // Enviar mensagem via Baileys
            await instance.sock.sendMessage(baileyChatId, { text: messageWithName });
            
            console.log(`✅ Mensagem do operador ${operatorName} enviada com sucesso via Baileys`);
            
            // 💾 SALVAR MENSAGEM DO OPERADOR NO BANCO DE DADOS
            try {
                // Extrair número de telefone do chatId (suporte a ambos os formatos)
                const phoneNumber = baileyChatId.replace('@s.whatsapp.net', '').replace('@c.us', '');
                console.log(`🔍 Buscando contato com número: ${phoneNumber}`);
                const dbContact = await ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                
                if (dbContact) {
                    const activeChat = await HumanChatModel.findActiveByContact(dbContact.id);
                    
                    const savedMessage = await MessageModel.create({
                        manager_id: managerId,
                        chat_id: activeChat?.id || null,
                        contact_id: dbContact.id,
                        sender_type: 'operator',
                        sender_id: authenticatedUser.id,
                        content: messageWithName, // Salvar no banco com nome do operador
                        message_type: 'text'
                    });
                    
                    console.log(`💾 Mensagem do operador salva no banco - ID: ${savedMessage.id}`);
                    
                    // Emitir confirmação com nome do operador
                    io.to(`manager_${managerId}`).emit('operator_message_saved', {
                        chatId: data.chatId,
                        message: messageWithName, // Enviar mensagem com nome para frontend
                        messageId: savedMessage.id,
                        timestamp: new Date(),
                        operatorName: operatorName
                    });
                }
            } catch (dbError) {
                console.error('❌ Erro ao salvar mensagem do operador no banco:', dbError);
            }
            
            socket.emit('message_sent_confirmation', { 
                success: true,
                chatId: data.chatId,
                message: data.message 
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem do operador via Baileys:', error);
            socket.emit('operator_message_error', { 
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    });
    
    // Evento para marcar chat como resolvido
    socket.on('resolve_chat', (data: any) => {
        console.log(`✅ Chat resolvido: ${data.chatId}`);
        io.emit('chat_resolved', data);
    });

    // Evento para encerrar chat humano (volta para bot) - IGUAL AO SERVER.JS ORIGINAL
    socket.on('finish_human_chat', async (data: any) => {
        console.log(`🔚 Chat encerrado: ${data.contactNumber}`);

        // Extrair managerId do usuário autenticado
        let managerId: number;

        // Tentar extrair managerId do token do socket
        try {
            let token = socket.handshake.auth?.token;
            if (!token) {
                const authHeader = socket.handshake.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (token) {
                // Validar token e extrair usuário
                const sessionResult = await UserModel.verifySession(token);
                if (sessionResult && sessionResult.user) {
                    const authenticatedUser = sessionResult.user;
                    managerId = authenticatedUser.role === 'operator' ? (authenticatedUser.manager_id || 1) : authenticatedUser.id;
                    console.log(`✅ ManagerId extraído do token: ${managerId} (usuário: ${authenticatedUser.name})`);
                } else {
                    managerId = data.managerId || 1; // Fallback
                    console.log(`⚠️ Token inválido, usando fallback managerId: ${managerId}`);
                }
            } else {
                managerId = data.managerId || 1; // Fallback
                console.log(`⚠️ Token não encontrado, usando fallback managerId: ${managerId}`);
            }
        } catch (error) {
            console.error('❌ Erro ao extrair managerId do token:', error);
            managerId = data.managerId || 1; // Fallback
        }

        console.log(`🔍 Usando managerId: ${managerId} para encerrar chat de ${data.contactNumber}`);

        // Atualizar status do chat no banco de dados para 'finished'
        try {
            const phoneNumber = data.contactNumber;
            console.log(`🔍 Buscando contato ${phoneNumber} para manager ${managerId}`);
            const dbContact = await ContactModel.findByPhoneAndManager(phoneNumber, managerId);

            if (dbContact) {
                console.log(`✅ Contato encontrado: ${dbContact.id} - ${dbContact.name}`);
                // Buscar QUALQUER chat (não só ativo) para este contato
                const anyChat = await HumanChatModel.findAnyByContact(dbContact.id);

                if (anyChat) {
                    console.log(`🔄 Atualizando status do chat ${anyChat.id} (${anyChat.status}) para 'finished'`);
                    await executeQuery(
                        'UPDATE human_chats SET status = ?, updated_at = NOW() WHERE id = ?',
                        ['finished', anyChat.id]
                    );
                    console.log(`✅ Status do chat ${anyChat.id} atualizado para 'finished'`);
                } else {
                    console.log(`⚠️ Nenhum chat encontrado para contato ${dbContact.id}`);
                }
            } else {
                console.log(`❌ Contato não encontrado para ${phoneNumber} e manager ${managerId}`);
            }
        } catch (dbError) {
            console.error('❌ Erro ao atualizar status do chat no banco:', dbError);
        }

        // Adicionar à lista de chats encerrados para reativação automática - IGUAL AO SERVER.JS
        const chatId = data.contactNumber + '@c.us'; // Formato original

        let managerFinishedChats = finishedChats.get(managerId) || new Set();
        managerFinishedChats.add(chatId);
        finishedChats.set(managerId, managerFinishedChats);

        console.log(`📝 Chat ${chatId} adicionado à lista de encerrados para gestor ${managerId}`);

        // Emitir para frontend
        io.emit('chat_finished', {
            chatId: chatId,
            contactNumber: data.contactNumber,
            timestamp: new Date()
        });
    });

    // Evento para transferir chat
    socket.on('transfer_chat', (data: any) => {
        console.log(`🔄 Chat transferido de ${data.fromOperator} para ${data.toOperator}: ${data.contactNumber}`);
        // Notificar todos os operadores sobre a transferência
        io.emit('chat_transferred', {
            chatId: data.chatId,
            contactNumber: data.contactNumber,
            fromOperator: data.fromOperator,
            toOperator: data.toOperator,
            reason: data.reason,
            timestamp: new Date()
        });
    });

    // Evento de teste para debug
    socket.on('test_connection', (data: any) => {
        console.log('🧪 Teste de conexão recebido:', data);
        socket.emit('test_response', { 
            success: true, 
            message: 'Conexão Baileys funcionando!',
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket desconectado: ${socket.id}`);
    });
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====

const PORT = process.env.PORT || 3001;

async function startServer() {
    await initializeSystem();
    
    server.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 SERVIDOR BAILEYS INICIADO COM SUCESSO!');
        console.log(`📡 Servidor rodando na porta ${PORT}`);
        console.log(`🌐 Acesse: http://localhost:${PORT}`);
        console.log('📱 WhatsApp Bot com Baileys pronto!');
        console.log('='.repeat(50) + '\n');
    });
}

// Tratar fechamento gracioso
process.on('SIGINT', async () => {
    console.log('\n🔄 Fechando servidor...');
    
    // Fechar todas as conexões WhatsApp
    for (const [managerId, instance] of whatsappInstances) {
        try {
            await instance.sock.logout();
            console.log(`✅ WhatsApp desconectado para gestor ${managerId}`);
        } catch (error) {
            console.error(`❌ Erro ao desconectar WhatsApp para gestor ${managerId}:`, error);
        }
    }
    
    // Fechar conexões do banco
    await closeDatabaseConnection();
    
    console.log('✅ Servidor fechado com sucesso!');
    process.exit(0);
});

// Iniciar servidor
startServer().catch(err => {
    console.error('💥 ERRO ao iniciar o servidor:', err);
    process.exit(1);
});
