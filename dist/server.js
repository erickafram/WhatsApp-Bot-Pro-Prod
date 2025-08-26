"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const qrcode_1 = __importDefault(require("qrcode"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fs = __importStar(require("fs"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
// Importar configurações e modelos
const database_1 = require("./config/database");
const migrations_1 = require("./migrations/migrations");
const User_1 = require("./models/User");
const WhatsAppInstance_1 = require("./models/WhatsAppInstance");
const MessageProject_1 = require("./models/MessageProject");
const Message_1 = require("./models/Message");
const UserSession_1 = require("./models/UserSession");
// Importar rotas
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const messages_1 = __importDefault(require("./routes/messages"));
const devices_1 = __importDefault(require("./routes/devices"));
const operators_1 = __importDefault(require("./routes/operators"));
const managers_1 = __importDefault(require("./routes/managers"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware para disponibilizar Socket.IO nas rotas
app.use((req, res, next) => {
    req.io = io;
    next();
});
// Servir arquivos estáticos do React build
app.use(express_1.default.static(path_1.default.join(__dirname, '../client/dist')));
// Gerenciamento de instâncias WhatsApp por gestor
const whatsappInstances = new Map();
// Disponibilizar instâncias globalmente para uso em outros módulos
global.whatsappInstances = whatsappInstances;
global.io = io;
let cachedFlow = null;
// Função para carregar fluxo JSON
function loadFlowFromJSON() {
    try {
        if (cachedFlow)
            return cachedFlow;
        const flowPath = path_1.default.join(__dirname, '..', 'fluxo-kleiber-passagens-tocantins.json');
        if (!fs.existsSync(flowPath)) {
            console.log('⚠️ Arquivo de fluxo JSON não encontrado:', flowPath);
            return null;
        }
        const flowContent = fs.readFileSync(flowPath, 'utf8');
        cachedFlow = JSON.parse(flowContent);
        console.log('✅ Fluxo JSON carregado com sucesso!');
        return cachedFlow;
    }
    catch (error) {
        console.error('❌ Erro ao carregar fluxo JSON:', error);
        return null;
    }
}
// Função para processar mensagem usando fluxo JSON
function processMessageWithFlow(message, flowData) {
    if (!flowData)
        return { node: null, response: null };
    const messageText = message.toLowerCase().trim();
    // Buscar nó que corresponde à mensagem
    for (const node of flowData.nodes) {
        if (node.data.triggers) {
            // Verificar se algum trigger corresponde
            const triggerMatch = node.data.triggers.some(trigger => messageText.includes(trigger.toLowerCase()) ||
                messageText === trigger.toLowerCase());
            if (triggerMatch && node.data.active === 1) {
                console.log(`🎯 Nó encontrado no fluxo JSON: ${node.id} - ${node.data.title}`);
                return {
                    node,
                    response: node.data.response || null
                };
            }
        }
    }
    return { node: null, response: null };
}
// ===== INICIALIZAÇÃO DO SISTEMA =====
async function initializeSystem() {
    try {
        console.log('🚀 Inicializando sistema...');
        // 1. Criar database se não existir
        await (0, database_1.createDatabaseIfNotExists)();
        // 2. Conectar ao banco de dados
        await (0, database_1.connectDatabase)();
        // 3. Executar migrations
        await (0, migrations_1.runMigrations)();
        // 4. Criar usuário admin padrão se não existir
        await User_1.UserModel.createDefaultAdmin();
        // 5. Auto-inicializar instâncias WhatsApp conectadas
        await autoInitializeWhatsAppInstances();
        console.log('✅ Sistema inicializado com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        process.exit(1);
    }
}
// Função para auto-inicializar instâncias WhatsApp que estavam conectadas
async function autoInitializeWhatsAppInstances() {
    try {
        console.log('🔄 Verificando instâncias WhatsApp existentes...');
        // Buscar todas as instâncias que estavam conectadas
        const connectedInstances = await WhatsAppInstance_1.WhatsAppInstanceModel.findAllConnected();
        if (connectedInstances.length === 0) {
            console.log('📱 Nenhuma instância WhatsApp conectada encontrada');
            return;
        }
        console.log(`📱 Encontradas ${connectedInstances.length} instância(s) conectada(s). Reinicializando...`);
        // Marcar todas como 'connecting' primeiro
        for (const instance of connectedInstances) {
            await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instance.id, 'connecting');
        }
        // Inicializar cada uma com delay para evitar sobrecarga
        for (const instance of connectedInstances) {
            try {
                console.log(`🚀 Reinicializando instância ${instance.id} para gestor ${instance.manager_id}...`);
                await initializeWhatsAppClient(instance.manager_id, instance.id);
                // Delay entre inicializações
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            catch (error) {
                console.error(`❌ Erro ao reinicializar instância ${instance.id}:`, error);
                await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instance.id, 'error');
            }
        }
        console.log('✅ Auto-inicialização de instâncias WhatsApp concluída');
    }
    catch (error) {
        console.error('❌ Erro na auto-inicialização de instâncias WhatsApp:', error);
    }
}
// ===== GERENCIAMENTO DE INSTÂNCIAS WHATSAPP =====
// Função para inicializar cliente WhatsApp para um gestor específico
async function initializeWhatsAppClient(managerId, instanceId) {
    try {
        // Verificar se já existe instância ativa
        if (whatsappInstances.has(managerId)) {
            const existing = whatsappInstances.get(managerId);
            if (existing?.client) {
                existing.client.destroy();
            }
        }
        const client = new whatsapp_web_js_1.Client({
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
        await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'connecting');
        // Evento para gerar QR Code
        client.on('qr', async (qr) => {
            console.log(`🔄 QR Code gerado para gestor ${managerId}`);
            try {
                const qrCodeData = await qrcode_1.default.toDataURL(qr);
                // Salvar QR no banco
                await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'connecting', {
                    qr_code: qrCodeData
                });
                // Emitir para o gestor específico
                io.to(`manager_${managerId}`).emit('qr', qrCodeData);
                io.to(`manager_${managerId}`).emit('status', {
                    connected: false,
                    message: 'QR Code gerado - Escaneie com seu WhatsApp'
                });
            }
            catch (error) {
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
            await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'connected', {
                phone_number: phoneNumber,
                qr_code: undefined,
                connected_at: new Date()
            });
            // Emitir para o gestor específico
            console.log(`📤 Emitindo status 'conectado' para sala manager_${managerId}`);
            io.to(`manager_${managerId}`).emit('status', {
                connected: true,
                message: 'WhatsApp conectado com sucesso!'
            });
            io.to(`manager_${managerId}`).emit('qr', null);
            console.log(`📤 Eventos emitidos para gestor ${managerId}`);
        });
        // Evento quando o cliente é desconectado
        client.on('disconnected', async (reason) => {
            console.log(`❌ WhatsApp desconectado para gestor ${managerId}:`, reason);
            instanceData.isReady = false;
            // Atualizar no banco
            await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'disconnected');
            // Emitir para o gestor específico
            io.to(`manager_${managerId}`).emit('status', {
                connected: false,
                message: `WhatsApp desconectado: ${reason}`
            });
        });
        // Evento de erro de autenticação
        client.on('auth_failure', async (msg) => {
            console.error(`❌ Falha na autenticação para gestor ${managerId}:`, msg);
            // Atualizar no banco
            await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'error');
            // Emitir para o gestor específico
            io.to(`manager_${managerId}`).emit('status', {
                connected: false,
                message: 'Falha na autenticação - Tente novamente'
            });
        });
        // Sistema de mensagens automatizadas (chatbot)
        client.on('message', async (msg) => {
            if (!msg.from.endsWith('@c.us'))
                return;
            instanceData.messageCount++;
            // Atualizar atividade da instância
            await WhatsAppInstance_1.WhatsAppInstanceModel.updateActivity(instanceId);
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            try {
                // 🗄️ SALVAR MENSAGEM RECEBIDA NO BANCO DE DADOS
                console.log(`💾 Salvando mensagem recebida de ${msg.from}: "${msg.body}"`);
                // Criar ou encontrar contato
                const contact = await msg.getContact();
                const contactName = contact.pushname || contact.number;
                const phoneNumber = msg.from.replace('@c.us', '');
                const dbContact = await Message_1.ContactModel.findOrCreate({
                    manager_id: managerId,
                    phone_number: phoneNumber,
                    name: contactName
                });
                // Verificar se existe chat humano para este contato (qualquer status)
                let activeChat = await Message_1.HumanChatModel.findAnyByContact(dbContact.id);
                // Se existe chat encerrado/resolvido, verificar se é opção pós-encerramento
                if (activeChat && (activeChat.status === 'finished' || activeChat.status === 'resolved')) {
                    // Verificar se mensagem é uma das opções pós-encerramento (1, 2, 3)
                    const messageText = msg.body.trim();
                    console.log(`🔍 Chat encerrado detectado! Status: ${activeChat.status}, Mensagem: "${messageText}"`);
                    if (['1', '2', '3'].includes(messageText)) {
                        console.log(`🔄 Processando opção pós-encerramento: ${messageText}`);
                        // Buscar operador do chat anterior
                        const operatorId = activeChat.assigned_to || activeChat.operator_id;
                        const previousOperator = operatorId ? await User_1.UserModel.findById(operatorId) : null;
                        const operatorName = previousOperator ? previousOperator.name : 'operador';
                        let response = '';
                        if (messageText === '1') {
                            // Reconectar com mesmo operador
                            console.log(`🔄 OPÇÃO 1 DETECTADA: Reconectando com operador ${operatorName} (Chat ID: ${activeChat.id})`);
                            response = `👨‍💼 *RECONECTANDO COM OPERADOR*\n\nPerfeito! Estou reconectando você com o operador ${operatorName}.\n\n⏰ *Status:* Aguardando operador disponível\n\nEm alguns instantes ${operatorName} retornará para continuar o atendimento!\n\n*Observação:* Se o operador não estiver disponível, outro membro da equipe poderá ajudá-lo.`;
                            // Reabrir chat mantendo operador original
                            const updateQuery = `
                                UPDATE human_chats 
                                SET status = 'pending', updated_at = NOW()
                                WHERE id = ?
                            `;
                            console.log(`📋 Atualizando status do chat ${activeChat.id}: ${activeChat.status} → pending`);
                            await (0, database_1.executeQuery)(updateQuery, [activeChat.id]);
                            activeChat.status = 'pending';
                            console.log(`✅ Chat ${activeChat.id} reaberto com sucesso - Status: pending`);
                            // 📡 NOTIFICAR DASHBOARD SOBRE CHAT REABERTO
                            io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                                type: 'chat_reopened',
                                chatId: activeChat.id,
                                customerName: contactName,
                                customerPhone: phoneNumber,
                                status: 'pending',
                                operatorName: operatorName,
                                timestamp: new Date()
                            });
                            console.log(`📊 Dashboard notificado sobre chat ${activeChat.id} reaberto`);
                        }
                        else if (messageText === '2') {
                            // Ir para menu principal - usar fluxo JSON
                            console.log(`🏠 OPÇÃO 2 DETECTADA - Processando menu principal pós-encerramento`);
                            // RESETAR STATUS DO CHAT para permitir navegação normal
                            const resetQuery = `
                                UPDATE human_chats 
                                SET status = NULL, operator_id = NULL, assigned_to = NULL, updated_at = NOW()
                                WHERE id = ?
                            `;
                            await (0, database_1.executeQuery)(resetQuery, [activeChat.id]);
                            console.log(`🔄 Status do chat resetado para permitir navegação normal`);
                            const flowData = loadFlowFromJSON();
                            console.log(`📄 FlowData carregado:`, !!flowData);
                            if (flowData) {
                                console.log(`🔍 Procurando nó welcome-message entre ${flowData.nodes.length} nós`);
                                const welcomeNode = flowData.nodes.find(node => node.id === 'welcome-message' || node.data.title?.includes('Boas-vindas'));
                                console.log(`🎯 Nó encontrado:`, !!welcomeNode, welcomeNode ? welcomeNode.id : 'NENHUM');
                                if (welcomeNode && welcomeNode.data.response) {
                                    const contact = await msg.getContact();
                                    const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                                    response = welcomeNode.data.response.replace('{name}', name);
                                    console.log(`✅ Resposta preparada do JSON com nome: ${name}`);
                                }
                                else {
                                    console.log(`❌ Nó não encontrado ou sem resposta`);
                                }
                            }
                            else {
                                console.log(`❌ FlowData não carregado`);
                            }
                            if (!response) {
                                // Fallback se não conseguir carregar do JSON
                                const contact = await msg.getContact();
                                const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                                response = `🚌 Olá! ${name} Bem-vindo à *Kleiber Passagens/ Tocantins*! 

Como posso ajudá-lo hoje?

*1* - 🎫 Comprar Passagem
*2* - 🕐 Ver Horários
*3* - 📦 Encomendas e Cargas
*4* - 🚐 Turismo/Locação
*5* - 🚌 Atendimento Real Expresso

Digite o número da opção desejada! 😊`;
                            }
                        }
                        else if (messageText === '3') {
                            // Novo operador
                            response = `👥 *NOVO ATENDIMENTO*\n\nEntendi! Vou direcioná-lo para um novo atendimento.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato para ajudá-lo!\n\nObrigado pela preferência! 🚌✨`;
                            // Reabrir como novo chat (sem operador específico)
                            const updateQuery = `
                                UPDATE human_chats 
                                SET status = 'pending', updated_at = NOW(), operator_id = NULL, assigned_to = NULL
                                WHERE id = ?
                            `;
                            await (0, database_1.executeQuery)(updateQuery, [activeChat.id]);
                            activeChat.status = 'pending';
                            activeChat.operator_id = null;
                            activeChat.assigned_to = null;
                        }
                        // Enviar resposta e parar processamento para todas as opções (1, 2, 3)
                        if (response) {
                            console.log(`📤 ENVIANDO resposta pós-encerramento para opção ${messageText}`);
                            console.log(`📝 Conteúdo da resposta:`, response.substring(0, 100) + '...');
                            await client.sendMessage(msg.from, response);
                            await delay(1000);
                            console.log(`✅ Resposta pós-encerramento enviada: Opção ${messageText}`);
                            // Salvar resposta no banco
                            const botMessage = await Message_1.MessageModel.create({
                                manager_id: managerId,
                                chat_id: activeChat.id,
                                contact_id: dbContact.id,
                                sender_type: 'bot',
                                content: response,
                                message_type: 'text'
                            });
                            // Emitir evento para dashboard sobre conversa reaberta
                            io.to(`manager_${managerId}`).emit('dashboard_instant_alert', {
                                type: messageText === '2' ? 'menu_access' : 'chat_reopened',
                                chatId: activeChat.id,
                                customerName: contactName,
                                customerPhone: phoneNumber,
                                message: messageText === '2' ?
                                    `Cliente acessou menu principal após encerramento` :
                                    `Cliente escolheu opção ${messageText} - Conversa reaberta`,
                                timestamp: new Date()
                            });
                            console.log(`🛑 PARANDO processamento - return executado para opção ${messageText}`);
                            return; // Parar processamento para TODAS as opções pós-encerramento
                        }
                        else {
                            console.log(`⚠️ AVISO: Nenhuma resposta preparada para opção ${messageText}!`);
                        }
                    }
                    else {
                        // Mensagem normal após encerramento - reabrir como pendente
                        const updateQuery = `
                            UPDATE human_chats 
                            SET status = 'pending', updated_at = NOW(), operator_id = NULL, assigned_to = NULL
                            WHERE id = ?
                        `;
                        await (0, database_1.executeQuery)(updateQuery, [activeChat.id]);
                        activeChat.status = 'pending';
                        activeChat.operator_id = null;
                        activeChat.assigned_to = null;
                        console.log(`🔄 Chat ${activeChat.id} REABERTO automaticamente - Status: finished/resolved → pending`);
                        // Emitir evento para dashboard sobre conversa reaberta
                        io.to(`manager_${managerId}`).emit('dashboard_instant_alert', {
                            type: 'chat_reopened',
                            chatId: activeChat.id,
                            customerName: contactName,
                            customerPhone: phoneNumber,
                            message: 'Conversa reaberta - cliente enviou nova mensagem',
                            timestamp: new Date()
                        });
                    }
                }
                // Mapear tipos do WhatsApp para tipos do banco
                const mapMessageType = (whatsappType) => {
                    switch (whatsappType) {
                        case 'chat':
                        case 'text':
                            return 'text';
                        case 'image':
                        case 'sticker':
                            return 'image';
                        case 'audio':
                        case 'ptt': // Push to talk
                            return 'audio';
                        case 'video':
                            return 'video';
                        case 'document':
                            return 'document';
                        case 'location':
                            return 'location';
                        default:
                            return 'text';
                    }
                };
                // Salvar mensagem recebida no banco
                const savedMessage = await Message_1.MessageModel.create({
                    manager_id: managerId,
                    chat_id: activeChat?.id || null,
                    contact_id: dbContact.id,
                    whatsapp_message_id: msg.id._serialized || null,
                    sender_type: 'contact',
                    content: msg.body,
                    message_type: mapMessageType(msg.type || 'text')
                });
                console.log(`✅ Mensagem recebida salva no banco - ID: ${savedMessage.id}`);
                // Emitir estatísticas das mensagens para o dashboard do gestor
                io.to(`manager_${managerId}`).emit('message_received', {
                    from: msg.from,
                    body: msg.body,
                    timestamp: new Date(),
                    contact_name: contactName,
                    message_id: savedMessage.id
                });
                // 🆕 EMITIR EVENTO PARA CONVERSAS INICIADAS NO DASHBOARD DO GESTOR
                // Se é a primeira mensagem do contato (nova conversa iniciada)
                if (!activeChat) {
                    io.to(`manager_${managerId}`).emit('conversation_initiated', {
                        id: `conv_${dbContact.id}`,
                        customerName: contactName,
                        customerPhone: phoneNumber,
                        lastMessage: msg.body,
                        timestamp: new Date(),
                        status: 'bot_only',
                        messageCount: 1
                    });
                    console.log(`🆕 Evento conversation_initiated emitido para gestor ${managerId} - Cliente: ${contactName}`);
                }
                else {
                    // Atualizar conversa existente
                    io.to(`manager_${managerId}`).emit('conversation_updated', {
                        id: `conv_${dbContact.id}`,
                        lastMessage: msg.body,
                        timestamp: new Date(),
                        status: activeChat.status || 'bot_only',
                        messageCount: 1 // Incrementar conforme necessário
                    });
                }
                // Verificar se chat está ativo (não encerrado) para desativar bot
                const isChatActive = activeChat && ['pending', 'active', 'waiting_payment', 'transfer_pending'].includes(activeChat.status);
                // Se existe chat ativo, não processar mensagens automáticas
                if (isChatActive) {
                    console.log(`👤 Mensagem redirecionada para chat humano - ID: ${activeChat.id} (Status: ${activeChat.status})`);
                    console.log(`🤖 CHATBOT DESATIVADO - Operador/Gestor está no controle`);
                    // Emitir mensagem para o chat humano
                    const customerMessageData = {
                        chatId: phoneNumber + '@c.us',
                        message: msg.body,
                        timestamp: new Date(),
                        customerName: contactName,
                        managerId: managerId
                    };
                    console.log(`📨 Emitindo customer_message para sala manager_${managerId}:`, customerMessageData);
                    io.to(`manager_${managerId}`).emit('customer_message', customerMessageData);
                    console.log(`📨 Evento customer_message emitido para gestor ${managerId} - Chat ID: ${activeChat.id}`);
                    // Emitir evento para atualizar dashboard
                    io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                        type: 'new_message',
                        chatId: activeChat.id,
                        customerName: contactName,
                        customerPhone: phoneNumber,
                        status: activeChat.status,
                        timestamp: new Date()
                    });
                    console.log(`📊 Evento dashboard_chat_update emitido para gestor ${managerId}`);
                    return; // 🚨 NÃO PROCESSAR MENSAGENS AUTOMÁTICAS - BOT DESATIVADO
                }
                // Buscar projeto padrão do gestor no banco de dados
                console.log(`🔍 Buscando projeto padrão para gestor ${managerId}`);
                const defaultProject = await MessageProject_1.MessageProjectModel.findDefaultByManagerId(managerId, true);
                if (!defaultProject || !defaultProject.messages) {
                    console.log(`⚠️  Nenhum projeto padrão encontrado para gestor ${managerId} - criando projeto padrão`);
                    // Criar projeto padrão se não existir
                    try {
                        const newProject = await MessageProject_1.MessageProjectModel.create({
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
                            await MessageProject_1.AutoMessageModel.create({
                                project_id: newProject.id,
                                trigger_words: msgData.trigger_words,
                                response_text: msgData.response_text,
                                is_active: true,
                                order_index: msgData.order_index
                            });
                        }
                        console.log(`✅ Projeto padrão criado para gestor ${managerId}`);
                        // Buscar novamente o projeto com as mensagens
                        const createdProject = await MessageProject_1.MessageProjectModel.findDefaultByManagerId(managerId, true);
                        if (!createdProject?.messages) {
                            console.log(`❌ Erro ao buscar projeto criado para gestor ${managerId}`);
                            return;
                        }
                        // Usar as mensagens do projeto criado
                        const activeMessages = createdProject.messages.filter(msg => msg.is_active);
                        await processAutoMessages(msg, activeMessages, managerId, client, instanceData, delay);
                    }
                    catch (error) {
                        console.error(`❌ Erro ao criar projeto padrão para gestor ${managerId}:`, error);
                        return;
                    }
                }
                else {
                    console.log(`✅ Projeto padrão encontrado: "${defaultProject.name}" com ${defaultProject.messages.length} mensagens`);
                    const activeMessages = defaultProject.messages.filter(msg => msg.is_active);
                    await processAutoMessages(msg, activeMessages, managerId, client, instanceData, delay);
                }
            }
            catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
            }
        });
        // Inicializar o cliente
        client.initialize();
    }
    catch (error) {
        console.error(`❌ Erro ao inicializar WhatsApp para gestor ${managerId}:`, error);
        await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, 'error');
        throw error;
    }
}
// Função para processar mensagens automáticas
async function processAutoMessages(msg, activeMessages, managerId, client, instanceData, delay) {
    let messageProcessed = false;
    // Separar templates com wildcard (*) dos demais
    const specificTemplates = activeMessages.filter(msg => !msg.trigger_words.some((trigger) => trigger === "*"));
    const wildcardTemplates = activeMessages.filter(msg => msg.trigger_words.some((trigger) => trigger === "*"));
    // 🚫 VERIFICAR PALAVRAS-CHAVE BLOQUEADAS PRIMEIRO
    const userMessage = msg.body.trim().toLowerCase();
    const blockedKeywords = [
        'idoso', 'idosa', 'passe livre', 'id jovem', 'meia entrada',
        'gratuidade', 'isento', 'desconto especial'
    ];
    // Verificar se a mensagem contém alguma palavra bloqueada
    const hasBlockedKeyword = blockedKeywords.some(keyword => userMessage.includes(keyword.toLowerCase()));
    if (hasBlockedKeyword) {
        console.log(`🚫 Palavra-chave bloqueada detectada: "${msg.body}"`);
        const chat = await msg.getChat();
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        const blockedResponse = `🏢 *ATENDIMENTO PRESENCIAL NECESSÁRIO*

Para benefícios especiais como:
• Passe Livre
• ID Jovem
• Gratuidade para Idosos
• Outros descontos especiais

📍 *É necessário comparecer pessoalmente na agência mais próxima* com a documentação exigida.


Obrigado pela compreensão! 🚌`;
        if (client && instanceData.isReady) {
            await client.sendMessage(msg.from, blockedResponse);
            await delay(1000);
            console.log(`✅ Resposta de palavra bloqueada enviada para ${msg.from}`);
            // Salvar resposta no banco
            try {
                const phoneNumber = msg.from.replace('@c.us', '');
                const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                if (dbContact) {
                    const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                    await Message_1.MessageModel.create({
                        manager_id: managerId,
                        chat_id: activeChat?.id || null,
                        contact_id: dbContact.id,
                        sender_type: 'bot',
                        content: blockedResponse,
                        message_type: 'text'
                    });
                }
            }
            catch (error) {
                console.error('❌ Erro ao salvar resposta de palavra bloqueada:', error);
            }
        }
        messageProcessed = true;
        return; // Sair da função após processar palavra bloqueada
    }
    // 🙏 VERIFICAR SE É AGRADECIMENTO E ENCERRAR CONVERSA GRACIOSAMENTE
    const thankYouKeywords = ['obrigado', 'obrigada', 'valeu', 'brigado', 'ok', 'certo', 'entendi', 'tá bom', 'beleza'];
    if (thankYouKeywords.some(keyword => userMessage.includes(keyword))) {
        console.log(`🙏 Agradecimento detectado: "${msg.body}" - Não processando`);
        messageProcessed = true;
        return;
    }
    // 🏠 VERIFICAR SEMPRE SE É "0" PARA VOLTAR AO MENU PRINCIPAL
    if (msg.body.trim() === '0') {
        console.log(`🏠 Usuário digitou "0" - Buscando menu principal no fluxo JSON`);
        const chat = await msg.getChat();
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        const contact = await msg.getContact();
        const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
        let menuResponse = '';
        // Tentar carregar do fluxo JSON
        const flowData = loadFlowFromJSON();
        if (flowData) {
            const welcomeNode = flowData.nodes.find(node => node.id === 'welcome-message');
            if (welcomeNode && welcomeNode.data.response) {
                menuResponse = welcomeNode.data.response.replace('{name}', name);
                console.log(`✅ Menu "0" carregado do fluxo JSON: welcome-message`);
            }
        }
        // Fallback se não conseguir carregar do JSON
        if (!menuResponse) {
            console.log(`⚠️ Usando menu "0" fallback - JSON não disponível`);
            menuResponse = `🚌 Olá! ${name} Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊`;
        }
        if (client && instanceData.isReady) {
            await client.sendMessage(msg.from, menuResponse);
            await delay(1000);
            console.log(`✅ Menu principal enviado para ${msg.from}`);
            // Salvar resposta no banco
            try {
                const phoneNumber = msg.from.replace('@c.us', '');
                const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                if (dbContact) {
                    const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                    await Message_1.MessageModel.create({
                        manager_id: managerId,
                        chat_id: activeChat?.id || null,
                        contact_id: dbContact.id,
                        sender_type: 'bot',
                        content: menuResponse,
                        message_type: 'text'
                    });
                }
            }
            catch (error) {
                console.error('❌ Erro ao salvar menu principal:', error);
            }
        }
        messageProcessed = true;
        return; // Sair da função após processar o "0"
    }
    // Processar primeiro os templates específicos
    for (const autoMessage of specificTemplates) {
        // Verificar se alguma palavra-chave corresponde (EXACT MATCH apenas)
        const messageMatches = autoMessage.trigger_words.some((trigger) => msg.body.toLowerCase() === trigger.toLowerCase());
        if (messageMatches) {
            console.log(`🎯 Mensagem correspondente encontrada: "${msg.body}" -> "${autoMessage.response_text.substring(0, 50)}..."`);
            // Verificar se é uma solicitação de atendimento humano
            const isHumanRequest = autoMessage.trigger_words.some((trigger) => ['operador', 'atendente', 'humano', 'pessoa'].includes(trigger.toLowerCase()));
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
            // Substituir outras variáveis se necessário
            if (response.includes('{cidade_digitada}')) {
                response = response.replace(/{cidade_digitada}/g, msg.body);
            }
            if (response.includes('{cidade_escolhida}')) {
                response = response.replace(/{cidade_escolhida}/g, msg.body);
            }
            if (response.includes('{CIDADE_NOME}')) {
                response = response.replace(/{CIDADE_NOME}/g, msg.body);
            }
            // Verificar se o cliente está disponível antes de enviar
            if (client && instanceData.isReady) {
                await client.sendMessage(msg.from, response);
                await delay(1000);
                console.log(`✅ Resposta enviada para ${msg.from}: "${response.substring(0, 50)}..."`);
                // 🗄️ SALVAR RESPOSTA DO BOT NO BANCO DE DADOS
                try {
                    const phoneNumber = msg.from.replace('@c.us', '');
                    const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                    if (dbContact) {
                        // Verificar se existe chat humano ativo
                        const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                        const botMessage = await Message_1.MessageModel.create({
                            manager_id: managerId,
                            chat_id: activeChat?.id || null,
                            contact_id: dbContact.id,
                            sender_type: 'bot',
                            content: response,
                            message_type: 'text'
                        });
                        console.log(`💾 Resposta do bot salva no banco - ID: ${botMessage.id}`);
                    }
                }
                catch (error) {
                    console.error('❌ Erro ao salvar resposta do bot:', error);
                }
            }
            messageProcessed = true;
            break;
        }
    }
    // Se não foi processado por templates específicos, tentar wildcards
    if (!messageProcessed) {
        for (const autoMessage of wildcardTemplates) {
            console.log(`🎯 Processando template wildcard: "${autoMessage.response_text.substring(0, 50)}..."`);
            // Verificar se é uma solicitação de atendimento humano
            const isHumanRequest = autoMessage.trigger_words.some((trigger) => ['operador', 'atendente', 'humano', 'pessoa'].includes(trigger.toLowerCase())) || autoMessage.response_text.toLowerCase().includes('transferir você para nosso operador');
            console.log(`🔍 Debug - isHumanRequest: ${isHumanRequest} para resposta: ${autoMessage.response_text.substring(0, 50)}...`);
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
            // Substituir outras variáveis se necessário
            if (response.includes('{cidade_digitada}')) {
                response = response.replace(/{cidade_digitada}/g, msg.body);
            }
            if (response.includes('{cidade_escolhida}')) {
                response = response.replace(/{cidade_escolhida}/g, msg.body);
            }
            if (response.includes('{CIDADE_NOME}')) {
                response = response.replace(/{CIDADE_NOME}/g, msg.body);
            }
            // Verificar se o cliente está disponível antes de enviar
            if (client && instanceData.isReady) {
                await client.sendMessage(msg.from, response);
                await delay(1000);
                console.log(`✅ Resposta wildcard enviada para ${msg.from}: "${response.substring(0, 50)}..."`);
                // 🗄️ SALVAR RESPOSTA DO BOT NO BANCO DE DADOS
                try {
                    const phoneNumber = msg.from.replace('@c.us', '');
                    const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                    if (dbContact) {
                        // Verificar se existe chat humano ativo
                        const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                        const botMessage = await Message_1.MessageModel.create({
                            manager_id: managerId,
                            chat_id: activeChat?.id || null,
                            contact_id: dbContact.id,
                            sender_type: 'bot',
                            content: response,
                            message_type: 'text'
                        });
                        console.log(`💾 Resposta wildcard do bot salva no banco - ID: ${botMessage.id}`);
                    }
                }
                catch (error) {
                    console.error('❌ Erro ao salvar resposta wildcard do bot:', error);
                }
            }
            messageProcessed = true;
            break;
        }
    }
    // Log da mensagem processada
    if (messageProcessed) {
        console.log(`🤖 Mensagem automática processada para ${msg.from} pelo gestor ${managerId}`);
    }
    else {
        console.log(`❓ Nenhuma mensagem automática correspondente para: "${msg.body}"`);
        // 🏙️ LÓGICA ESPECIAL PARA CIDADES (VENDAS DE PASSAGEM)
        const userMessage = msg.body.trim();
        // Lista de cidades disponíveis (expandida e normalizada)
        const availableCities = [
            'São Luís', 'São Luis', 'Sao Luis', 'Sao Luís', 'sao luis', 'são luis',
            'Imperatriz', 'imperatriz',
            'Brasília', 'Brasilia', 'brasilia', 'brasília', 'DF',
            'Goiânia', 'Goiania', 'goiania', 'goiânia', 'GO',
            'Araguaína', 'Araguaina', 'araguaina', 'araguaína',
            'Gurupi', 'gurupi',
            'Porto Nacional', 'porto nacional', 'Porto nacional',
            'Paraíso do Tocantins', 'Paraiso do Tocantins', 'paraiso do tocantins', 'paraíso do tocantins', 'Paraíso', 'Paraiso',
            'Colinas do Tocantins', 'colinas do tocantins', 'Colinas', 'colinas',
            'Barreiras', 'barreiras', 'BA',
            'Luís Eduardo Magalhães', 'Luis Eduardo Magalhaes', 'luis eduardo magalhaes', 'luís eduardo magalhães',
            'L.E. Magalhães', 'LE Magalhães', 'LEM',
            'Teresina', 'teresina', 'PI',
            'Parnaíba', 'Parnaiba', 'parnaiba', 'parnaíba'
        ];
        // Verificar se a mensagem pode ser um nome de cidade (mais de 2 caracteres, não é apenas número)
        if (userMessage.length > 2 && !/^\d+$/.test(userMessage) && !/^[1-9]$/.test(userMessage)) {
            console.log(`🏙️ Verificando se "${userMessage}" é uma cidade disponível...`);
            // 📝 DETECTAR DADOS PESSOAIS (Nome, Telefone, CPF, Data)
            const hasPersonalData = detectPersonalData(userMessage);
            if (hasPersonalData) {
                console.log(`📝 Dados pessoais detectados: "${userMessage}" - Transferindo para operador`);
                const transferMessage = `📋 *DADOS RECEBIDOS*

Perfeito! Recebi suas informações:

${userMessage}

🤝 Vou transferir você para um de nossos operadores especializados em vendas para finalizar sua compra e processar o pagamento.

⏰ *Em alguns instantes um operador entrará em contato!*

Aguarde um momento... 🚌✨`;
                await transferToHuman(managerId, msg, transferMessage);
                messageProcessed = true;
                return; // Sair da função após transferir
            }
            // Normalizar entrada do usuário para comparação
            const normalizedInput = userMessage.toLowerCase().trim();
            // Verificar se é uma cidade disponível (comparação mais flexível)
            const isCityAvailable = availableCities.some(city => {
                const normalizedCity = city.toLowerCase();
                return normalizedCity.includes(normalizedInput) ||
                    normalizedInput.includes(normalizedCity) ||
                    normalizedCity === normalizedInput ||
                    // Comparação por palavras-chave
                    (normalizedInput.includes('luis') && normalizedCity.includes('luís')) ||
                    (normalizedInput.includes('luís') && normalizedCity.includes('luis')) ||
                    (normalizedInput.includes('brasilia') && normalizedCity.includes('brasília')) ||
                    (normalizedInput.includes('brasília') && normalizedCity.includes('brasilia')) ||
                    (normalizedInput.includes('goiania') && normalizedCity.includes('goiânia')) ||
                    (normalizedInput.includes('goiânia') && normalizedCity.includes('goiania'));
            });
            // Tratar "Palmas" como origem (não destino)
            if (normalizedInput.includes('palmas')) {
                const chat = await msg.getChat();
                await delay(2000);
                await chat.sendStateTyping();
                await delay(2000);
                const response = `🏙️ Palmas é nossa cidade de *origem*! 🚌\n\nPara onde você gostaria de viajar saindo de Palmas?\n\nDigite o nome da cidade de *destino* que você deseja! 😊\n\n*Exemplo:* São Luís, Brasília, Goiânia, etc.`;
                if (client && instanceData.isReady) {
                    await client.sendMessage(msg.from, response);
                    console.log(`🏙️ Resposta sobre Palmas (origem) enviada`);
                }
                messageProcessed = true;
            }
            else if (isCityAvailable) {
                // Encontrar o nome correto da cidade (versão mais formal)
                let correctCityName = userMessage;
                // Mapear para nome formal da cidade
                const cityMapping = {
                    'sao luis': 'São Luís - MA',
                    'são luis': 'São Luís - MA',
                    'sao luís': 'São Luís - MA',
                    'imperatriz': 'Imperatriz - MA',
                    'brasilia': 'Brasília - DF',
                    'brasília': 'Brasília - DF',
                    'goiania': 'Goiânia - GO',
                    'goiânia': 'Goiânia - GO',
                    'araguaina': 'Araguaína - TO',
                    'araguaína': 'Araguaína - TO',
                    'gurupi': 'Gurupi - TO',
                    'porto nacional': 'Porto Nacional - TO',
                    'paraiso': 'Paraíso do Tocantins - TO',
                    'paraíso': 'Paraíso do Tocantins - TO',
                    'colinas': 'Colinas do Tocantins - TO',
                    'barreiras': 'Barreiras - BA',
                    'teresina': 'Teresina - PI',
                    'parnaiba': 'Parnaíba - PI',
                    'parnaíba': 'Parnaíba - PI'
                };
                // Tentar encontrar nome formal
                const mappedCity = cityMapping[normalizedInput];
                if (mappedCity) {
                    correctCityName = mappedCity;
                }
                else {
                    // Buscar na lista de cidades disponíveis
                    const foundCity = availableCities.find(city => {
                        const normalizedCity = city.toLowerCase();
                        return normalizedCity.includes(normalizedInput) ||
                            normalizedInput.includes(normalizedCity) ||
                            normalizedCity === normalizedInput;
                    });
                    if (foundCity) {
                        correctCityName = foundCity;
                        // Adicionar estado se não tiver
                        if (!correctCityName.includes(' - ')) {
                            if (correctCityName.toLowerCase().includes('são luís') || correctCityName.toLowerCase().includes('imperatriz')) {
                                correctCityName += ' - MA';
                            }
                            else if (correctCityName.toLowerCase().includes('brasília')) {
                                correctCityName += ' - DF';
                            }
                            else if (correctCityName.toLowerCase().includes('goiânia')) {
                                correctCityName += ' - GO';
                            }
                            else if (correctCityName.toLowerCase().includes('barreiras')) {
                                correctCityName += ' - BA';
                            }
                            else if (correctCityName.toLowerCase().includes('teresina') || correctCityName.toLowerCase().includes('parnaíba')) {
                                correctCityName += ' - PI';
                            }
                            else {
                                correctCityName += ' - TO';
                            }
                        }
                    }
                }
                // Buscar mensagem de cidade disponível
                const availableMessage = activeMessages.find(msg => msg.trigger_words.includes('CIDADE_DISPONIVEL'));
                if (availableMessage) {
                    const chat = await msg.getChat();
                    await delay(2000);
                    await chat.sendStateTyping();
                    await delay(3000);
                    let response = availableMessage.response_text;
                    response = response.replace(/{CIDADE_NOME}/g, correctCityName);
                    // Substituir {name} se necessário
                    if (response.includes('{name}')) {
                        const contact = await msg.getContact();
                        const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                        response = response.replace(/{name}/g, name);
                    }
                    if (client && instanceData.isReady) {
                        await client.sendMessage(msg.from, response);
                        await delay(1000);
                        console.log(`✅ Resposta de cidade DISPONÍVEL enviada: ${correctCityName}`);
                        // Salvar resposta no banco
                        try {
                            const phoneNumber = msg.from.replace('@c.us', '');
                            const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                            if (dbContact) {
                                const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                                await Message_1.MessageModel.create({
                                    manager_id: managerId,
                                    chat_id: activeChat?.id || null,
                                    contact_id: dbContact.id,
                                    sender_type: 'bot',
                                    content: response,
                                    message_type: 'text'
                                });
                            }
                        }
                        catch (error) {
                            console.error('❌ Erro ao salvar resposta de cidade disponível:', error);
                        }
                    }
                    messageProcessed = true;
                }
            }
            else {
                // Buscar mensagem de cidade não disponível
                const notAvailableMessage = activeMessages.find(msg => msg.trigger_words.includes('CIDADE_NAO_DISPONIVEL'));
                if (notAvailableMessage) {
                    const chat = await msg.getChat();
                    await delay(2000);
                    await chat.sendStateTyping();
                    await delay(3000);
                    let response = notAvailableMessage.response_text;
                    response = response.replace(/{CIDADE_NOME}/g, userMessage);
                    // Substituir {name} se necessário
                    if (response.includes('{name}')) {
                        const contact = await msg.getContact();
                        const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                        response = response.replace(/{name}/g, name);
                    }
                    if (client && instanceData.isReady) {
                        await client.sendMessage(msg.from, response);
                        await delay(1000);
                        console.log(`❌ Resposta de cidade NÃO DISPONÍVEL enviada: ${userMessage}`);
                        // Salvar resposta no banco
                        try {
                            const phoneNumber = msg.from.replace('@c.us', '');
                            const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                            if (dbContact) {
                                const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                                await Message_1.MessageModel.create({
                                    manager_id: managerId,
                                    chat_id: activeChat?.id || null,
                                    contact_id: dbContact.id,
                                    sender_type: 'bot',
                                    content: response,
                                    message_type: 'text'
                                });
                            }
                        }
                        catch (error) {
                            console.error('❌ Erro ao salvar resposta de cidade não disponível:', error);
                        }
                    }
                    messageProcessed = true;
                }
            }
        }
        if (messageProcessed) {
            console.log(`🏙️ Mensagem de cidade processada para ${msg.from}`);
        }
        else {
            // 🚨 FALLBACK AUTOMÁTICO: Verificar se é primeira conversa
            console.log(`🔄 Nenhuma correspondência encontrada para "${msg.body}"`);
            // 🔍 VERIFICAR SE É PRIMEIRA CONVERSA DO USUÁRIO
            const contact = await msg.getContact();
            const phoneNumber = msg.from.replace('@c.us', '');
            const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
            let isFirstConversation = false;
            if (dbContact) {
                // Verificar se há chats anteriores para este contato
                const existingChatsQuery = `
                    SELECT COUNT(*) as chatCount 
                    FROM human_chats 
                    WHERE contact_id = ? AND manager_id = ?
                `;
                try {
                    const chatCountResult = await (0, database_1.executeQuery)(existingChatsQuery, [dbContact.id, managerId]);
                    const chatCount = chatCountResult?.[0]?.chatCount || 0;
                    isFirstConversation = chatCount === 0;
                    console.log(`📊 Contato ${dbContact.id} tem ${chatCount} chats anteriores`);
                }
                catch (error) {
                    console.error('❌ Erro ao verificar chats anteriores:', error);
                    // Em caso de erro, assumir que é primeira conversa para dar melhor experiência
                    isFirstConversation = true;
                }
            }
            else {
                // Se não existe contato no banco, é primeira conversa
                isFirstConversation = true;
            }
            console.log(`👤 Primeira conversa do usuário: ${isFirstConversation ? 'SIM' : 'NÃO'}`);
            if (isFirstConversation) {
                // 🏠 PRIMEIRA CONVERSA: Mostrar menu principal do fluxo JSON
                console.log(`🏠 Primeira conversa - Buscando menu principal no fluxo JSON`);
                const contactName = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                let menuResponse = '';
                // Tentar carregar do fluxo JSON
                const flowData = loadFlowFromJSON();
                if (flowData) {
                    const welcomeNode = flowData.nodes.find(node => node.id === 'welcome-message');
                    if (welcomeNode && welcomeNode.data.response) {
                        menuResponse = welcomeNode.data.response.replace('{name}', contactName);
                        console.log(`✅ Menu carregado do fluxo JSON: welcome-message`);
                    }
                }
                // Fallback se não conseguir carregar do JSON
                if (!menuResponse) {
                    console.log(`⚠️ Usando menu fallback - JSON não disponível`);
                    menuResponse = `🚌 Olá! ${contactName} Bem-vindo à *Kleiber Passagens/ Tocantins*! 

Como posso ajudá-lo hoje?

*1* - 🎫 Comprar Passagem
*2* - 🕐 Ver Horários
*3* - 📦 Encomendas e Cargas
*4* - 🚐 Turismo/Locação
*5* - 🚌 Atendimento Real Expresso

Digite o número da opção desejada! 😊`;
                }
                if (client && instanceData.isReady) {
                    await delay(2000);
                    await client.sendMessage(msg.from, menuResponse);
                    await delay(1000);
                    console.log(`🏠 Menu principal enviado para primeira conversa: ${msg.from}`);
                }
            }
            else {
                // 👨‍💼 CONVERSA EXISTENTE: Transferir para operador
                console.log(`👨‍💼 Conversa existente - Transferindo para operador`);
                const fallbackResponse = `👨‍💼 *Vou transferir você para nosso atendimento especializado!*

🤔 Não consegui processar sua mensagem automaticamente, mas nossa equipe de atendimento poderá ajudá-lo melhor.

⏰ *Horário de Atendimento:*
Segunda a Sexta: 6h às 22h
Sábado: 6h às 18h  
Domingo: 8h às 20h

Em alguns instantes um operador entrará em contato! 

Obrigado pela preferência! 🚌✨`;
                // Enviar mensagem de fallback e transferir automaticamente
                if (client && instanceData.isReady) {
                    await client.sendMessage(msg.from, fallbackResponse);
                    await delay(1000);
                    console.log(`🤖 Resposta de fallback enviada para ${msg.from}`);
                    // Transferir automaticamente para atendimento humano
                    await transferToHuman(managerId, msg, fallbackResponse);
                }
            }
        }
    }
}
// Função para transferir conversa para atendimento humano
async function transferToHuman(managerId, msg, botResponse) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    try {
        const contact = await msg.getContact();
        const contactName = contact.pushname || contact.number;
        const contactNumber = msg.from;
        const phoneNumber = contactNumber.replace('@c.us', '');
        // 🗄️ CRIAR/ENCONTRAR CONTATO NO BANCO
        const dbContact = await Message_1.ContactModel.findOrCreate({
            manager_id: managerId,
            phone_number: phoneNumber,
            name: contactName
        });
        // 🔍 VERIFICAR SE JÁ EXISTE CHAT HUMANO PARA ESTE CONTATO (QUALQUER STATUS)
        let humanChat;
        try {
            const existingChatQuery = `
                SELECT * FROM human_chats 
                WHERE contact_id = ? AND manager_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            const existingChats = await (0, database_1.executeQuery)(existingChatQuery, [dbContact.id, managerId]);
            if (existingChats && existingChats.length > 0) {
                // Reutilizar chat existente (SEMPRE)
                humanChat = existingChats[0];
                // Se chat estava encerrado/resolvido/resetado, reabrir como pendente
                if (humanChat.status === 'finished' || humanChat.status === 'resolved' || humanChat.status === null) {
                    const updateQuery = `
                        UPDATE human_chats 
                        SET status = 'pending', updated_at = NOW(), operator_id = NULL, assigned_to = NULL
                        WHERE id = ?
                    `;
                    await (0, database_1.executeQuery)(updateQuery, [humanChat.id]);
                    humanChat.status = 'pending';
                    humanChat.operator_id = null;
                    humanChat.assigned_to = null;
                    console.log(`🔄 Chat ${humanChat.id} REABERTO - Status: ${humanChat.status || 'NULL'} → pending`);
                }
                else {
                    console.log(`♻️ Reutilizando chat humano existente - ID: ${humanChat.id} (Status: ${humanChat.status})`);
                }
            }
            else {
                // Criar novo chat humano apenas se não existir nenhum
                humanChat = await Message_1.HumanChatModel.create({
                    manager_id: managerId,
                    contact_id: dbContact.id,
                    status: 'pending',
                    transfer_reason: 'Solicitação do cliente'
                });
                console.log(`💾 Novo chat humano criado no banco - ID: ${humanChat.id}`);
            }
        }
        catch (error) {
            console.error('❌ Erro ao verificar/criar chat humano:', error);
            // Fallback: criar novo chat
            humanChat = await Message_1.HumanChatModel.create({
                manager_id: managerId,
                contact_id: dbContact.id,
                status: 'pending',
                transfer_reason: 'Solicitação do cliente'
            });
            console.log(`💾 Chat humano criado (fallback) - ID: ${humanChat.id}`);
        }
        // 🔗 VINCULAR MENSAGENS ANTERIORES AO CHAT HUMANO
        try {
            const updateQuery = `
                UPDATE messages 
                SET chat_id = ? 
                WHERE contact_id = ? AND manager_id = ? AND chat_id IS NULL
            `;
            const updateResult = await (0, database_1.executeQuery)(updateQuery, [humanChat.id, dbContact.id, managerId]);
            console.log(`🔗 Mensagens anteriores vinculadas ao chat humano - Chat ID: ${humanChat.id}`);
        }
        catch (linkError) {
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
        // Substituir outras variáveis se necessário
        if (response.includes('{cidade_digitada}')) {
            response = response.replace(/{cidade_digitada}/g, msg.body);
        }
        if (response.includes('{cidade_escolhida}')) {
            response = response.replace(/{cidade_escolhida}/g, msg.body);
        }
        const instance = whatsappInstances.get(managerId);
        if (instance?.client && instance.isReady) {
            await instance.client.sendMessage(contactNumber, response);
            await delay(1000);
            // 🗄️ SALVAR MENSAGEM DE TRANSFERÊNCIA DO BOT
            const transferMessage = await Message_1.MessageModel.create({
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
        // 🔄 ATUALIZAR CONVERSA INICIADA - mudou de bot_only para pending
        io.to(`manager_${managerId}`).emit('conversation_updated', {
            id: `conv_${dbContact.id}`,
            lastMessage: 'Solicitou atendimento humano',
            timestamp: new Date(),
            status: 'pending',
            messageCount: 0 // Será atualizado pelo contador real se necessário
        });
        // 🚨 ALERTAS INSTANTÂNEOS PARA DASHBOARD
        // Enviar alerta para dashboard do gestor
        io.to(`manager_${managerId}`).emit('dashboard_instant_alert', {
            type: 'new_conversation',
            title: '🔔 Nova Conversa Pendente',
            message: `${contactName} solicitou atendimento`,
            priority: 'high',
            chatId: humanChat.id,
            customerName: contactName,
            customerPhone: phoneNumber,
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
            customerPhone: phoneNumber,
            timestamp: new Date()
        });
        console.log(`🚨 Alertas instantâneos enviados para dashboards do gestor ${managerId}`);
        // Emitir evento para atualizar dashboard com nova conversa
        io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
            type: 'new_chat',
            chatId: humanChat.id,
            customerName: contactName,
            customerPhone: phoneNumber,
            status: 'pending',
            timestamp: new Date(),
            lastMessage: 'Solicitou atendimento humano'
        });
        console.log(`📊 Evento dashboard_chat_update (new_chat) emitido para gestor ${managerId}`);
    }
    catch (error) {
        console.error('Erro ao transferir para humano:', error);
    }
}
// Função para detectar dados pessoais (Nome, Telefone, CPF, Data)
function detectPersonalData(message) {
    const text = message.trim();
    // Padrões para detectar dados pessoais
    const patterns = {
        // Nome completo (duas ou mais palavras com primeira letra maiúscula)
        name: /^[A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+/,
        // CPF (vários formatos)
        cpf: /(\d{3}\.?\d{3}\.?\d{3}-?\d{2})|(\d{11})/,
        // Data (vários formatos)
        date: /((\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4}))|((\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2}))/,
        // Telefone (vários formatos)
        phone: /(\(?\d{2}\)?\s?)?\d{4,5}[\s\-]?\d{4}/,
        // E-mail
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    };
    // Verificar se contém múltiplas linhas (dados organizados)
    const hasMultipleLines = text.includes('\n') || text.split(/\s+/).length > 5;
    // Contar quantos padrões foram encontrados
    let patternMatches = 0;
    for (const [key, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            console.log(`📝 Padrão ${key} detectado: ${pattern.exec(text)?.[0]}`);
            patternMatches++;
        }
    }
    // Detectar se parece ser dados pessoais:
    // 1. Pelo menos 2 padrões diferentes OU
    // 2. Múltiplas linhas com pelo menos 1 padrão OU
    // 3. Mensagem longa com pelo menos 1 padrão
    const isPersonalData = patternMatches >= 2 ||
        (hasMultipleLines && patternMatches >= 1) ||
        (text.length > 20 && patternMatches >= 1);
    if (isPersonalData) {
        console.log(`✅ Dados pessoais detectados - Padrões: ${patternMatches}, Múltiplas linhas: ${hasMultipleLines}, Tamanho: ${text.length}`);
    }
    return isPersonalData;
}
// ===== ROTAS DA API =====
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Testar conexão com banco de dados
        await (0, database_1.executeQuery)('SELECT 1');
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: 'connected',
            whatsappInstances: whatsappInstances.size
        };
        res.status(200).json(healthStatus);
    }
    catch (error) {
        const healthStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            whatsappInstances: whatsappInstances.size
        };
        res.status(503).json(healthStatus);
    }
});
// Rotas de autenticação
app.use('/api/auth', auth_1.default);
// Rotas de usuários
app.use('/api/users', users_1.default);
// Rotas de WhatsApp
app.use('/api/whatsapp', whatsapp_1.default);
// Rotas de mensagens
app.use('/api/messages', messages_1.default);
// Rotas de dispositivos
app.use('/api/devices', devices_1.default);
// Rotas de operadores
app.use('/api/operators', operators_1.default);
// Rotas de gestores
app.use('/api/managers', managers_1.default);
// Rotas de assinatura
app.use('/api/subscription', subscription_1.default);
// ===== ENDPOINT DE CONTATOS =====
// Listar todos os contatos de um gestor com estatísticas
app.get('/api/contacts/:managerId', authenticate, async (req, res) => {
    try {
        const managerId = parseInt(req.params.managerId);
        if (!managerId) {
            return res.status(400).json({ error: 'ID do gestor inválido' });
        }
        // Buscar contatos com estatísticas detalhadas
        const contactsQuery = `
            SELECT 
                c.*,
                COALESCE(msg_stats.total_messages, 0) as total_messages,
                COALESCE(msg_stats.messages_sent, 0) as messages_sent,
                COALESCE(msg_stats.messages_received, 0) as messages_received,
                msg_stats.last_message_content,
                msg_stats.last_message_date,
                msg_stats.last_message_type,
                hc_stats.total_chats,
                hc_stats.active_chats,
                hc_stats.last_chat_status
            FROM contacts c
            LEFT JOIN (
                SELECT 
                    contact_id,
                    COUNT(*) as total_messages,
                    SUM(CASE WHEN sender_type = 'bot' OR sender_type = 'operator' THEN 1 ELSE 0 END) as messages_sent,
                    SUM(CASE WHEN sender_type = 'contact' THEN 1 ELSE 0 END) as messages_received,
                    MAX(content) as last_message_content,
                    MAX(created_at) as last_message_date,
                    MAX(message_type) as last_message_type
                FROM messages 
                WHERE manager_id = ?
                GROUP BY contact_id
            ) msg_stats ON c.id = msg_stats.contact_id
            LEFT JOIN (
                SELECT 
                    contact_id,
                    COUNT(*) as total_chats,
                    SUM(CASE WHEN status IN ('pending', 'active', 'waiting_payment', 'transfer_pending') THEN 1 ELSE 0 END) as active_chats,
                    MAX(status) as last_chat_status
                FROM human_chats 
                WHERE manager_id = ?
                GROUP BY contact_id
            ) hc_stats ON c.id = hc_stats.contact_id
            WHERE c.manager_id = ?
            ORDER BY msg_stats.last_message_date DESC, c.updated_at DESC
        `;
        const contacts = await (0, database_1.executeQuery)(contactsQuery, [managerId, managerId, managerId]);
        // Processar dados dos contatos
        const processedContacts = contacts.map(contact => {
            // Parse tags JSON se existir
            if (contact.tags && typeof contact.tags === 'string') {
                try {
                    contact.tags = JSON.parse(contact.tags);
                }
                catch (e) {
                    contact.tags = null;
                }
            }
            // Formatear dados para melhor apresentação
            return {
                id: contact.id,
                phone_number: contact.phone_number,
                name: contact.name || `Contato ${contact.phone_number}`,
                avatar: contact.avatar,
                tags: contact.tags,
                notes: contact.notes,
                is_blocked: contact.is_blocked,
                created_at: contact.created_at,
                updated_at: contact.updated_at,
                statistics: {
                    total_messages: parseInt(contact.total_messages) || 0,
                    messages_sent: parseInt(contact.messages_sent) || 0,
                    messages_received: parseInt(contact.messages_received) || 0,
                    last_message: {
                        content: contact.last_message_content ?
                            (contact.last_message_content.length > 100 ?
                                contact.last_message_content.substring(0, 100) + '...' :
                                contact.last_message_content) : null,
                        date: contact.last_message_date,
                        type: contact.last_message_type
                    },
                    chats: {
                        total: parseInt(contact.total_chats) || 0,
                        active: parseInt(contact.active_chats) || 0,
                        last_status: contact.last_chat_status
                    }
                }
            };
        });
        // Estatísticas gerais
        const totalContacts = processedContacts.length;
        const activeContacts = processedContacts.filter(c => c.statistics.chats.active > 0).length;
        const totalMessages = processedContacts.reduce((sum, c) => sum + c.statistics.total_messages, 0);
        const contactsWithRecentActivity = processedContacts.filter(c => c.statistics.last_message.date &&
            new Date(c.statistics.last_message.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
        const response = {
            success: true,
            data: {
                contacts: processedContacts,
                summary: {
                    total_contacts: totalContacts,
                    active_chats: activeContacts,
                    total_messages: totalMessages,
                    recent_activity_24h: contactsWithRecentActivity,
                    timestamp: new Date().toISOString()
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// Buscar contato específico por ID
app.get('/api/contacts/:managerId/:contactId', authenticate, async (req, res) => {
    try {
        const managerId = parseInt(req.params.managerId);
        const contactId = parseInt(req.params.contactId);
        if (!managerId || !contactId) {
            return res.status(400).json({ error: 'IDs inválidos' });
        }
        // Buscar contato específico com detalhes completos
        const contactQuery = `
            SELECT 
                c.*,
                COALESCE(msg_stats.total_messages, 0) as total_messages,
                COALESCE(msg_stats.messages_sent, 0) as messages_sent,
                COALESCE(msg_stats.messages_received, 0) as messages_received,
                hc_stats.total_chats,
                hc_stats.active_chats
            FROM contacts c
            LEFT JOIN (
                SELECT 
                    contact_id,
                    COUNT(*) as total_messages,
                    SUM(CASE WHEN sender_type = 'bot' OR sender_type = 'operator' THEN 1 ELSE 0 END) as messages_sent,
                    SUM(CASE WHEN sender_type = 'contact' THEN 1 ELSE 0 END) as messages_received
                FROM messages 
                WHERE manager_id = ? AND contact_id = ?
                GROUP BY contact_id
            ) msg_stats ON c.id = msg_stats.contact_id
            LEFT JOIN (
                SELECT 
                    contact_id,
                    COUNT(*) as total_chats,
                    SUM(CASE WHEN status IN ('pending', 'active', 'waiting_payment', 'transfer_pending') THEN 1 ELSE 0 END) as active_chats
                FROM human_chats 
                WHERE manager_id = ? AND contact_id = ?
                GROUP BY contact_id
            ) hc_stats ON c.id = hc_stats.contact_id
            WHERE c.manager_id = ? AND c.id = ?
        `;
        const result = await (0, database_1.executeQuery)(contactQuery, [
            managerId, contactId,
            managerId, contactId,
            managerId, contactId
        ]);
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        const contact = result[0];
        // Parse tags JSON
        if (contact.tags && typeof contact.tags === 'string') {
            try {
                contact.tags = JSON.parse(contact.tags);
            }
            catch (e) {
                contact.tags = null;
            }
        }
        // Buscar mensagens recentes do contato
        const recentMessagesQuery = `
            SELECT content, sender_type, message_type, created_at
            FROM messages 
            WHERE manager_id = ? AND contact_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const recentMessages = await (0, database_1.executeQuery)(recentMessagesQuery, [managerId, contactId]);
        const response = {
            success: true,
            data: {
                contact: {
                    id: contact.id,
                    phone_number: contact.phone_number,
                    name: contact.name || `Contato ${contact.phone_number}`,
                    avatar: contact.avatar,
                    tags: contact.tags,
                    notes: contact.notes,
                    is_blocked: contact.is_blocked,
                    created_at: contact.created_at,
                    updated_at: contact.updated_at,
                    statistics: {
                        total_messages: parseInt(contact.total_messages) || 0,
                        messages_sent: parseInt(contact.messages_sent) || 0,
                        messages_received: parseInt(contact.messages_received) || 0,
                        chats: {
                            total: parseInt(contact.total_chats) || 0,
                            active: parseInt(contact.active_chats) || 0
                        }
                    }
                },
                recent_messages: recentMessages.map(msg => ({
                    content: msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content,
                    sender_type: msg.sender_type,
                    message_type: msg.message_type,
                    created_at: msg.created_at
                }))
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Erro ao buscar contato:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// Rota de status do sistema
app.get('/api/status', async (req, res) => {
    try {
        const stats = await WhatsAppInstance_1.WhatsAppInstanceModel.getStats();
        res.json({
            system: 'online',
            database: 'connected',
            instances: stats,
            uptime: process.uptime()
        });
    }
    catch (error) {
        res.status(500).json({
            system: 'error',
            database: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Rota principal (React App)
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
});
// ===== SOCKET.IO EVENTS =====
console.log('🚀 Configurando listeners do Socket.IO...');
io.on('connection', async (socket) => {
    console.log('\n=======================================');
    console.log('🔗 NOVA CONEXAO SOCKET:', socket.id);
    console.log('🔍 Dados do handshake:', {
        auth: socket.handshake.auth,
        query: socket.handshake.query,
        headers: Object.keys(socket.handshake.headers)
    });
    console.log('=======================================\n');
    // Autenticar socket e extrair usuário do token
    let authenticatedUser = null;
    try {
        const token = socket.handshake.auth?.token;
        console.log(`🔍 Debug Token - Token recebido: ${token ? 'Sim' : 'Não'}`);
        console.log(`🔍 Debug Token - Token completo (primeiros 20 chars): ${token ? token.substring(0, 20) + '...' : 'null'}`);
        if (token) {
            // Primeiro, tentar como session token (novo sistema)
            const session = await UserSession_1.UserSessionModel.findByToken(token);
            if (session && await UserSession_1.UserSessionModel.isValidSession(token)) {
                // Token de sessão válido - buscar usuário
                authenticatedUser = await User_1.UserModel.findById(session.user_id);
                if (authenticatedUser) {
                    console.log(`🔑 Socket autenticado via SESSION TOKEN para usuário: ${authenticatedUser.name} (ID: ${authenticatedUser.id}, Role: ${authenticatedUser.role})`);
                    // Atualizar timestamp da sessão
                    await UserSession_1.UserSessionModel.updateActivity(token);
                }
                else {
                    console.log(`❌ Usuário não encontrado no banco: ID ${session.user_id}`);
                }
            }
            else {
                // Se não for session token, tentar como JWT (sistema antigo/fallback)
                const payload = User_1.UserModel.verifyToken(token);
                console.log(`🔍 Debug Token - Tentando como JWT - Payload decodificado:`, payload);
                if (payload && payload.id) {
                    authenticatedUser = await User_1.UserModel.findById(payload.id);
                    if (authenticatedUser) {
                        console.log(`🔑 Socket autenticado via JWT TOKEN para usuário: ${authenticatedUser.name} (ID: ${authenticatedUser.id}, Role: ${authenticatedUser.role})`);
                    }
                    else {
                        console.log(`❌ Usuário não encontrado no banco: ID ${payload.id}`);
                    }
                }
                else {
                    console.log(`❌ Token inválido (nem session nem JWT válido)`);
                    console.log(`🔍 Session encontrada:`, session ? 'Sim' : 'Não');
                    console.log(`🔍 Session válida:`, session ? await UserSession_1.UserSessionModel.isValidSession(token) : 'N/A');
                }
            }
        }
        else {
            console.log(`❌ Nenhum token fornecido na autenticação`);
            console.log(`🔍 Dados completos do handshake auth:`, socket.handshake.auth);
        }
    }
    catch (error) {
        console.error('❌ Erro na autenticação do socket:', error);
    }
    // Evento para entrar em sala do gestor
    socket.on('join_manager_room', (managerId) => {
        socket.join(`manager_${managerId}`);
        console.log(`👥 Socket ${socket.id} entrou na sala do gestor ${managerId}`);
    });
    // Evento para sair da sala do gestor
    socket.on('leave_manager_room', (managerId) => {
        socket.leave(`manager_${managerId}`);
        console.log(`👥 Socket ${socket.id} saiu da sala do gestor ${managerId}`);
    });
    // Evento para iniciar nova instância
    socket.on('start_instance', async (data) => {
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
                });
                return;
            }
            console.log(`🚀 Iniciando instância ${data.instanceId} para gestor ${data.managerId}...`);
            // Entrar na sala do gestor para receber eventos específicos
            socket.join(`manager_${data.managerId}`);
            console.log(`👥 Socket ${socket.id} entrou na sala do gestor ${data.managerId}`);
            socket.emit('status', {
                connected: false,
                message: 'Inicializando WhatsApp...'
            });
            await initializeWhatsAppClient(data.managerId, data.instanceId);
        }
        catch (error) {
            console.error('Erro ao iniciar instância:', error);
            socket.emit('status', {
                connected: false,
                message: 'Erro ao inicializar WhatsApp'
            });
        }
    });
    // Evento para parar instância
    socket.on('stop_instance', async (data) => {
        try {
            const instance = whatsappInstances.get(data.managerId);
            if (instance?.client) {
                console.log(`⏹️  Parando instância para gestor ${data.managerId}...`);
                instance.client.destroy();
                whatsappInstances.delete(data.managerId);
                // Atualizar no banco
                await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(data.instanceId, 'disconnected');
                socket.emit('status', {
                    connected: false,
                    message: 'WhatsApp desconectado'
                });
            }
        }
        catch (error) {
            console.error('Erro ao parar instância:', error);
        }
    });
    // Handler para enviar mensagens do operador
    socket.on('send_operator_message', async (data) => {
        try {
            console.log('\n=== SEND_OPERATOR_MESSAGE RECEBIDO ===');
            console.log('📤 Socket ID:', socket.id);
            console.log('📤 Dados:', data);
            console.log('🔑 authenticatedUser:', authenticatedUser ? { id: authenticatedUser.id, name: authenticatedUser.name, role: authenticatedUser.role } : 'NULL');
            console.log('=====================================\n');
            // Usar o usuário autenticado do socket em vez do managerId enviado pelo frontend
            if (!authenticatedUser) {
                console.error('❌ ERRO: Socket não autenticado para send_operator_message');
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
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
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
                const dbContact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, managerId);
                if (dbContact) {
                    // Buscar chat humano ativo
                    const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                    // Salvar mensagem do operador no banco
                    const savedMessage = await Message_1.MessageModel.create({
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
                }
                else {
                    console.error(`❌ Contato não encontrado para telefone: ${phoneNumber}`);
                }
            }
            catch (dbError) {
                console.error('❌ Erro ao salvar mensagem do operador no banco:', dbError);
            }
            // Confirmar envio
            socket.emit('message_sent_confirmation', {
                chatId: data.chatId,
                message: data.message,
                timestamp: new Date()
            });
        }
        catch (error) {
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
async function gracefulShutdown(signal) {
    console.log(`🔄 Recebido ${signal}, encerrando servidor graciosamente...`);
    try {
        // 1. Parar de aceitar novas conexões
        server.close();
        // 2. Fechar todas as instâncias do WhatsApp
        console.log('📱 Fechando instâncias do WhatsApp...');
        for (const [managerId, instance] of whatsappInstances) {
            try {
                if (instance.client) {
                    await instance.client.destroy();
                    console.log(`✅ Instância do gestor ${managerId} fechada`);
                }
            }
            catch (error) {
                console.error(`❌ Erro ao fechar instância do gestor ${managerId}:`, error);
            }
        }
        // 3. Fechar conexões de banco de dados
        console.log('🗃️ Fechando conexões de banco de dados...');
        await (0, database_1.closeDatabaseConnection)();
        await (0, database_1.closePool)();
        console.log('✅ Servidor encerrado graciosamente');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro durante shutdown gracioso:', error);
        process.exit(1);
    }
}
// Handlers para diferentes sinais
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handler para erros não capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason, promise);
    gracefulShutdown('unhandledRejection');
});
//# sourceMappingURL=server.js.map