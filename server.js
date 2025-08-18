const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const { Client } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variáveis globais para gerenciar instâncias
let whatsappClient = null;
let isClientReady = false;
let finishedChats = new Set(); // Armazenar chats encerrados

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        connected: isClientReady,
        clientExists: whatsappClient !== null
    });
});

// Função para inicializar o cliente WhatsApp
function initializeWhatsAppClient() {
    if (whatsappClient) {
        whatsappClient.destroy();
    }

    whatsappClient = new Client({
        authStrategy: undefined, // Usar autenticação padrão
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=VizDisplayCompositor'
            ],
            executablePath: undefined, // Deixar o puppeteer encontrar o Chrome automaticamente
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
    });

    // Evento para gerar QR Code
    whatsappClient.on('qr', async (qr) => {
        console.log('QR Code gerado');
        try {
            const qrCodeData = await QRCode.toDataURL(qr);
            io.emit('qr', qrCodeData);
            io.emit('status', { 
                connected: false, 
                message: 'QR Code gerado - Escaneie com seu WhatsApp' 
            });
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
        }
    });

    // Evento quando o cliente está pronto
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp conectado com sucesso!');
        isClientReady = true;
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

    // Tratamento de erros gerais
    whatsappClient.on('error', (error) => {
        console.error('❌ Erro no cliente WhatsApp:', error);
        io.emit('status', { 
            connected: false, 
            message: 'Erro na conexão - Tente novamente' 
        });
    });

    // Sistema de mensagens automatizadas - Viação Palmas
    whatsappClient.on('message', async msg => {
        if (!msg.from.endsWith('@c.us')) return;

        const delay = ms => new Promise(res => setTimeout(res, ms));
        const contact = await msg.getContact();
        const name = contact.pushname || 'Cliente';

        // Verificar se o chat foi encerrado e reativar com menu
        if (finishedChats.has(msg.from)) {
            console.log('🔄 Chat encerrado reativado automaticamente:', msg.from);
            finishedChats.delete(msg.from); // Remove da lista de encerrados
            
            // Mostrar menu inicial automaticamente
            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, `🚌 Olá! ${name.split(" ")[0]} Bem-vindo de volta à Viação Palmas!\n\nComo posso ajudá-lo hoje?\n\n1 - 🎫 Comprar Passagem\n2 - 🕐 Ver Horários\n3 - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊`);
            
            // Emitir estatísticas das mensagens
            io.emit('message_received', {
                from: msg.from,
                body: msg.body,
                timestamp: new Date()
            });
            return;
        }

        // Detectar solicitação de atendimento humano
        if (msg.body.match(/(operador|atendente|humano|pessoa|falar com|atendimento|suporte|ajuda personalizada|quero falar)/i)) {
            console.log('👨‍💼 Solicitação de atendimento humano detectada');
            
            // Emitir evento para o Chat Humano
            io.emit('human_chat_requested', {
                chatId: msg.from,
                customerName: name.split(" ")[0],
                customerPhone: msg.from.replace('@c.us', ''),
                lastMessage: msg.body,
                timestamp: new Date()
            });

            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, `👨‍💼 FALAR COM OPERADOR\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ Horário de Atendimento:\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨`);
            
            // Emitir estatísticas das mensagens
            io.emit('message_received', {
                from: msg.from,
                body: msg.body,
                timestamp: new Date()
            });
            return;
        }

        // Menu principal
        if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, `🚌 Olá! ${name.split(" ")[0]} Bem-vindo à Viação Palmas!\n\nComo posso ajudá-lo hoje?\n\n1 - 🎫 Comprar Passagem\n2 - 🕐 Ver Horários\n3 - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊`);
            await delay(3000);
            await chat.sendStateTyping();
            await delay(5000);
        }

        // Opção 1 - Comprar Passagem
        if (msg.body === '1') {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, '🎫 COMPRAR PASSAGEM\n\nNossa origem é sempre: Palmas - TO 🏙️\n\nPara qual cidade você gostaria de viajar?\n\nCidades disponíveis:\n* São Luís - MA\n* Imperatriz - MA\n* Brasília - DF\n* Goiânia - GO\n* Araguaína - TO\n* Gurupi - TO\n* Porto Nacional - TO\n* Paraíso do Tocantins - TO\n* Colinas do Tocantins - TO\n* Barreiras - BA\n* Luís Eduardo Magalhães - BA\n* Teresina - PI\n* Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️');
        }

        // Opção 2 - Ver Horários
        if (msg.body === '2') {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, '🕐 HORÁRIOS DE SAÍDA\n\nSaídas de Palmas - TO:\n\n🌅 Manhã\n* 06:00 - Destinos: Brasília, Goiânia\n* 07:30 - Destinos: São Luís, Imperatriz\n* 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 Tarde\n* 14:00 - Destinos: Teresina, Parnaíba\n* 15:30 - Destinos: Barreiras, L.E. Magalhães\n* 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 Noite\n* 20:00 - Destinos: Brasília, Goiânia\n* 21:30 - Destinos: São Luís, Imperatriz\n* 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite 1! 🎫');
        }

        // Opção 3 - Falar com Operador
        if (msg.body === '3') {
            console.log('👨‍💼 Solicitação de atendimento humano detectada via opção 3');
            
            // Emitir evento para o Chat Humano
            io.emit('human_chat_requested', {
                chatId: msg.from,
                customerName: name.split(" ")[0],
                customerPhone: msg.from.replace('@c.us', ''),
                lastMessage: 'Solicitou falar com operador via menu',
                timestamp: new Date()
            });

            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, `👨‍💼 FALAR COM OPERADOR\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ Horário de Atendimento:\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨`);
        }

        // Processamento de cidades escolhidas
        if (msg.body.match(/(São Luís|são luís|Sao Luis|sao luis)/i)) {
            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, '✅ Excelente escolha! Temos passagens para São Luís!\n\n🎫 Informações da Viagem:\n📍 Origem: Palmas - TO\n📍 Destino: São Luís\n🕐 Horários disponíveis: Consulte digitando 2\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 Nome completo\n📱 Telefone para contato\n📅 Data da viagem desejada\n🆔 CPF\n\nOu se preferir, fale com nosso operador digitando 3!\n\nVamos prosseguir? 😊🚌');
        } else if (msg.body.match(/(São Luis|são luis)/i)) {
            const chat = await msg.getChat();
            await delay(2000);
            await chat.sendStateTyping();
            await delay(3000);
            await whatsappClient.sendMessage(msg.from, '❌ Infelizmente não temos passagens para São Luis\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 Viações Recomendadas:\n* Expresso Guanabara\n* Viação Útil\n* Real Expresso\n* Eucatur\n\nOu consulte nossos destinos disponíveis digitando 1!\n\nDestinos que atendemos:\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊');
        }

        // Emitir mensagem para o operador se o chat estiver ativo no Chat Humano
        io.emit('customer_message', {
            chatId: msg.from,
            message: msg.body,
            timestamp: new Date(),
            customerName: name.split(" ")[0]
        });

        // Emitir estatísticas das mensagens para o dashboard
        io.emit('message_received', {
            from: msg.from,
            body: msg.body,
            timestamp: new Date()
        });
    });

    // Inicializar o cliente
    try {
        whatsappClient.initialize();
    } catch (error) {
        console.error('❌ Erro ao inicializar cliente WhatsApp:', error);
        io.emit('status', { 
            connected: false, 
            message: 'Erro ao inicializar - Tente novamente' 
        });
    }
}

// Socket.IO events
io.on('connection', (socket) => {
    console.log('Cliente conectado ao socket:', socket.id);

    // Enviar status atual
    socket.emit('status', { 
        connected: isClientReady, 
        message: isClientReady ? 'WhatsApp conectado' : 'Pronto para conectar' 
    });

    // Evento para iniciar nova instância
    socket.on('start_instance', () => {
        console.log('Iniciando nova instância do WhatsApp...');
        socket.emit('status', { 
            connected: false, 
            message: 'Inicializando WhatsApp...' 
        });
        initializeWhatsAppClient();
    });

    // Evento para parar instância
    socket.on('stop_instance', () => {
        if (whatsappClient) {
            console.log('Parando instância do WhatsApp...');
            whatsappClient.destroy();
            whatsappClient = null;
            isClientReady = false;
            socket.emit('status', { 
                connected: false, 
                message: 'WhatsApp desconectado' 
            });
        }
    });

    // Evento para enviar mensagem do operador para o cliente
    socket.on('send_operator_message', async (data) => {
        if (whatsappClient && isClientReady) {
            try {
                const { chatId, message } = data;
                await whatsappClient.sendMessage(chatId, message);
                console.log(`📤 Mensagem do operador enviada para ${chatId}`);
                
                // Confirmar envio para o operador
                socket.emit('message_sent_confirmation', {
                    chatId: chatId,
                    message: message,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('❌ Erro ao enviar mensagem do operador:', error);
                socket.emit('message_send_error', {
                    error: 'Erro ao enviar mensagem'
                });
            }
        } else {
            socket.emit('message_send_error', {
                error: 'WhatsApp não está conectado'
            });
        }
    });

    // Evento para marcar chat como resolvido
    socket.on('resolve_chat', (data) => {
        console.log(`✅ Chat resolvido: ${data.chatId}`);
        io.emit('chat_resolved', data);
    });

    // Evento para encerrar chat humano (volta para bot)
    socket.on('finish_human_chat', (data) => {
        console.log(`🔚 Chat encerrado: ${data.contactNumber}`);
        // Adicionar à lista de chats encerrados para reativação automática
        const chatId = data.contactNumber + '@c.us';
        finishedChats.add(chatId);
        console.log(`📝 Chat ${chatId} adicionado à lista de encerrados`);
    });

    // Evento para transferir chat
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

    // Evento de teste para debug
    socket.on('test_connection', (data) => {
        console.log('🧪 Teste de conexão recebido:', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado do socket:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse o sistema em: http://localhost:${PORT}`);
});
