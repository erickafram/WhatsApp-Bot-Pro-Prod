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
const qrcode_1 = __importDefault(require("qrcode"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
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
// Servir arquivos estáticos do React build
app.use(express_1.default.static(path_1.default.join(__dirname, '../client/dist')));
// Variáveis globais para gerenciar instâncias
let whatsappClient = null;
let isClientReady = false;
let messageCount = 0;
let startTime = new Date();
let messageProjects = [];
let defaultProjectId = null;
let humanChats = [];
let humanModeContacts = new Set();
let autoMessages = [
    {
        id: '1',
        trigger: ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite'],
        response: 'Olá! {name} Sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Outras perguntas',
        active: true
    },
    {
        id: '2',
        trigger: ['1'],
        response: 'Nosso serviço oferece consultas médicas 24 horas por dia, 7 dias por semana, diretamente pelo WhatsApp.\n\nNão há carência, o que significa que você pode começar a usar nossos serviços imediatamente após a adesão.\n\nOferecemos atendimento médico ilimitado, receitas\n\nAlém disso, temos uma ampla gama de benefícios, incluindo acesso a cursos gratuitos\n\nLink para cadastro: https://site.com',
        active: true
    },
    {
        id: '3',
        trigger: ['2'],
        response: '*Plano Individual:* R$22,50 por mês.\n\n*Plano Família:* R$39,90 por mês, inclui você mais 3 dependentes.\n\n*Plano TOP Individual:* R$42,50 por mês, com benefícios adicionais como\n\n*Plano TOP Família:* R$79,90 por mês, inclui você mais 3 dependentes\n\nLink para cadastro: https://site.com',
        active: true
    },
    {
        id: '4',
        trigger: ['3'],
        response: 'Sorteio de em prêmios todo ano.\n\nAtendimento médico ilimitado 24h por dia.\n\nReceitas de medicamentos\n\nLink para cadastro: https://site.com',
        active: true
    },
    {
        id: '5',
        trigger: ['4'],
        response: 'Você pode aderir aos nossos planos diretamente pelo nosso site ou pelo WhatsApp.\n\nApós a adesão, você terá acesso imediato\n\nLink para cadastro: https://site.com',
        active: true
    },
    {
        id: '6',
        trigger: ['5'],
        response: 'Se você tiver outras dúvidas ou precisar de mais informações, por favor, fale aqui nesse whatsapp ou visite nosso site: https://site.com',
        active: true
    }
];
// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        connected: isClientReady,
        clientExists: whatsappClient !== null,
        messageCount,
        uptime: Date.now() - startTime.getTime()
    });
});
// Rota principal (React App)
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
});
// Função para inicializar o cliente WhatsApp
function initializeWhatsAppClient() {
    if (whatsappClient) {
        whatsappClient.destroy();
    }
    whatsappClient = new whatsapp_web_js_1.Client({
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });
    // Evento para gerar QR Code
    whatsappClient.on('qr', async (qr) => {
        console.log('🔄 QR Code gerado');
        try {
            const qrCodeData = await qrcode_1.default.toDataURL(qr);
            io.emit('qr', qrCodeData);
            io.emit('status', {
                connected: false,
                message: 'QR Code gerado - Escaneie com seu WhatsApp'
            });
        }
        catch (error) {
            console.error('❌ Erro ao gerar QR Code:', error);
        }
    });
    // Evento quando o cliente está pronto
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp conectado com sucesso!');
        isClientReady = true;
        startTime = new Date();
        io.emit('status', {
            connected: true,
            message: 'WhatsApp conectado com sucesso!'
        });
        io.emit('qr', null); // Remove QR code da tela
    });
    // Evento quando o cliente é desconectado
    whatsappClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp desconectado:', reason);
        isClientReady = false;
        io.emit('status', {
            connected: false,
            message: `WhatsApp desconectado: ${reason}`
        });
    });
    // Evento de erro de autenticação
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ Falha na autenticação:', msg);
        io.emit('status', {
            connected: false,
            message: 'Falha na autenticação - Tente novamente'
        });
    });
    // Sistema de mensagens automatizadas (chatbot)
    whatsappClient.on('message', async (msg) => {
        if (!msg.from.endsWith('@c.us'))
            return;
        messageCount++;
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        // Emitir estatísticas das mensagens para o dashboard
        io.emit('message_received', {
            from: msg.from,
            body: msg.body,
            timestamp: new Date()
        });
        // Se o contato está em modo humano, apenas repassar a mensagem
        if (humanModeContacts.has(msg.from)) {
            const contact = await msg.getContact();
            const contactName = contact.pushname || contact.number;
            io.emit('customer_message', {
                chatId: msg.from,
                message: msg.body,
                timestamp: new Date(),
                customerName: contactName
            });
            console.log(`💬 Mensagem de cliente em modo humano: ${contactName} - ${msg.body}`);
            return;
        }
        // Processar mensagens automáticas dinâmicas
        // Usar projeto padrão se definido, senão usar mensagens padrão
        let activeMessages = [];
        if (defaultProjectId) {
            const defaultProject = messageProjects.find(p => p.id === defaultProjectId && p.isActive);
            if (defaultProject) {
                activeMessages = defaultProject.messages.filter(msg => msg.active);
            }
            else {
                activeMessages = autoMessages.filter(msg => msg.active);
            }
        }
        else {
            activeMessages = autoMessages.filter(msg => msg.active);
        }
        // Lista de cidades disponíveis para verificação inteligente
        const availableCities = [
            'São Luís', 'Imperatriz', 'Brasília', 'Goiânia', 'Araguaína',
            'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins',
            'Barreiras', 'Luís Eduardo Magalhães', 'Teresina', 'Parnaíba'
        ];
        let messageProcessed = false;
        for (const autoMessage of activeMessages) {
            // Verificar se alguma palavra-chave corresponde
            const messageMatches = autoMessage.trigger.some(trigger => msg.body.toLowerCase().includes(trigger.toLowerCase()) ||
                msg.body.toLowerCase() === trigger.toLowerCase());
            if (messageMatches) {
                // Verificar se é uma solicitação de atendimento humano
                const isHumanRequest = autoMessage.trigger.some(trigger => ['3', 'operador', 'atendente', 'humano', 'pessoa'].includes(trigger.toLowerCase()));
                if (isHumanRequest) {
                    // Transferir para atendimento humano
                    await transferToHuman(msg, autoMessage.response);
                    messageProcessed = true;
                    break;
                }
                const chat = await msg.getChat();
                await delay(3000);
                await chat.sendStateTyping();
                await delay(3000);
                // Processar a resposta (substituir variáveis se necessário)
                let response = autoMessage.response;
                // Substituir {name} pelo nome do contato
                if (response.includes('{name}')) {
                    const contact = await msg.getContact();
                    const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                    response = response.replace(/{name}/g, name);
                }
                // Verificar se o cliente está disponível antes de enviar
                if (whatsappClient) {
                    await whatsappClient.sendMessage(msg.from, response);
                    await delay(1000);
                }
                messageProcessed = true;
                break; // Parar após a primeira correspondência
            }
        }
        // Se nenhuma mensagem foi processada, verificar se é uma cidade (SISTEMA OTIMIZADO)
        if (!messageProcessed && defaultProjectId) {
            const userMessage = msg.body.trim();
            // Verificar se parece ser uma cidade (mais de 3 caracteres, sem números, não é menu)
            if (userMessage.length > 3 && !/\d/.test(userMessage) && !/^[1-5]$/.test(userMessage)) {
                // Verificar se é uma cidade disponível
                const isCityAvailable = availableCities.some(city => city.toLowerCase().includes(userMessage.toLowerCase()) ||
                    userMessage.toLowerCase().includes(city.toLowerCase()) ||
                    city.toLowerCase() === userMessage.toLowerCase());
                const chat = await msg.getChat();
                await delay(3000);
                await chat.sendStateTyping();
                await delay(3000);
                let response = '';
                let cityName = userMessage;
                if (isCityAvailable) {
                    // Encontrar o nome correto da cidade
                    const correctCityName = availableCities.find(city => city.toLowerCase().includes(userMessage.toLowerCase()) ||
                        userMessage.toLowerCase().includes(city.toLowerCase()) ||
                        city.toLowerCase() === userMessage.toLowerCase()) || userMessage;
                    // Usar template de cidade disponível
                    const availableMessage = activeMessages.find(msg => msg.id === 'bus-city-available');
                    if (availableMessage) {
                        response = availableMessage.response.replace(/{CIDADE_NOME}/g, correctCityName);
                        cityName = correctCityName;
                    }
                }
                else {
                    // Usar template de cidade não disponível
                    const notAvailableMessage = activeMessages.find(msg => msg.id === 'bus-city-not-available');
                    if (notAvailableMessage) {
                        response = notAvailableMessage.response.replace(/{CIDADE_NOME}/g, userMessage);
                    }
                }
                // Substituir {name} pelo nome do contato
                if (response.includes('{name}')) {
                    const contact = await msg.getContact();
                    const name = contact.pushname ? contact.pushname.split(" ")[0] : 'amigo';
                    response = response.replace(/{name}/g, name);
                }
                // Enviar resposta
                if (whatsappClient && response) {
                    await whatsappClient.sendMessage(msg.from, response);
                    await delay(1000);
                    console.log(`🏙️ Resposta enviada para cidade: ${cityName} (${isCityAvailable ? 'DISPONÍVEL' : 'NÃO DISPONÍVEL'})`);
                }
            }
        }
    });
    // Inicializar o cliente
    whatsappClient.initialize();
}
// Função para transferir conversa para atendimento humano
async function transferToHuman(msg, botResponse) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    try {
        const contact = await msg.getContact();
        const contactName = contact.pushname || contact.number;
        const contactNumber = msg.from;
        // Adicionar à lista de contatos em modo humano
        humanModeContacts.add(contactNumber);
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
        if (whatsappClient) {
            await whatsappClient.sendMessage(contactNumber, response);
            await delay(1000);
        }
        // Criar histórico de mensagens iniciais
        const initialMessages = [
            {
                id: Date.now().toString(),
                from: msg.from,
                to: 'bot',
                body: msg.body,
                timestamp: new Date(),
                isFromBot: false,
                isFromHuman: false
            },
            {
                id: (Date.now() + 1).toString(),
                from: 'bot',
                to: msg.from,
                body: response,
                timestamp: new Date(),
                isFromBot: true,
                isFromHuman: false
            }
        ];
        // Notificar o dashboard sobre a nova solicitação
        const eventData = {
            chatId: contactNumber,
            customerName: contactName,
            customerPhone: contactNumber.replace('@c.us', ''),
            lastMessage: 'Solicitou atendimento humano',
            timestamp: new Date()
        };
        console.log('📤 Emitindo evento human_chat_requested:', eventData);
        console.log('📤 Total de sockets conectados:', io.engine.clientsCount);
        // Emitir para todos os sockets conectados
        io.emit('human_chat_requested', eventData);
        // Também emitir especificamente para cada socket como backup
        io.sockets.sockets.forEach((clientSocket, socketId) => {
            console.log(`📤 Enviando para socket ${socketId}`);
            clientSocket.emit('human_chat_requested', eventData);
        });
        console.log(`🔄 Conversa transferida para humano: ${contactName} (${contactNumber})`);
    }
    catch (error) {
        console.error('Erro ao transferir para humano:', error);
    }
}
// Socket.IO events
io.on('connection', (socket) => {
    console.log('🔗 Cliente conectado ao socket:', socket.id);
    // Enviar status atual
    socket.emit('status', {
        connected: isClientReady,
        message: isClientReady ? 'WhatsApp conectado' : 'WhatsApp desconectado'
    });
    // Evento para iniciar nova instância
    socket.on('start_instance', () => {
        console.log('🚀 Iniciando nova instância do WhatsApp...');
        socket.emit('status', {
            connected: false,
            message: 'Inicializando WhatsApp...'
        });
        initializeWhatsAppClient();
    });
    // Evento para parar instância
    socket.on('stop_instance', () => {
        if (whatsappClient) {
            console.log('⏹️  Parando instância do WhatsApp...');
            whatsappClient.destroy();
            whatsappClient = null;
            isClientReady = false;
            socket.emit('status', {
                connected: false,
                message: 'WhatsApp desconectado'
            });
        }
    });
    // Evento para atualizar mensagens automáticas
    socket.on('update_auto_messages', (messages) => {
        console.log('📝 Atualizando mensagens automáticas...');
        autoMessages = messages;
        console.log(`✅ ${messages.length} mensagens automáticas carregadas`);
    });
    // Eventos para gerenciar projetos de mensagens
    socket.on('update_message_projects', (projects) => {
        messageProjects = projects;
        console.log('📁 Projetos de mensagens atualizados:', projects.length, 'projetos');
    });
    socket.on('set_default_project', (projectId) => {
        defaultProjectId = projectId;
        console.log('⭐ Projeto padrão definido:', projectId || 'Mensagens padrão');
    });
    // Handler para enviar mensagens do operador
    socket.on('send_operator_message', async (data) => {
        try {
            if (!whatsappClient) {
                throw new Error('WhatsApp client não está disponível');
            }
            if (!isClientReady) {
                throw new Error('WhatsApp client não está conectado');
            }
            if (!data.chatId || !data.message) {
                throw new Error('ChatId ou mensagem não fornecidos');
            }
            console.log(`📤 Tentando enviar mensagem para ${data.chatId}: ${data.message}`);
            // Garantir que o chatId está no formato correto
            let targetChatId = data.chatId;
            if (!targetChatId.includes('@')) {
                targetChatId = targetChatId + '@c.us';
            }
            console.log(`📱 ChatId formatado: ${targetChatId}`);
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            await delay(1000);
            // Formatar mensagem com nome do operador
            const operatorName = data.operatorName || 'Operador';
            const formattedMessage = `*${operatorName}:* ${data.message}`;
            // Tentar enviar mensagem
            await whatsappClient.sendMessage(targetChatId, formattedMessage);
            console.log(`✅ Mensagem do operador enviada com sucesso para ${data.chatId}`);
            // Confirmar envio para o operador
            socket.emit('message_sent_confirmation', {
                chatId: data.chatId,
                message: data.message,
                timestamp: new Date()
            });
        }
        catch (error) {
            console.error('Erro ao enviar mensagem do operador:', error);
            socket.emit('message_send_error', {
                error: 'Erro ao enviar mensagem'
            });
        }
    });
    // Handler para finalizar chat humano
    socket.on('resolve_human_chat', (data) => {
        humanModeContacts.delete(data.contactNumber);
        console.log(`✅ Chat humano finalizado para: ${data.contactNumber}`);
    });
    // Handler para encerrar chat humano (volta para bot)
    socket.on('finish_human_chat', (data) => {
        console.log(`🔚 Chat encerrado: ${data.contactNumber}`);
        // Remove do modo humano - próximas mensagens vão para o bot
        humanModeContacts.delete(data.contactNumber);
    });
    // Handler para transferir chat
    socket.on('transfer_chat', (data) => {
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
    // Handler de teste para debug
    socket.on('test_connection', (data) => {
        console.log('🧪 Teste de conexão recebido:', data);
        console.log('🧪 Socket ativo:', socket.id);
        console.log('🧪 Total de clientes conectados:', io.engine.clientsCount);
    });
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado do socket:', socket.id);
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse o sistema em: http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map