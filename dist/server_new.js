"use strict";
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
// Carregar variáveis de ambiente
dotenv_1.default.config();
// Importar configurações e modelos
const database_1 = require("./config/database");
const migrations_1 = require("./migrations/migrations");
const User_1 = require("./models/User");
const WhatsAppInstance_1 = require("./models/WhatsAppInstance");
const MessageProject_1 = require("./models/MessageProject");
const Message_1 = require("./models/Message");
// Importar rotas
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const messages_1 = __importDefault(require("./routes/messages"));
const devices_1 = __importDefault(require("./routes/devices"));
const operators_1 = __importDefault(require("./routes/operators"));
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
                // Verificar se existe chat humano ativo
                const activeChat = await Message_1.HumanChatModel.findActiveByContact(dbContact.id);
                // Salvar mensagem recebida no banco
                const savedMessage = await Message_1.MessageModel.create({
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
                });
                // Se existe chat humano ativo, não processar mensagens automáticas
                if (activeChat) {
                    console.log(`👤 Mensagem redirecionada para chat humano - ID: ${activeChat.id}`);
                    // Emitir mensagem para o chat humano
                    io.to(`manager_${managerId}`).emit('customer_message', {
                        chatId: phoneNumber + '@c.us',
                        message: msg.body,
                        timestamp: new Date(),
                        customerName: contactName,
                        managerId: managerId
                    });
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
                    return; // Não processar mensagens automáticas
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
    for (const autoMessage of activeMessages) {
        // Verificar se alguma palavra-chave corresponde
        const messageMatches = autoMessage.trigger_words.some((trigger) => msg.body.toLowerCase().includes(trigger.toLowerCase()) ||
            msg.body.toLowerCase() === trigger.toLowerCase());
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
        // 🗄️ CRIAR CHAT HUMANO NO BANCO
        const humanChat = await Message_1.HumanChatModel.create({
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
io.on('connection', async (socket) => {
    console.log('🔗 Cliente conectado ao socket:', socket.id);
    // Autenticar socket e extrair usuário do token
    let authenticatedUser = null;
    try {
        const token = socket.handshake.auth?.token;
        if (token) {
            const payload = User_1.UserModel.verifyToken(token);
            if (payload) {
                authenticatedUser = await User_1.UserModel.findById(payload.id);
                console.log(`🔑 Socket autenticado para usuário: ${authenticatedUser?.name} (ID: ${authenticatedUser?.id})`);
            }
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
process.on('SIGTERM', async () => {
    console.log('🔄 Encerrando servidor...');
    // Fechar todas as instâncias do WhatsApp
    for (const [managerId, instance] of whatsappInstances) {
        try {
            if (instance.client) {
                await instance.client.destroy();
            }
        }
        catch (error) {
            console.error(`Erro ao fechar instância do gestor ${managerId}:`, error);
        }
    }
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});
//# sourceMappingURL=server_new.js.map