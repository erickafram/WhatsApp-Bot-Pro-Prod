"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const MessageProject_1 = require("../models/MessageProject");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// ===== CONFIGURAÇÃO DO MULTER PARA UPLOAD =====
// Configurar storage do multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads', 'media');
        // Criar diretório se não existir
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extension = path_1.default.extname(file.originalname);
        const filename = `DOC_${timestamp}_${req.user?.id || 'unknown'}${extension}`;
        cb(null, filename);
    }
});
// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não suportado'), false);
    }
};
// Configuração do multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
// ===== ROTAS DE CONTATOS =====
// Listar contatos do gestor
router.get('/contacts', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const contacts = await Message_1.ContactModel.findByManager(req.user.id);
        res.json({ contacts });
    }
    catch (error) {
        console.error('Erro ao listar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar contato por ID
router.get('/contacts/:id', auth_1.authenticate, async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const contact = await Message_1.ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este contato' });
        }
        res.json({ contact });
    }
    catch (error) {
        console.error('Erro ao buscar contato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar contato
router.put('/contacts/:id', auth_1.authenticate, async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        const { name, avatar, tags, notes } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const contact = await Message_1.ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para editar este contato' });
        }
        const updatedContact = await Message_1.ContactModel.update(contactId, {
            name,
            avatar,
            tags,
            notes
        });
        res.json({ contact: updatedContact });
    }
    catch (error) {
        console.error('Erro ao atualizar contato:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// ===== ROTAS DE MENSAGENS =====
// Listar mensagens por contato
router.get('/contacts/:contactId/messages', auth_1.authenticate, async (req, res) => {
    try {
        const contactId = parseInt(req.params.contactId);
        const limit = parseInt(req.query.limit) || 50;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const contact = await Message_1.ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar mensagens deste contato' });
        }
        const messages = await Message_1.MessageModel.findByContact(contactId, limit);
        res.json({ messages: messages.reverse() }); // Reverter para ordem cronológica
    }
    catch (error) {
        console.error('Erro ao listar mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Listar todas as mensagens do gestor
router.get('/messages', auth_1.authenticate, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const messages = await Message_1.MessageModel.findByManager(req.user.id, limit);
        res.json({ messages });
    }
    catch (error) {
        console.error('Erro ao listar mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar mensagens por número de telefone
router.get('/contacts/phone/:phoneNumber', auth_1.authenticate, async (req, res) => {
    try {
        const phoneNumber = req.params.phoneNumber;
        const limit = parseInt(req.query.limit) || 50;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        console.log(`🔍 Debug API - Buscando mensagens para telefone: ${phoneNumber}`);
        // Buscar contato pelo telefone e gestor
        const contact = await Message_1.ContactModel.findByPhoneAndManager(phoneNumber, req.user.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        console.log(`✅ Debug API - Contato encontrado: ${contact.id}`);
        // Buscar mensagens do contato
        const messages = await Message_1.MessageModel.findByContact(contact.id, limit);
        console.log(`✅ Debug API - Encontradas ${messages.length} mensagens`);
        res.json({ messages });
    }
    catch (error) {
        console.error('Erro ao buscar mensagens por telefone:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Marcar mensagens como lidas
router.post('/contacts/:contactId/messages/mark-read', auth_1.authenticate, async (req, res) => {
    try {
        const contactId = parseInt(req.params.contactId);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const contact = await Message_1.ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para marcar mensagens deste contato' });
        }
        await Message_1.MessageModel.markContactMessagesAsRead(contactId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// ===== ROTAS DE CHAT HUMANO =====
// Listar chats humanos do gestor
router.get('/human-chats', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        // Determinar o manager_id baseado no papel do usuário
        let managerId = req.user.id;
        if (req.user.role === 'operator') {
            // Para operadores, precisamos encontrar o manager_id
            // Assumindo que operadores estão vinculados a um manager
            managerId = req.user.manager_id || req.user.id;
        }
        const chats = await Message_1.HumanChatModel.findByManager(managerId, req.user.id, req.user.role);
        res.json({ chats });
    }
    catch (error) {
        console.error('Erro ao listar chats humanos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar conversas pendentes
router.get('/human-chats/pending', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        // Determinar o manager_id baseado no papel do usuário
        let managerId = req.user.id;
        if (req.user.role === 'operator') {
            managerId = req.user.manager_id || req.user.id;
        }
        const pendingChats = await Message_1.HumanChatModel.findPending(managerId);
        res.json({ chats: pendingChats });
    }
    catch (error) {
        console.error('Erro ao buscar chats pendentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar chat humano por ID
router.get('/human-chats/:id', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && chat.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este chat' });
        }
        res.json({ chat });
    }
    catch (error) {
        console.error('Erro ao buscar chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar mensagens de um chat humano
router.get('/human-chats/:chatId/messages', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const includeAll = req.query.include_all === 'true';
        const requestedLimit = parseInt(req.query.limit) || 50;
        // Se include_all=true, usar limite muito alto para pegar todas as mensagens
        const limit = includeAll ? Math.max(requestedLimit, 1000) : requestedLimit;
        console.log(`🔍 Debug API - chatId: ${req.params.chatId}, parsed: ${chatId}, includeAll: ${includeAll}, limit: ${limit}`);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (isNaN(chatId)) {
            return res.status(400).json({ error: 'ID do chat inválido' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissão
        let hasPermission = false;
        if (req.user.role === 'admin') {
            hasPermission = true;
        }
        else if (req.user.role === 'manager') {
            hasPermission = chat.manager_id === req.user.id;
        }
        else if (req.user.role === 'operator') {
            // Operador pode acessar se:
            // 1. Está atribuído ao chat (assigned_to)
            // 2. É uma conversa pendente do seu manager
            // 3. Recebeu uma transferência (transfer_to)
            // 4. Fez uma transferência (transfer_from)
            const isAssigned = chat.assigned_to === req.user.id;
            const isPendingForManager = (chat.assigned_to === null && chat.status === 'pending' && chat.manager_id === req.user.manager_id);
            const isTransferTo = chat.transfer_to === req.user.id;
            const isTransferFrom = chat.transfer_from === req.user.id;
            const isSameManager = chat.manager_id === req.user.manager_id;
            hasPermission = isSameManager && (isAssigned || isPendingForManager || isTransferTo || isTransferFrom);
            console.log(`🔍 Debug permissão operador:`);
            console.log(`  - chat.manager_id: ${chat.manager_id}`);
            console.log(`  - req.user.manager_id: ${req.user.manager_id}`);
            console.log(`  - chat.assigned_to: ${chat.assigned_to}`);
            console.log(`  - req.user.id: ${req.user.id}`);
            console.log(`  - chat.status: ${chat.status}`);
            console.log(`  - chat.transfer_to: ${chat.transfer_to}`);
            console.log(`  - chat.transfer_from: ${chat.transfer_from}`);
            console.log(`  - isAssigned: ${isAssigned}`);
            console.log(`  - isPendingForManager: ${isPendingForManager}`);
            console.log(`  - isTransferTo: ${isTransferTo}`);
            console.log(`  - isTransferFrom: ${isTransferFrom}`);
            console.log(`  - isSameManager: ${isSameManager}`);
            console.log(`  - hasPermission: ${hasPermission}`);
        }
        if (!hasPermission) {
            return res.status(403).json({ error: 'Sem permissão para acessar mensagens deste chat' });
        }
        console.log(`🔍 Debug - Buscando mensagens para chat ${chatId} com limite ${limit}`);
        // Teste básico primeiro: verificar se a tabela tem dados
        try {
            const testQuery = `SELECT COUNT(*) as total FROM messages`;
            const testResult = await (0, database_1.executeQuery)(testQuery, []);
            console.log(`🔍 Debug - Total de mensagens na tabela:`, testResult);
        }
        catch (testError) {
            console.error('❌ Erro no teste básico:', testError);
        }
        const messages = await Message_1.MessageModel.findByChat(chatId, limit);
        console.log(`✅ Debug - Encontradas ${messages.length} mensagens`);
        res.json({ messages });
    }
    catch (error) {
        console.error('Erro ao listar mensagens do chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar status do chat humano
router.put('/human-chats/:id/status', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        const { status } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissão - operadores podem alterar status dos chats atribuídos a eles OU não atribuídos do mesmo manager
        const hasPermission = req.user.role === 'admin' ||
            chat.manager_id === req.user.id ||
            (req.user.role === 'operator' &&
                (chat.assigned_to === req.user.id ||
                    (chat.assigned_to === null && chat.manager_id === req.user.manager_id)));
        console.log('🔍 Debug permissão status:', {
            userRole: req.user.role,
            userId: req.user.id,
            userManagerId: req.user.manager_id,
            chatManagerId: chat.manager_id,
            chatAssignedTo: chat.assigned_to,
            isAdmin: req.user.role === 'admin',
            isManager: chat.manager_id === req.user.id,
            isAssignedOperator: req.user.role === 'operator' && chat.assigned_to === req.user.id,
            isUnassignedSameManager: req.user.role === 'operator' && chat.assigned_to === null && chat.manager_id === req.user.manager_id,
            hasPermission
        });
        if (!hasPermission) {
            return res.status(403).json({ error: 'Sem permissão para editar este chat' });
        }
        const validStatuses = ['pending', 'active', 'waiting_payment', 'paid', 'finished', 'resolved'];
        if (!validStatuses.includes(status)) {
            console.log(`❌ Status inválido recebido: ${status}. Válidos: ${validStatuses.join(', ')}`);
            return res.status(400).json({ error: 'Status inválido' });
        }
        console.log(`✅ Status válido: ${status}`);
        console.log(`🔄 Atualizando status do chat ${chatId} para: ${status}`);
        // Verificar se o chat existe e mostrar dados atuais
        const chatBefore = await Message_1.HumanChatModel.findById(chatId);
        console.log(`📋 Chat antes da atualização:`, {
            id: chatBefore?.id,
            status: chatBefore?.status,
            contact_id: chatBefore?.contact_id
        });
        const updatedChat = await Message_1.HumanChatModel.updateStatus(chatId, status);
        // 🤖 REATIVAR CHATBOT quando conversa é encerrada/resolvida
        if (status === 'finished' || status === 'resolved') {
            console.log(`🤖 Chatbot REATIVADO para o contato do chat ${chatId} - Conversa ${status}`);
            console.log(`📱 INICIANDO PROCESSO DE PÓS-ENCERRAMENTO...`);
            // 📱 ENVIAR MENSAGEM DE PÓS-ENCERRAMENTO PARA O WHATSAPP
            try {
                // Buscar dados do chat e contato
                if (!updatedChat) {
                    console.error('❌ Chat não encontrado após atualização');
                    return;
                }
                const contact = await Message_1.ContactModel.findById(updatedChat.contact_id);
                const operatorId = updatedChat.assigned_to || updatedChat.operator_id;
                const operator = operatorId ? await User_1.UserModel.findById(operatorId) : null;
                console.log(`🔍 Dados do chat:`, {
                    chatId: updatedChat.id,
                    managerId: updatedChat.manager_id,
                    contactId: updatedChat.contact_id,
                    operatorId: operatorId,
                    operatorName: operator?.name
                });
                console.log(`📋 Contato encontrado:`, contact ? { id: contact.id, phone: contact.phone_number, name: contact.name } : 'NULL');
                if (contact) {
                    // Buscar instância do WhatsApp do gestor
                    const whatsappInstances = global.whatsappInstances;
                    console.log(`🔍 whatsappInstances disponível:`, !!whatsappInstances);
                    console.log(`🔍 Instâncias ativas:`, whatsappInstances ? Array.from(whatsappInstances.keys()) : 'NENHUMA');
                    const instance = whatsappInstances?.get(updatedChat.manager_id);
                    console.log(`🔍 Instância para manager ${updatedChat.manager_id}:`, {
                        exists: !!instance,
                        clientExists: !!instance?.client,
                        isReady: instance?.isReady
                    });
                    // 🔧 COMPATÍVEL COM BAILEYS E WHATSAPP-WEB.JS
                    if ((instance?.client && instance.isReady) || (instance?.sock && instance.isReady)) {
                        const operatorName = operator ? operator.name : 'operador';
                        // Formato correto para Baileys vs whatsapp-web.js
                        const phoneNumber = instance.sock ?
                            contact.phone_number + '@s.whatsapp.net' : // Baileys
                            contact.phone_number + '@c.us'; // whatsapp-web.js
                        // Mensagem de encerramento com nome do operador
                        const endMessage = `*${operatorName}:* ✅ *CONVERSA ENCERRADA*

Sua conversa com o operador ${operatorName} foi finalizada.

Você pode a qualquer momento:

*1* - 👨‍💼 Voltar a falar com o operador ${operatorName}
*2* - 🏠 Ir para o Menu Principal  
*3* - 👥 Falar com outro operador

Digite o número da opção desejada! 😊`;
                        console.log(`📤 Enviando mensagem de pós-encerramento para ${phoneNumber}...`);
                        // Usar Baileys ou whatsapp-web.js conforme disponível
                        if (instance.sock) {
                            // Enviar via Baileys
                            await instance.sock.sendMessage(phoneNumber, { text: endMessage });
                            console.log(`✅ Mensagem de pós-encerramento enviada via BAILEYS para ${contact.phone_number}`);
                        }
                        else if (instance.client) {
                            // Enviar via whatsapp-web.js (fallback)
                            await instance.client.sendMessage(phoneNumber, endMessage);
                            console.log(`✅ Mensagem de pós-encerramento enviada via WHATSAPP-WEB.JS para ${contact.phone_number}`);
                        }
                        // 💾 SALVAR MENSAGEM DO SISTEMA NO BANCO
                        await Message_1.MessageModel.create({
                            manager_id: updatedChat.manager_id,
                            chat_id: chatId,
                            contact_id: contact.id,
                            sender_type: 'bot',
                            content: endMessage,
                            message_type: 'text'
                        });
                        // 🔄 MARCAR CONTATO COMO EM ESTADO DE PÓS-ENCERRAMENTO
                        // Isso permite que o bot reconheça as opções 1, 2, 3
                        const io = global.io;
                        if (io) {
                            io.to(`manager_${updatedChat.manager_id}`).emit('chat_post_end_state', {
                                contactPhone: contact.phone_number,
                                operatorName: operatorName,
                                chatId: chatId,
                                timestamp: new Date()
                            });
                        }
                    }
                    else {
                        console.error(`❌ Instância WhatsApp não disponível para gestor ${updatedChat.manager_id}`);
                        console.error(`   - Instância existe: ${!!instance}`);
                        console.error(`   - Cliente existe: ${!!instance?.client}`);
                        console.error(`   - IsReady: ${instance?.isReady}`);
                    }
                }
            }
            catch (endChatError) {
                console.error('❌ Erro ao enviar mensagem de pós-encerramento:', endChatError);
            }
        }
        console.log('✅ Status atualizado - Resposta:', {
            id: updatedChat?.id,
            status: updatedChat?.status,
            contact_id: updatedChat?.contact_id
        });
        if (!updatedChat) {
            return res.status(404).json({ error: 'Chat não encontrado após atualização' });
        }
        // 🚀 EMITIR EVENTO EM TEMPO REAL PARA TODOS OS USUÁRIOS DO MANAGER
        try {
            const io = global.io;
            if (io && updatedChat) {
                // Buscar dados do contato para o evento
                const contact = await Message_1.ContactModel.findById(updatedChat.contact_id);
                const operatorId = updatedChat.assigned_to || updatedChat.operator_id;
                const operator = operatorId ? await User_1.UserModel.findById(operatorId) : null;
                const eventData = {
                    type: 'status_changed',
                    chatId: updatedChat.id,
                    customerName: contact?.name || 'Cliente',
                    customerPhone: contact?.phone_number || '',
                    status: updatedChat.status,
                    previousStatus: chatBefore?.status || '',
                    timestamp: new Date(),
                    operatorName: operator?.name || '',
                    operatorId: operatorId,
                    managerId: updatedChat.manager_id
                };
                console.log(`📡 Emitindo evento status_changed para manager ${updatedChat.manager_id}:`, eventData);
                // Emitir para gestor e todos os operadores do gestor
                io.to(`manager_${updatedChat.manager_id}`).emit('human_chat_status_changed', eventData);
                // Também emitir o evento genérico dashboard_chat_update para compatibilidade
                io.to(`manager_${updatedChat.manager_id}`).emit('dashboard_chat_update', eventData);
                console.log(`✅ Eventos em tempo real enviados para manager ${updatedChat.manager_id}`);
            }
            else {
                console.warn('⚠️ Socket.io não disponível para emitir eventos em tempo real');
            }
        }
        catch (socketError) {
            console.error('❌ Erro ao emitir eventos socket:', socketError);
            // Não falhar a requisição por causa de erro no socket
        }
        res.json({ chat: updatedChat });
    }
    catch (error) {
        console.error('Erro ao atualizar status do chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota de teste para verificar atualização de status
router.get('/test-status/:id', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        // Buscar chat atual
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        console.log(`🧪 TESTE - Chat ${chatId} status atual: ${chat.status}`);
        // Tentar atualizar para 'waiting_payment'
        const testStatus = 'waiting_payment';
        const updatedChat = await Message_1.HumanChatModel.updateStatus(chatId, testStatus);
        console.log(`🧪 TESTE - Chat ${chatId} status após update: ${updatedChat?.status}`);
        res.json({
            message: 'Teste de atualização de status',
            chatId,
            statusAnterior: chat.status,
            statusNovo: updatedChat?.status,
            sucesso: updatedChat?.status === testStatus
        });
    }
    catch (error) {
        console.error('Erro no teste de status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atribuir operador ao chat (compatibilidade)
router.put('/human-chats/:id/assign', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        const { operatorId } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && chat.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para editar este chat' });
        }
        const updatedChat = await Message_1.HumanChatModel.assignOperator(chatId, operatorId);
        res.json({ chat: updatedChat });
    }
    catch (error) {
        console.error('Erro ao atribuir operador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atribuir conversa a um usuário (iniciar atendimento)
router.post('/human-chats/:id/take', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar se o chat já está atribuído
        if (chat.assigned_to && chat.assigned_to !== req.user.id) {
            return res.status(409).json({
                error: 'Chat já está sendo atendido por outro operador',
                assigned_to: chat.assigned_to
            });
        }
        // Atribuir o chat ao usuário atual
        const updatedChat = await Message_1.HumanChatModel.assignToUser(chatId, req.user.id);
        // 🎯 ENVIAR MENSAGEM DE BOAS-VINDAS DO OPERADOR VIA WHATSAPP
        try {
            // Buscar informações do contato
            const contact = await Message_1.ContactModel.findById(chat.contact_id);
            if (contact) {
                // Buscar instância ativa do WhatsApp
                const instances = global.whatsappInstances;
                const instance = instances && instances.get(chat.manager_id);
                if ((instance?.client && instance.isReady) || (instance?.sock && instance.isReady)) {
                    const operatorName = req.user.name || 'Operador';
                    // Formato correto para Baileys vs whatsapp-web.js  
                    const phoneNumber = instance.sock ?
                        contact.phone_number + '@s.whatsapp.net' : // Baileys
                        contact.phone_number + '@c.us'; // whatsapp-web.js
                    // Mensagem de apresentação do operador (já inclui o nome)
                    const welcomeMessage = `👋 Olá! Sou *${operatorName}* e estarei te atendendo hoje!

Como posso ajudá-lo? 😊`;
                    console.log(`📤 Enviando mensagem de apresentação do operador ${operatorName} para ${phoneNumber}...`);
                    // Usar Baileys ou whatsapp-web.js conforme disponível
                    if (instance.sock) {
                        // Enviar via Baileys
                        await instance.sock.sendMessage(phoneNumber, { text: welcomeMessage });
                        console.log(`✅ Mensagem de apresentação enviada via BAILEYS`);
                    }
                    else if (instance.client) {
                        // Enviar via whatsapp-web.js (fallback)
                        await instance.client.sendMessage(phoneNumber, welcomeMessage);
                        console.log(`✅ Mensagem de apresentação enviada via WHATSAPP-WEB.JS`);
                    }
                    // 💾 SALVAR MENSAGEM DO OPERADOR NO BANCO
                    await Message_1.MessageModel.create({
                        manager_id: chat.manager_id,
                        chat_id: chatId,
                        contact_id: contact.id,
                        sender_type: 'operator',
                        sender_id: req.user.id,
                        content: welcomeMessage,
                        message_type: 'text'
                    });
                    console.log(`💾 Mensagem de apresentação do operador ${operatorName} salva no banco`);
                    // 🔄 EMITIR PARA FRONTEND EM TEMPO REAL
                    const io = global.io;
                    if (io) {
                        io.to(`manager_${chat.manager_id}`).emit('operator_message_saved', {
                            chatId: contact.phone_number + '@c.us',
                            message: welcomeMessage,
                            messageId: Date.now(), // ID temporário
                            timestamp: new Date(),
                            operatorName: operatorName
                        });
                    }
                }
                else {
                    console.log(`⚠️ Instância WhatsApp não disponível para manager ${chat.manager_id}`);
                }
            }
        }
        catch (messageError) {
            console.error('❌ Erro ao enviar mensagem de boas-vindas:', messageError);
            // Não falhar a atribuição do chat por erro na mensagem
        }
        res.json({
            success: true,
            message: 'Chat atribuído com sucesso',
            chat: updatedChat
        });
    }
    catch (error) {
        console.error('Erro ao atribuir chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Transferir conversa para outro operador
router.post('/human-chats/:id/transfer', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        const { toUserId, transferReason } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!toUserId) {
            return res.status(400).json({ error: 'ID do usuário de destino é obrigatório' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissões: apenas manager/admin ou o operador atual pode transferir
        const canTransfer = req.user.role === 'admin' ||
            req.user.role === 'manager' ||
            chat.assigned_to === req.user.id;
        if (!canTransfer) {
            return res.status(403).json({ error: 'Sem permissão para transferir este chat' });
        }
        // Realizar a transferência (agora cria transferência pendente)
        const updatedChat = await Message_1.HumanChatModel.transferToUser(chatId, req.user.id, toUserId, transferReason);
        // Emitir eventos Socket.IO para atualizar dashboards
        if (req.io && updatedChat) {
            const io = req.io;
            // Buscar informações do operador que está transferindo e recebendo
            const fromUser = await (0, database_1.executeQuery)('SELECT name FROM users WHERE id = ?', [req.user.id]);
            const toUser = await (0, database_1.executeQuery)('SELECT name, manager_id FROM users WHERE id = ?', [toUserId]);
            const chat = await Message_1.HumanChatModel.findById(chatId);
            if (fromUser.length > 0 && toUser.length > 0 && chat) {
                // Buscar dados do contato
                const contact = await (0, database_1.executeQuery)('SELECT name, phone_number FROM contacts WHERE id = ?', [chat.contact_id]);
                const managerId = toUser[0].manager_id || chat.manager_id;
                // Evento para dashboard - nova transferência
                io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
                    type: 'transfer_created',
                    chatId: chatId,
                    customerName: contact.length > 0 ? contact[0].name || 'Cliente' : 'Cliente',
                    customerPhone: contact.length > 0 ? contact[0].phone_number : '',
                    status: 'transfer_pending',
                    transferFrom: fromUser[0].name,
                    transferTo: toUser[0].name,
                    transferReason: transferReason,
                    timestamp: new Date()
                });
                console.log(`📊 Evento dashboard_chat_update (transfer_created) emitido para gestor ${managerId}`);
            }
        }
        res.json({
            success: true,
            message: 'Transferência enviada. Aguardando aceite do operador.',
            chat: updatedChat
        });
    }
    catch (error) {
        console.error('Erro ao transferir chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Aceitar transferência de conversa
router.post('/human-chats/:id/accept-transfer', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar se é uma transferência pendente para este usuário
        if (chat.status !== 'transfer_pending' || chat.transfer_to !== req.user.id) {
            return res.status(403).json({ error: 'Transferência não encontrada ou não autorizada' });
        }
        // Aceitar a transferência
        const updatedChat = await Message_1.HumanChatModel.acceptTransfer(chatId, req.user.id);
        res.json({
            success: true,
            message: 'Transferência aceita com sucesso',
            chat: updatedChat
        });
    }
    catch (error) {
        console.error('Erro ao aceitar transferência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rejeitar transferência de conversa
router.post('/human-chats/:id/reject-transfer', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar se é uma transferência pendente para este usuário
        if (chat.status !== 'transfer_pending' || chat.transfer_to !== req.user.id) {
            return res.status(403).json({ error: 'Transferência não encontrada ou não autorizada' });
        }
        // Rejeitar a transferência
        const updatedChat = await Message_1.HumanChatModel.rejectTransfer(chatId, req.user.id);
        res.json({
            success: true,
            message: 'Transferência rejeitada',
            chat: updatedChat
        });
    }
    catch (error) {
        console.error('Erro ao rejeitar transferência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar transferências pendentes para o usuário atual
router.get('/human-chats/pending-transfers', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const pendingTransfers = await Message_1.HumanChatModel.findPendingTransfers(req.user.id);
        res.json({ transfers: pendingTransfers });
    }
    catch (error) {
        console.error('Erro ao buscar transferências pendentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Liberar conversa (remover atribuição)
router.post('/human-chats/:id/release', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissões: apenas manager/admin ou o operador atual pode liberar
        const canRelease = req.user.role === 'admin' ||
            req.user.role === 'manager' ||
            chat.assigned_to === req.user.id;
        if (!canRelease) {
            return res.status(403).json({ error: 'Sem permissão para liberar este chat' });
        }
        // Liberar o chat
        const updatedChat = await Message_1.HumanChatModel.unassign(chatId);
        res.json({
            success: true,
            message: 'Chat liberado com sucesso',
            chat: updatedChat
        });
    }
    catch (error) {
        console.error('Erro ao liberar chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Enviar mensagem no chat humano
router.post('/human-chats/:chatId/messages', auth_1.authenticate, async (req, res) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const { content, messageType = 'text' } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!content) {
            return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
        }
        const chat = await Message_1.HumanChatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat não encontrado' });
        }
        // Verificar permissão para envio
        let canSendMessage = false;
        if (req.user.role === 'admin') {
            canSendMessage = true;
        }
        else if (req.user.role === 'manager') {
            canSendMessage = chat.manager_id === req.user.id;
        }
        else if (req.user.role === 'operator') {
            // Operador pode enviar se está atribuído ao chat
            canSendMessage = (chat.manager_id === req.user.manager_id) &&
                (chat.assigned_to === req.user.id);
        }
        if (!canSendMessage) {
            return res.status(403).json({ error: 'Sem permissão para enviar mensagem neste chat' });
        }
        // Criar mensagem no banco
        const message = await Message_1.MessageModel.create({
            manager_id: chat.manager_id,
            chat_id: chatId,
            contact_id: chat.contact_id,
            sender_type: 'operator',
            sender_id: req.user.id,
            content: content,
            message_type: messageType
        });
        // TODO: Enviar mensagem via WhatsApp
        // Aqui você pode integrar com o cliente WhatsApp para enviar a mensagem
        res.json({ message });
    }
    catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Upload de arquivo para chat humano
router.post('/upload-file', auth_1.authenticate, upload.single('file'), async (req, res) => {
    try {
        console.log('📎 Recebendo upload de arquivo...');
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
        }
        const { chatId, operatorName } = req.body;
        if (!chatId) {
            return res.status(400).json({ error: 'ID do chat é obrigatório' });
        }
        console.log('📎 Arquivo recebido:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            chatId: chatId,
            operatorName: operatorName
        });
        // Buscar informações do chat para validar permissões
        const chatNumber = chatId.replace('@c.us', '');
        // Buscar contato pelo telefone (precisa do manager_id)
        const managerId = req.user.manager_id || req.user.id;
        const contact = await Message_1.ContactModel.findByPhoneAndManager(chatNumber, managerId);
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        // Buscar chat humano ativo
        const humanChat = await Message_1.HumanChatModel.findActiveByContact(contact.id);
        if (!humanChat) {
            return res.status(404).json({ error: 'Chat humano não encontrado' });
        }
        // Verificar permissão para envio
        let canSendFile = false;
        if (req.user.role === 'admin') {
            canSendFile = true;
        }
        else if (req.user.role === 'manager') {
            canSendFile = humanChat.manager_id === req.user.id;
        }
        else if (req.user.role === 'operator') {
            canSendFile = (humanChat.manager_id === req.user.manager_id) &&
                (humanChat.assigned_to === req.user.id);
        }
        if (!canSendFile) {
            // Remover arquivo se não tem permissão
            fs_1.default.unlinkSync(req.file.path);
            return res.status(403).json({ error: 'Sem permissão para enviar arquivo neste chat' });
        }
        // Criar mensagem no banco com informações do arquivo
        const mediaUrl = `/uploads/media/${req.file.filename}`;
        const message = await Message_1.MessageModel.create({
            manager_id: humanChat.manager_id,
            chat_id: humanChat.id,
            contact_id: contact.id,
            sender_type: 'operator',
            sender_id: req.user.id,
            content: `📎 Arquivo enviado: ${req.file.originalname}`,
            message_type: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
            media_url: mediaUrl
        });
        console.log('✅ Arquivo salvo e mensagem criada:', {
            messageId: message.id,
            mediaUrl: mediaUrl,
            originalName: req.file.originalname
        });
        // 📤 ENVIAR ARQUIVO VIA WHATSAPP BAILEYS
        try {
            // Buscar instância ativa do WhatsApp
            const instances = global.whatsappInstances;
            const instance = instances && instances.get(humanChat.manager_id);
            if (instance?.sock && instance.isReady) {
                // Formato correto para Baileys
                const phoneNumber = contact.phone_number + '@s.whatsapp.net';
                // Obter nome do operador
                const operatorName = req.user.name || 'Operador';
                // Preparar mídia para envio
                const filePath = path_1.default.resolve(req.file.path);
                let mediaMessage;
                if (req.file.mimetype.startsWith('image/')) {
                    // Enviar como imagem
                    mediaMessage = {
                        image: { url: filePath },
                        caption: `*${operatorName}:* 📷 ${req.file.originalname}`
                    };
                }
                else {
                    // Enviar como documento
                    mediaMessage = {
                        document: { url: filePath },
                        fileName: req.file.originalname,
                        caption: `*${operatorName}:* 📎 ${req.file.originalname}`,
                        mimetype: req.file.mimetype
                    };
                }
                console.log(`📤 Enviando arquivo via Baileys para ${phoneNumber}...`);
                console.log(`📁 Arquivo: ${req.file.originalname} (${req.file.mimetype})`);
                // Enviar arquivo via Baileys
                await instance.sock.sendMessage(phoneNumber, mediaMessage);
                console.log(`✅ Arquivo ${req.file.originalname} enviado com sucesso via Baileys!`);
                // Atualizar mensagem no banco com status de envio
                await (0, database_1.executeQuery)('UPDATE messages SET content = ? WHERE id = ?', [`*${operatorName}:* 📎 ${req.file.originalname} ✅`, message.id]);
                // 📡 NOTIFICAR VIA SOCKET.IO QUE ARQUIVO FOI ENVIADO
                const io = global.io;
                if (io) {
                    io.to(`manager_${humanChat.manager_id}`).emit('file_sent_success', {
                        chatId: chatId,
                        messageId: message.id,
                        filename: req.file.originalname,
                        mediaUrl: mediaUrl,
                        timestamp: new Date(),
                        operatorName: operatorName
                    });
                }
            }
            else {
                console.warn(`⚠️ Instância do WhatsApp não disponível para manager ${humanChat.manager_id}`);
                console.warn(`🔍 Instance estado:`, {
                    exists: !!instance,
                    hasSock: !!(instance?.sock),
                    isReady: instance?.isReady
                });
            }
        }
        catch (whatsappError) {
            console.error('❌ Erro ao enviar arquivo via WhatsApp:', whatsappError);
            // Não falhar a requisição se o WhatsApp falhar, arquivo já foi salvo
        }
        res.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            data: {
                messageId: message.id,
                filename: req.file.originalname,
                mediaUrl: mediaUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao fazer upload do arquivo:', error);
        // Remover arquivo em caso de erro
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// ===== PROJETOS DE MENSAGENS =====
// Listar projetos de mensagens do gestor
router.get('/projects', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const projects = await MessageProject_1.MessageProjectModel.findByManagerId(req.user.id);
        res.json({ projects });
    }
    catch (error) {
        console.error('Erro ao listar projetos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Criar projeto de mensagens
router.post('/projects', auth_1.authenticate, async (req, res) => {
    try {
        const { name, description, is_default = false } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!name) {
            return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
        }
        const project = await MessageProject_1.MessageProjectModel.create({
            manager_id: req.user.id,
            name,
            description,
            is_default
        });
        res.json({ project });
    }
    catch (error) {
        console.error('Erro ao criar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar projeto por ID
router.get('/projects/:id', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
        }
        res.json({ project });
    }
    catch (error) {
        console.error('Erro ao buscar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar projeto
router.put('/projects/:id', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const { name, description, is_active, is_default } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para editar este projeto' });
        }
        const updatedProject = await MessageProject_1.MessageProjectModel.update(projectId, {
            name,
            description,
            is_active,
            is_default
        });
        res.json({ project: updatedProject });
    }
    catch (error) {
        console.error('Erro ao atualizar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Definir projeto como padrão
router.post('/projects/:id/set-default', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para editar este projeto' });
        }
        const updatedProject = await MessageProject_1.MessageProjectModel.setAsDefault(projectId);
        res.json({ project: updatedProject });
    }
    catch (error) {
        console.error('Erro ao definir projeto padrão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Deletar projeto
router.delete('/projects/:id', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar este projeto' });
        }
        await MessageProject_1.MessageProjectModel.delete(projectId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao deletar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// ===== MENSAGENS AUTOMÁTICAS =====
// Listar mensagens de um projeto
router.get('/projects/:projectId/messages', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
        }
        const activeOnly = req.query.active_only === 'true';
        const messages = activeOnly
            ? await MessageProject_1.AutoMessageModel.findActiveByProjectId(projectId)
            : await MessageProject_1.AutoMessageModel.findByProjectId(projectId);
        res.json({ messages });
    }
    catch (error) {
        console.error('Erro ao listar mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Criar mensagem automática
router.post('/projects/:projectId/messages', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const { trigger_words, response_text, is_active = true, order_index = 0 } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!trigger_words || !response_text) {
            return res.status(400).json({ error: 'Palavras-chave e texto de resposta são obrigatórios' });
        }
        const project = await MessageProject_1.MessageProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para criar mensagem neste projeto' });
        }
        const message = await MessageProject_1.AutoMessageModel.create({
            project_id: projectId,
            trigger_words,
            response_text,
            is_active,
            order_index
        });
        res.json({ message });
    }
    catch (error) {
        console.error('Erro ao criar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar mensagem automática por ID
router.get('/messages/:id', auth_1.authenticate, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const message = await MessageProject_1.AutoMessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Mensagem não encontrada' });
        }
        // Verificar permissão através do projeto
        const project = await MessageProject_1.MessageProjectModel.findById(message.project_id);
        if (!project) {
            return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
        }
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar esta mensagem' });
        }
        res.json({ message });
    }
    catch (error) {
        console.error('Erro ao buscar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar mensagem automática
router.put('/messages/:id', auth_1.authenticate, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const { trigger_words, response_text, is_active, order_index } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const message = await MessageProject_1.AutoMessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Mensagem não encontrada' });
        }
        // Verificar permissão através do projeto
        const project = await MessageProject_1.MessageProjectModel.findById(message.project_id);
        if (!project) {
            return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
        }
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para editar esta mensagem' });
        }
        const updatedMessage = await MessageProject_1.AutoMessageModel.update(messageId, {
            trigger_words,
            response_text,
            is_active,
            order_index
        });
        res.json({ message: updatedMessage });
    }
    catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Deletar mensagem automática
router.delete('/messages/:id', auth_1.authenticate, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const message = await MessageProject_1.AutoMessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Mensagem não encontrada' });
        }
        // Verificar permissão através do projeto
        const project = await MessageProject_1.MessageProjectModel.findById(message.project_id);
        if (!project) {
            return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
        }
        if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar esta mensagem' });
        }
        await MessageProject_1.AutoMessageModel.delete(messageId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map