import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { Client } from 'whatsapp-web.js';

// Carregar variáveis de ambiente
dotenv.config();

// Importar configurações e modelos
import { createDatabaseIfNotExists, connectDatabase, executeQuery } from './config/database';
import { runMigrations } from './migrations/migrations';
import { UserModel } from './models/User';
import { WhatsAppInstanceModel } from './models/WhatsAppInstance';
import { MessageProjectModel, AutoMessageModel } from './models/MessageProject';
import { ContactModel, MessageModel, HumanChatModel } from './models/Message';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import whatsappRoutes from './routes/whatsapp';
import messageRoutes from './routes/messages';
import deviceRoutes from './routes/devices';
import operatorRoutes from './routes/operators';

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

// Gerenciamento de instâncias WhatsApp por gestor
const whatsappInstances = new Map<number, {
    client: Client;
    isReady: boolean;
    messageCount: number;
    startTime: Date;
}>();

// ===== INICIALIZAÇÃO DO SISTEMA =====

async function initializeSystem() {
    try {
        console.log('🚀 Inicializando sistema...');
        
        // 1. Criar database se não existir
        await createDatabaseIfNotExists();
        
        // 2. Conectar ao banco de dados
        await connectDatabase();
        
        // 3. Executar migrations
        await runMigrations();
        
        // 4. Criar usuário admin padrão se não existir
        await UserModel.createDefaultAdmin();
        
        // 5. Auto-inicializar instâncias WhatsApp conectadas
        await autoInitializeWhatsAppInstances();
        
        console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        process.exit(1);
    }
}

// Função para auto-inicializar instâncias WhatsApp que estavam conectadas
async function autoInitializeWhatsAppInstances() {
    try {
        console.log('🔄 Verificando instâncias WhatsApp existentes...');
        
        // Buscar todas as instâncias que estavam conectadas
        const connectedInstances = await WhatsAppInstanceModel.findAllConnected();
        
        if (connectedInstances.length === 0) {
            console.log('📱 Nenhuma instância WhatsApp conectada encontrada');
            return;
        }
        
        console.log(`📱 Encontradas ${connectedInstances.length} instância(s) conectada(s). Reinicializando...`);
        
        // Marcar todas como 'connecting' primeiro
        for (const instance of connectedInstances) {
            await WhatsAppInstanceModel.updateStatus(instance.id, 'connecting');
        }
        
        // Inicializar cada uma com delay para evitar sobrecarga
        for (const instance of connectedInstances) {
            try {
                console.log(`🚀 Reinicializando instância ${instance.id} para gestor ${instance.manager_id}...`);
                await initializeWhatsAppClient(instance.manager_id, instance.id);
                
                // Delay entre inicializações
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`❌ Erro ao reinicializar instância ${instance.id}:`, error);
                await WhatsAppInstanceModel.updateStatus(instance.id, 'error');
            }
        }
        
        console.log('✅ Auto-inicialização de instâncias WhatsApp concluída');
    } catch (error) {
        console.error('❌ Erro na auto-inicialização de instâncias WhatsApp:', error);
    }
}

// ===== GERENCIAMENTO DE INSTÂNCIAS WHATSAPP =====

// Função para inicializar cliente WhatsApp para um gestor específico
async function initializeWhatsAppClient(managerId: number, instanceId: number): Promise<void> {
    try {
        // Verificar se já existe instância ativa
        if (whatsappInstances.has(managerId)) {
            const existing = whatsappInstances.get(managerId);
            if (existing?.client) {
                existing.client.destroy();
            }
        }

        const client = new Client({
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        // Criar registro da instância
        const instanceData = {
            client,
            isReady: false,
            messageCount: 0,
            startTime: new Date()
        };

        whatsappInstances.set(managerId, instanceData);

        // Atualizar status no banco
        await WhatsAppInstanceModel.updateStatus(instanceId, 'connecting');

        // Evento para gerar QR Code
        client.on('qr', async (qr: string) => {
            console.log(`🔄 QR Code gerado para gestor ${managerId}`);
            try {
                const qrCodeData = await QRCode.toDataURL(qr);
                
                // Salvar QR no banco
                await WhatsAppInstanceModel.updateStatus(instanceId, 'connecting', {
                    qr_code: qrCodeData
                });
                
                // Emitir para o gestor específico
                io.to(`manager_${managerId}`).emit('qr', qrCodeData);
                io.to(`manager_${managerId}`).emit('status', { 
                    connected: false, 
                    message: 'QR Code gerado - Escaneie com seu WhatsApp' 
                } as ConnectionStatus);
            } catch (error) {
                console.error('❌ Erro ao gerar QR Code:', error);
            }
        });

        // Evento quando o cliente está pronto
        client.on('ready', async () => {
            console.log(`✅ WhatsApp conectado para gestor ${managerId}!`);
            
            instanceData.isReady = true;
            instanceData.startTime = new Date();
            
            // Obter informações do telefone
            const info = client.info;
            const phoneNumber = info.wid.user;
            
            // Atualizar no banco
            await WhatsAppInstanceModel.updateStatus(instanceId, 'connected', {
                phone_number: phoneNumber,
                qr_code: undefined,
                connected_at: new Date()
            });
            
            // Emitir para o gestor específico
            console.log(`📤 Emitindo status 'conectado' para sala manager_${managerId}`);
            io.to(`manager_${managerId}`).emit('status', { 
                connected: true, 
                message: 'WhatsApp conectado com sucesso!' 
            } as ConnectionStatus);
            io.to(`manager_${managerId}`).emit('qr', null);
            console.log(`📤 Eventos emitidos para gestor ${managerId}`);
        });

        // Evento quando o cliente é desconectado
        client.on('disconnected', async (reason: string) => {
            console.log(`❌ WhatsApp desconectado para gestor ${managerId}:`, reason);
            
            instanceData.isReady = false;
            
            // Atualizar no banco
            await WhatsAppInstanceModel.updateStatus(instanceId, 'disconnected');
            
            // Emitir para o gestor específico
            io.to(`manager_${managerId}`).emit('status', { 
                connected: false, 
                message: `WhatsApp desconectado: ${reason}` 
            } as ConnectionStatus);
        });

        // Evento de erro de autenticação
        client.on('auth_failure', async (msg: string) => {
            console.error(`❌ Falha na autenticação para gestor ${managerId}:`, msg);
            
            // Atualizar no banco
            await WhatsAppInstanceModel.updateStatus(instanceId, 'error');
            
            // Emitir para o gestor específico
            io.to(`manager_${managerId}`).emit('status', { 
                connected: false, 
                message: 'Falha na autenticação - Tente novamente' 
            } as ConnectionStatus);
        });

        // Sistema de mensagens automatizadas (chatbot)
        client.on('message', async (msg: any) => {
            if (!msg.from.endsWith('@c.us')) return;

            instanceData.messageCount++;
            
            // Atualizar atividade da instância
            await WhatsAppInstanceModel.updateActivity(instanceId);

            const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

            try {
                // 🗄️ SALVAR MENSAGEM RECEBIDA NO BANCO DE DADOS
                console.log(`💾 Salvando mensagem recebida de ${msg.from}: "${msg.body}"`);
                
                // Criar ou encontrar contato
                const contact = await msg.getContact();
                const contactName = contact.pushname || contact.number;
                const phoneNumber = msg.from.replace('@c.us', '');
                
                const dbContact = await ContactModel.findOrCreate({
                    manager_id: managerId,
                    phone_number: phoneNumber,
                    name: contactName
                });

                // Verificar se existe chat humano ativo
                const activeChat = await HumanChatModel.findActiveByContact(dbContact.id);
                
                // Salvar mensagem recebida no banco
                const savedMessage = await MessageModel.create({
                    manager_id: managerId,
                    chat_id: activeChat?.id || null,
                    contact_id: dbContact.id,
                    whatsapp_message_id: msg.id._serialized || null,
                    sender_type: 'contact',
                    content: msg.body,
                    message_type: msg.type || 'text'
                });

                console.log(`✅ Mensagem recebida salva no banco - ID: ${savedMessage.id}`);

                // Emitir estatísticas das mensagens para o dashboard do gestor
                io.to(`manager_${managerId}`).emit('message_received', {
                    from: msg.from,
                    body: msg.body,
                    timestamp: new Date(),
                    contact_name: contactName,
                    message_id: savedMessage.id
                } as MessageEvent);

                // Se existe chat humano ativo, não processar mensagens automáticas
                if (activeChat) {
                    console.log(`👤 Mensagem redirecionada para chat humano - ID: ${activeChat.id}`);
                    
                    // Emitir mensagem para o chat humano
                    io.to(`manager_${managerId}`).emit('customer_message', {
                        chatId: msg.from,
                        message: msg.body,
                        timestamp: new Date(),
                        customerName: contactName,
                        contactId: dbContact.id,
                        messageId: savedMessage.id,
                        humanChatId: activeChat.id
                    });
                    
                    console.log(`📨 Evento customer_message emitido para gestor ${managerId} - Chat ID: ${activeChat.id}`);
                    return; // Não processar mensagens automáticas
                }

                // Buscar projeto padrão do gestor no banco de dados
                console.log(`🔍 Buscando projeto padrão para gestor ${managerId}`);
                const defaultProject = await MessageProjectModel.findDefaultByManagerId(managerId, true);
            
            if (!defaultProject || !defaultProject.messages) {
                console.log(`⚠️  Nenhum projeto padrão encontrado para gestor ${managerId} - criando projeto padrão`);
                
                // Criar projeto padrão se não existir
                try {
                    const newProject = await MessageProjectModel.create({
                        manager_id: managerId,
                        name: 'Mensagens Padrão',
                        description: 'Projeto criado automaticamente com mensagens padrão',
                        is_default: true
                    });

                    // Criar algumas mensagens padrão
                    const defaultMessages = [
                        {
                            trigger_words: ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite'],
                            response_text: 'Olá! {name} Como posso ajudá-lo hoje? Digite uma das opções:\n\n1 - Informações\n2 - Suporte\n3 - Atendimento Humano',
                            order_index: 1
                        },
                        {
                            trigger_words: ['1', 'informações', 'info'],
                            response_text: 'Aqui estão as informações disponíveis. Como posso ajudar você especificamente?',
                            order_index: 2
                        },
                        {
                            trigger_words: ['2', 'suporte', 'ajuda'],
                            response_text: 'Estou aqui para ajudar! Descreva sua dúvida ou problema.',
                            order_index: 3
                        },
                        {
                            trigger_words: ['3', 'humano', 'atendente', 'operador', 'pessoa'],
                            response_text: 'Transferindo você para um atendente humano. Por favor, aguarde...',
                            order_index: 4
                        }
                    ];

                    for (const msgData of defaultMessages) {
                        await AutoMessageModel.create({
                            project_id: newProject.id,
                            trigger_words: msgData.trigger_words,
                            response_text: msgData.response_text,
                            is_active: true,
                            order_index: msgData.order_index
                        });
                    }

                    console.log(`✅ Projeto padrão criado para gestor ${managerId}`);
                    
                    // Buscar novamente o projeto com as mensagens
                    const createdProject = await MessageProjectModel.findDefaultByManagerId(managerId, true);
                    if (!createdProject?.messages) {
                        console.log(`❌ Erro ao buscar projeto criado para gestor ${managerId}`);
                        return;
                    }
                    
                    // Usar as mensagens do projeto criado
                    const activeMessages = createdProject.messages.filter(msg => msg.is_active);
                    await processAutoMessages(msg, activeMessages, managerId, client, instanceData, delay);
                    
                } catch (error) {
                    console.error(`❌ Erro ao criar projeto padrão para gestor ${managerId}:`, error);
                    return;
                }
            } else {
                console.log(`✅ Projeto padrão encontrado: "${defaultProject.name}" com ${defaultProject.messages.length} mensagens`);
                const activeMessages = defaultProject.messages.filter(msg => msg.is_active);
                await processAutoMessages(msg, activeMessages, managerId, client, instanceData, delay);
            }
            
            } catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
            }
        });

        // Inicializar o cliente
        client.initialize();

    } catch (error) {
        console.error(`❌ Erro ao inicializar WhatsApp para gestor ${managerId}:`, error);
        await WhatsAppInstanceModel.updateStatus(instanceId, 'error');
        throw error;
    }
}

// Função para processar mensagens automáticas
async function processAutoMessages(
    msg: any, 
    activeMessages: any[], 
    managerId: number, 
    client: any, 
    instanceData: any, 
    delay: (ms: number) => Promise<unknown>
) {
    let messageProcessed = false;

    for (const autoMessage of activeMessages) {
        // Verificar se alguma palavra-chave corresponde
        const messageMatches = autoMessage.trigger_words.some((trigger: string) => 
            msg.body.toLowerCase().includes(trigger.toLowerCase()) ||
            msg.body.toLowerCase() === trigger.toLowerCase()
        );

        if (messageMatches) {
            console.log(`🎯 Mensagem correspondente encontrada: "${msg.body}" -> "${autoMessage.response_text.substring(0, 50)}..."`);
            
            // Verificar se é uma solicitação de atendimento humano
            const isHumanRequest = autoMessage.trigger_words.some((trigger: string) => 
                ['operador', 'atendente', 'humano', 'pessoa'].includes(trigger.toLowerCase())
            );

            if (isHumanRequest) {
                // Transferir para atendimento humano
                await transferToHuman(managerId, msg, autoMessage.response_text);
                messageProcessed = true;
                break;
            }

            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);

            // Processar a resposta (substituir variáveis se necessário)
            let response = autoMessage.response_text;
            
            // Substituir {name} pelo nome do contato
            if (response.includes('{name}')) {
                const contact = await msg.getContact();
                const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                response = response.replace(/{name}/g, name);
            }

            // Verificar se o cliente está disponível antes de enviar
            if (client && instanceData.isReady) {
                await client.sendMessage(msg.from, response);
                await delay(1000);
                console.log(`✅ Resposta enviada para ${msg.from}: "${response.substring(0, 50)}..."`);
                
                // 🗄️ SALVAR RESPOSTA DO BOT NO BANCO DE DADOS
                try {
                    const phoneNumber = msg.from.replace('@c.us', '');
                    const dbContact = await ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                    
                    if (dbContact) {
                        // Verificar se existe chat humano ativo
                        const activeChat = await HumanChatModel.findActiveByContact(dbContact.id);
                        
                        const botMessage = await MessageModel.create({
                            manager_id: managerId,
                            chat_id: activeChat?.id || null,
                            contact_id: dbContact.id,
                            sender_type: 'bot',
                            content: response,
                            message_type: 'text'
                        });
                        
                        console.log(`💾 Resposta do bot salva no banco - ID: ${botMessage.id}`);
                    }
                } catch (error) {
                    console.error('❌ Erro ao salvar resposta do bot:', error);
                }
            }
            messageProcessed = true;
            break;
        }
    }

    // Log da mensagem processada
    if (messageProcessed) {
        console.log(`🤖 Mensagem automática processada para ${msg.from} pelo gestor ${managerId}`);
    } else {
        console.log(`❓ Nenhuma mensagem automática correspondente para: "${msg.body}"`);
    }
}

// Função para transferir conversa para atendimento humano
async function transferToHuman(managerId: number, msg: any, botResponse: string) {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    try {
        const contact = await msg.getContact();
        const contactName = contact.pushname || contact.number;
        const contactNumber = msg.from;
        const phoneNumber = contactNumber.replace('@c.us', '');
        
        // 🗄️ CRIAR/ENCONTRAR CONTATO NO BANCO
        const dbContact = await ContactModel.findOrCreate({
            manager_id: managerId,
            phone_number: phoneNumber,
            name: contactName
        });

        // 🗄️ CRIAR CHAT HUMANO NO BANCO
        const humanChat = await HumanChatModel.create({
            manager_id: managerId,
            contact_id: dbContact.id,
            status: 'pending',
            transfer_reason: 'Solicitação do cliente'
        });

        console.log(`💾 Chat humano criado no banco - ID: ${humanChat.id}`);
        
        // 🔗 VINCULAR MENSAGENS ANTERIORES AO CHAT HUMANO
        try {
            const updateQuery = `
                UPDATE messages 
                SET chat_id = ? 
                WHERE contact_id = ? AND manager_id = ? AND chat_id IS NULL
            `;
            const updateResult = await executeQuery(updateQuery, [humanChat.id, dbContact.id, managerId]);
            console.log(`🔗 Mensagens anteriores vinculadas ao chat humano - Chat ID: ${humanChat.id}`);
        } catch (linkError) {
            console.error('❌ Erro ao vincular mensagens anteriores:', linkError);
        }
        
        // Enviar mensagem do bot primeiro
        const chat = await msg.getChat();
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        
        let response = botResponse;
        if (response.includes('{name}')) {
            const name = contactName ? contactName.split(" ")[0] : 'amigo';
            response = response.replace(/{name}/g, name);
        }
        
        const instance = whatsappInstances.get(managerId);
        if (instance?.client && instance.isReady) {
            await instance.client.sendMessage(contactNumber, response);
            await delay(1000);
            
            // 🗄️ SALVAR MENSAGEM DE TRANSFERÊNCIA DO BOT
            const transferMessage = await MessageModel.create({
                manager_id: managerId,
                chat_id: humanChat.id,
                contact_id: dbContact.id,
                sender_type: 'bot',
                content: response,
                message_type: 'text'
            });
            
            console.log(`💾 Mensagem de transferência salva - ID: ${transferMessage.id}`);
        }
        
        // Notificar o dashboard sobre a nova solicitação (para o gestor específico)
        const eventData = {
            chatId: contactNumber,
            customerName: contactName,
            customerPhone: phoneNumber,
            lastMessage: 'Solicitou atendimento humano',
            timestamp: new Date(),
            managerId: managerId,
            humanChatId: humanChat.id,
            contactId: dbContact.id
        };
        
        console.log(`📤 Emitindo evento human_chat_requested para gestor ${managerId}:`, eventData);
        
        // Emitir para o gestor específico
        io.to(`manager_${managerId}`).emit('human_chat_requested', eventData);
        
        console.log(`🔄 Conversa transferida para humano: ${contactName} (${contactNumber}) - Gestor: ${managerId} - Chat ID: ${humanChat.id}`);
        
    } catch (error) {
        console.error('Erro ao transferir para humano:', error);
    }
}

// ===== ROTAS DA API =====

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de usuários
app.use('/api/users', userRoutes);

// Rotas de WhatsApp
app.use('/api/whatsapp', whatsappRoutes);

// Rotas de mensagens
app.use('/api/messages', messageRoutes);

// Rotas de dispositivos
app.use('/api/devices', deviceRoutes);

// Rotas de operadores
app.use('/api/operators', operatorRoutes);

// Rota de status do sistema
app.get('/api/status', async (req, res) => {
    try {
        const stats = await WhatsAppInstanceModel.getStats();
        res.json({
            system: 'online',
            database: 'connected',
            instances: stats,
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            system: 'error',
            database: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Rota principal (React App)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ===== SOCKET.IO EVENTS =====

io.on('connection', async (socket) => {
    console.log('🔗 Cliente conectado ao socket:', socket.id);
    
    // Autenticar socket e extrair usuário do token
    let authenticatedUser: any = null;
    
    try {
        const token = socket.handshake.auth?.token;
        if (token) {
            const payload = UserModel.verifyToken(token);
            if (payload) {
                authenticatedUser = await UserModel.findById(payload.id);
                console.log(`🔑 Socket autenticado para usuário: ${authenticatedUser?.name} (ID: ${authenticatedUser?.id})`);
            }
        }
    } catch (error) {
        console.error('❌ Erro na autenticação do socket:', error);
    }

    // Evento para entrar em sala do gestor
    socket.on('join_manager_room', (managerId: number) => {
        socket.join(`manager_${managerId}`);
        console.log(`👥 Socket ${socket.id} entrou na sala do gestor ${managerId}`);
    });

    // Evento para sair da sala do gestor
    socket.on('leave_manager_room', (managerId: number) => {
        socket.leave(`manager_${managerId}`);
        console.log(`👥 Socket ${socket.id} saiu da sala do gestor ${managerId}`);
    });

    // Evento para iniciar nova instância
    socket.on('start_instance', async (data: { managerId: number; instanceId: number }) => {
        try {
            console.log('📨 Dados recebidos no socket:', data);
            console.log('🔍 Tipo dos dados:', typeof data);
            console.log('🔍 managerId:', data?.managerId, 'tipo:', typeof data?.managerId);
            console.log('🔍 instanceId:', data?.instanceId, 'tipo:', typeof data?.instanceId);
            
            if (!data || !data.managerId || !data.instanceId) {
                console.error('❌ Dados inválidos recebidos:', data);
                socket.emit('status', { 
                    connected: false, 
                    message: 'Dados inválidos para iniciar instância' 
                } as ConnectionStatus);
                return;
            }
            
            console.log(`🚀 Iniciando instância ${data.instanceId} para gestor ${data.managerId}...`);
            
            // Entrar na sala do gestor para receber eventos específicos
            socket.join(`manager_${data.managerId}`);
            console.log(`👥 Socket ${socket.id} entrou na sala do gestor ${data.managerId}`);
            
            socket.emit('status', { 
                connected: false, 
                message: 'Inicializando WhatsApp...' 
            } as ConnectionStatus);
            
            await initializeWhatsAppClient(data.managerId, data.instanceId);
        } catch (error) {
            console.error('Erro ao iniciar instância:', error);
            socket.emit('status', { 
                connected: false, 
                message: 'Erro ao inicializar WhatsApp' 
            } as ConnectionStatus);
        }
    });

    // Evento para parar instância
    socket.on('stop_instance', async (data: { managerId: number; instanceId: number }) => {
        try {
            const instance = whatsappInstances.get(data.managerId);
            if (instance?.client) {
                console.log(`⏹️  Parando instância para gestor ${data.managerId}...`);
                instance.client.destroy();
                whatsappInstances.delete(data.managerId);
                
                // Atualizar no banco
                await WhatsAppInstanceModel.updateStatus(data.instanceId, 'disconnected');
                
                socket.emit('status', { 
                    connected: false, 
                    message: 'WhatsApp desconectado' 
                } as ConnectionStatus);
            }
        } catch (error) {
            console.error('Erro ao parar instância:', error);
        }
    });

    // Handler para enviar mensagens do operador
    socket.on('send_operator_message', async (data: {
        chatId: string;
        message: string;
        operatorName?: string;
    }) => {
        try {
            // Usar o usuário autenticado do socket em vez do managerId enviado pelo frontend
            if (!authenticatedUser) {
                console.error('❌ Socket não autenticado para send_operator_message');
                socket.emit('operator_message_error', {
                    error: 'Socket não autenticado - faça login novamente'
                });
                return;
            }
            
            // Validar dados recebidos
            if (!data || !data.chatId || !data.message) {
                console.error('❌ Dados inválidos recebidos para send_operator_message:', data);
                socket.emit('operator_message_error', {
                    error: 'Dados inválidos - chatId e message são obrigatórios'
                });
                return;
            }
            
            // Determinar qual instância WhatsApp usar
            let managerId = authenticatedUser.id;
            
            // Se for operador, usar a instância do manager
            if (authenticatedUser.role === 'operator' && authenticatedUser.manager_id) {
                managerId = authenticatedUser.manager_id;
            }
            
            const instance = whatsappInstances.get(managerId);
            
            console.log(`🔍 Debug - Usuário autenticado ${authenticatedUser.id} (${authenticatedUser.name}):`);
            console.log(`   - Papel: ${authenticatedUser.role}`);
            console.log(`   - Manager ID: ${authenticatedUser.manager_id}`);
            console.log(`   - Instância a usar: Manager ${managerId}`);
            console.log(`   - Instância existe: ${!!instance}`);
            console.log(`   - Cliente existe: ${!!instance?.client}`);
            console.log(`   - isReady: ${instance?.isReady}`);
            console.log(`   - Instâncias ativas:`, Array.from(whatsappInstances.keys()));
            
            if (!instance?.client || !instance.isReady) {
                socket.emit('operator_message_error', {
                    error: `WhatsApp client não está disponível para o manager ${managerId}`
                });
                throw new Error(`WhatsApp client não está disponível para o manager ${managerId}`);
            }
            
            console.log(`📤 Enviando mensagem do operador para ${data.chatId} (Gestor: ${managerId}): ${data.message}`);
            
            // Garantir que o chatId está no formato correto
            let targetChatId = data.chatId;
            if (!targetChatId.includes('@')) {
                targetChatId = targetChatId + '@c.us';
            }
            
            const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
            await delay(1000);
            
            // Formatar mensagem com nome do operador
            const operatorName = data.operatorName || 'Operador';
            const formattedMessage = `*${operatorName}:* ${data.message}`;
            
            // Enviar mensagem
            await instance.client.sendMessage(targetChatId, formattedMessage);
            
            console.log(`✅ Mensagem do operador enviada com sucesso`);
            
            // 💾 SALVAR MENSAGEM DO OPERADOR NO BANCO DE DADOS
            try {
                // Buscar contato pelo número de telefone
                const phoneNumber = data.chatId.replace('@c.us', '');
                const dbContact = await ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                
                if (dbContact) {
                    // Buscar chat humano ativo
                    const activeChat = await HumanChatModel.findActiveByContact(dbContact.id);
                    
                    // Salvar mensagem do operador no banco
                    const savedMessage = await MessageModel.create({
                        manager_id: managerId,
                        chat_id: activeChat?.id || null,
                        contact_id: dbContact.id,
                        sender_type: 'operator',
                        sender_id: authenticatedUser.id,
                        content: data.message, // Mensagem sem o prefixo "Operador:"
                        message_type: 'text'
                    });
                    
                    console.log(`💾 Mensagem do operador salva no banco - ID: ${savedMessage.id}`);
                    
                    // Emitir mensagem para o painel do operador
                    io.to(`manager_${managerId}`).emit('operator_message_saved', {
                        chatId: data.chatId,
                        message: data.message,
                        messageId: savedMessage.id,
                        timestamp: new Date(),
                        operatorName: data.operatorName || 'Operador'
                    });
                } else {
                    console.error(`❌ Contato não encontrado para telefone: ${phoneNumber}`);
                }
            } catch (dbError) {
                console.error('❌ Erro ao salvar mensagem do operador no banco:', dbError);
            }
            
            // Confirmar envio
            socket.emit('message_sent_confirmation', {
                chatId: data.chatId,
                message: data.message,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem do operador:', error);
            socket.emit('message_send_error', {
                error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado do socket:', socket.id);
    });
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====

const PORT = process.env.PORT || 3000;

// Inicializar sistema e depois iniciar servidor
initializeSystem().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📱 Acesse o sistema em: http://localhost:${PORT}`);
        console.log('🔑 Login admin padrão: admin@admin.com / admin123');
        console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
    });
}).catch((error) => {
    console.error('❌ Erro fatal ao inicializar sistema:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Encerrando servidor...');
    
    // Fechar todas as instâncias do WhatsApp
    for (const [managerId, instance] of whatsappInstances) {
        try {
            if (instance.client) {
                await instance.client.destroy();
            }
        } catch (error) {
            console.error(`Erro ao fechar instância do gestor ${managerId}:`, error);
        }
    }
    
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});
