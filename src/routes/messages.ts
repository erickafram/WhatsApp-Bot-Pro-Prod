import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import { MessageProjectModel, AutoMessageModel } from '../models/MessageProject';
import { ContactModel, MessageModel, HumanChatModel } from '../models/Message';
import { UserModel } from '../models/User';
import { executeQuery } from '../config/database';

const router = express.Router();

// ===== CONFIGURAÇÃO DO MULTER PARA UPLOAD =====

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'media');
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `DOC_${timestamp}_${req.user?.id || 'unknown'}${extension}`;
    cb(null, filename);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req: any, file: any, cb: any) => {
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
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ===== ROTAS DE CONTATOS =====

// Listar contatos do gestor com estatísticas
router.get('/contacts/:managerId', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const managerId = parseInt(req.params.managerId);
    
    // Verificar se o usuário tem permissão
    if (req.user.role !== 'admin' && req.user.id !== managerId) {
      return res.status(403).json({ error: 'Sem permissão para acessar estes contatos' });
    }

    // Buscar contatos com estatísticas
    const contactsQuery = `
      SELECT 
        c.*,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT CASE WHEN m.sender_type = 'contact' THEN m.id END) as messages_received,
        COUNT(DISTINCT CASE WHEN m.sender_type = 'operator' THEN m.id END) as messages_sent,
        COUNT(DISTINCT hc.id) as total_chats,
        COUNT(DISTINCT CASE WHEN hc.status IN ('active', 'pending', 'waiting_payment', 'paid') THEN hc.id END) as active_chats,
        MAX(m.created_at) as last_message_date,
        (SELECT content FROM messages WHERE contact_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
        (SELECT message_type FROM messages WHERE contact_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_type,
        MAX(hc.status) as last_chat_status
      FROM contacts c
      LEFT JOIN messages m ON c.id = m.contact_id
      LEFT JOIN human_chats hc ON c.id = hc.contact_id
      WHERE c.manager_id = ?
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `;

    const contactsResult = await executeQuery(contactsQuery, [managerId]);

    if (!Array.isArray(contactsResult)) {
      return res.status(500).json({ error: 'Erro ao buscar contatos' });
    }

    // Formatar contatos com estatísticas
    const contacts = contactsResult.map((contact: any) => {
      // Parse tags JSON
      let tags = null;
      if (contact.tags && typeof contact.tags === 'string') {
        try {
          tags = JSON.parse(contact.tags);
        } catch (e) {
          tags = null;
        }
      }

      return {
        id: contact.id,
        phone_number: contact.phone_number,
        name: contact.name || contact.phone_number,
        avatar: contact.avatar,
        tags: tags,
        notes: contact.notes,
        is_blocked: contact.is_blocked || false,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
        statistics: {
          total_messages: parseInt(contact.total_messages) || 0,
          messages_sent: parseInt(contact.messages_sent) || 0,
          messages_received: parseInt(contact.messages_received) || 0,
          last_message: {
            content: contact.last_message_content || undefined,
            date: contact.last_message_date || undefined,
            type: contact.last_message_type || undefined
          },
          chats: {
            total: parseInt(contact.total_chats) || 0,
            active: parseInt(contact.active_chats) || 0,
            last_status: contact.last_chat_status || undefined
          }
        }
      };
    });

    // Calcular resumo
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as total_contacts,
        COUNT(DISTINCT CASE WHEN hc.status IN ('active', 'pending', 'waiting_payment', 'paid') THEN hc.id END) as active_chats,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN m.id END) as recent_activity_24h
      FROM contacts c
      LEFT JOIN messages m ON c.id = m.contact_id
      LEFT JOIN human_chats hc ON c.id = hc.contact_id
      WHERE c.manager_id = ?
    `;

    const summaryResult = await executeQuery(summaryQuery, [managerId]);
    const summaryData = summaryResult && Array.isArray(summaryResult) ? summaryResult[0] : {};

    const summary = {
      total_contacts: parseInt(summaryData.total_contacts) || 0,
      active_chats: parseInt(summaryData.active_chats) || 0,
      total_messages: parseInt(summaryData.total_messages) || 0,
      recent_activity_24h: parseInt(summaryData.recent_activity_24h) || 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        contacts,
        summary
      }
    });
  } catch (error) {
    console.error('Erro ao listar contatos com estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Listar contatos simples (mantido para compatibilidade)
router.get('/contacts', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const contacts = await ContactModel.findByManager(req.user.id);
    res.json({ contacts });
  } catch (error) {
    console.error('Erro ao listar contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar contato
router.put('/contacts/:id', authenticate, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const { name, avatar, tags, notes } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const contact = await ContactModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este contato' });
    }
    
    const updatedContact = await ContactModel.update(contactId, {
      name,
      avatar,
      tags,
      notes
    });
    
    res.json({ contact: updatedContact });
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DE MENSAGENS =====

// Listar mensagens por contato
router.get('/contacts/:contactId/messages', authenticate, async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const contact = await ContactModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar mensagens deste contato' });
    }
    
    const messages = await MessageModel.findByContact(contactId, limit);
    
    res.json({ messages: messages.reverse() }); // Reverter para ordem cronológica
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as mensagens do gestor
router.get('/messages', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const messages = await MessageModel.findByManager(req.user.id, limit);
    
    res.json({ messages });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar contato por ID (específico - deve vir após a rota parametrizada)
router.get('/contacts/detail/:id', authenticate, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const contact = await ContactModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar este contato' });
    }
    
    res.json({ contact });
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar mensagens por número de telefone
router.get('/contacts/phone/:phoneNumber', authenticate, async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    console.log(`🔍 Debug API - Buscando mensagens para telefone: ${phoneNumber}`);
    
    // Buscar contato pelo telefone e gestor
    const contact = await ContactModel.findByPhoneAndManager(phoneNumber, req.user.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    console.log(`✅ Debug API - Contato encontrado: ${contact.id}`);
    
    // Buscar mensagens do contato
    const messages = await MessageModel.findByContact(contact.id, limit);
    
    console.log(`✅ Debug API - Encontradas ${messages.length} mensagens`);
    
    res.json({ messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens por telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Marcar mensagens como lidas
router.post('/contacts/:contactId/messages/mark-read', authenticate, async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const contact = await ContactModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && contact.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para marcar mensagens deste contato' });
    }
    
    await MessageModel.markContactMessagesAsRead(contactId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DE CHAT HUMANO =====

// Listar chats humanos do gestor
router.get('/human-chats', authenticate, async (req, res) => {
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

    const chats = await HumanChatModel.findByManager(
      managerId, 
      req.user.id, 
      req.user.role
    );
    
    res.json({ chats });
  } catch (error) {
    console.error('Erro ao listar chats humanos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar conversas pendentes
router.get('/human-chats/pending', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Determinar o manager_id baseado no papel do usuário
    let managerId = req.user.id;
    if (req.user.role === 'operator') {
      managerId = req.user.manager_id || req.user.id;
    }

    const pendingChats = await HumanChatModel.findPending(managerId);
    
    res.json({ chats: pendingChats });
  } catch (error) {
    console.error('Erro ao buscar chats pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar chat humano por ID
router.get('/human-chats/:id', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && chat.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar este chat' });
    }
    
    res.json({ chat });
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar mensagens de um chat humano
router.get('/human-chats/:chatId/messages', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId);
    const includeAll = req.query.include_all === 'true';
    const requestedLimit = parseInt(req.query.limit as string) || 50;
    
    // Se include_all=true, usar limite muito alto para pegar todas as mensagens
    const limit = includeAll ? Math.max(requestedLimit, 1000) : requestedLimit;
    
    console.log(`🔍 Debug API - chatId: ${req.params.chatId}, parsed: ${chatId}, includeAll: ${includeAll}, limit: ${limit}`);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (isNaN(chatId)) {
      return res.status(400).json({ error: 'ID do chat inválido' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar permissão
    let hasPermission = false;
    if (req.user.role === 'admin') {
      hasPermission = true;
    } else if (req.user.role === 'manager') {
      hasPermission = chat.manager_id === req.user.id;
    } else if (req.user.role === 'operator') {
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
      
      console.log(`🔍 Debug permissão operador:`)
      console.log(`  - chat.manager_id: ${chat.manager_id}`)
      console.log(`  - req.user.manager_id: ${req.user.manager_id}`)
      console.log(`  - chat.assigned_to: ${chat.assigned_to}`)
      console.log(`  - req.user.id: ${req.user.id}`)
      console.log(`  - chat.status: ${chat.status}`)
      console.log(`  - chat.transfer_to: ${chat.transfer_to}`)
      console.log(`  - chat.transfer_from: ${chat.transfer_from}`)
      console.log(`  - isAssigned: ${isAssigned}`)
      console.log(`  - isPendingForManager: ${isPendingForManager}`)
      console.log(`  - isTransferTo: ${isTransferTo}`)
      console.log(`  - isTransferFrom: ${isTransferFrom}`)
      console.log(`  - isSameManager: ${isSameManager}`)
      console.log(`  - hasPermission: ${hasPermission}`)
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Sem permissão para acessar mensagens deste chat' });
    }
    
    console.log(`🔍 Debug - Buscando mensagens para chat ${chatId} com limite ${limit}`);
    
    // Teste básico primeiro: verificar se a tabela tem dados
    try {
      const testQuery = `SELECT COUNT(*) as total FROM messages`;
      const testResult = await executeQuery(testQuery, []);
      console.log(`🔍 Debug - Total de mensagens na tabela:`, testResult);
    } catch (testError) {
      console.error('❌ Erro no teste básico:', testError);
    }
    
    const messages = await MessageModel.findByChat(chatId, limit);
    console.log(`✅ Debug - Encontradas ${messages.length} mensagens`);
    
    res.json({ messages });
  } catch (error) {
    console.error('Erro ao listar mensagens do chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status do chat humano
router.put('/human-chats/:id/status', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
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
    const chatBefore = await HumanChatModel.findById(chatId);
    console.log(`📋 Chat antes da atualização:`, {
      id: chatBefore?.id,
      status: chatBefore?.status,
      contact_id: chatBefore?.contact_id
    });

    const updatedChat = await HumanChatModel.updateStatus(chatId, status);

    // 🤖 REATIVAR CHATBOT quando conversa é encerrada/resolvida
    if (status === 'finished' || status === 'resolved') {
      console.log(`🤖 Chatbot REATIVADO para o contato do chat ${chatId} - Conversa ${status}`)
    console.log(`📱 INICIANDO PROCESSO DE PÓS-ENCERRAMENTO...`)
      
      // 📱 ENVIAR MENSAGEM DE PÓS-ENCERRAMENTO PARA O WHATSAPP
      try {
        // Buscar dados do chat e contato
        if (!updatedChat) {
          console.error('❌ Chat não encontrado após atualização');
          return;
        }
        
        const contact = await ContactModel.findById(updatedChat.contact_id);
        const operatorId = updatedChat.assigned_to || updatedChat.operator_id;
        const operator = operatorId ? await UserModel.findById(operatorId) : null;
        
        console.log(`🔍 Dados do chat:`, {
          chatId: updatedChat.id,
          managerId: updatedChat.manager_id,
          contactId: updatedChat.contact_id,
          operatorId: operatorId,
          operatorName: operator?.name
        });
        console.log(`📋 Contato encontrado:`, contact ? {id: contact.id, phone: contact.phone_number, name: contact.name} : 'NULL');
        
        if (contact) {
          // Buscar instância do WhatsApp do gestor
          const whatsappInstances = (global as any).whatsappInstances;
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
              contact.phone_number + '@s.whatsapp.net' :  // Baileys
              contact.phone_number + '@c.us';             // whatsapp-web.js
            
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
            } else if (instance.client) {
              // Enviar via whatsapp-web.js (fallback)
              await instance.client.sendMessage(phoneNumber, endMessage);
              console.log(`✅ Mensagem de pós-encerramento enviada via WHATSAPP-WEB.JS para ${contact.phone_number}`);
            }
            
            // 💾 SALVAR MENSAGEM DO SISTEMA NO BANCO
            await MessageModel.create({
              manager_id: updatedChat.manager_id,
              chat_id: chatId,
              contact_id: contact.id,
              sender_type: 'bot',
              content: endMessage,
              message_type: 'text'
            });
            
            // 🔄 MARCAR CONTATO COMO EM ESTADO DE PÓS-ENCERRAMENTO
            // Isso permite que o bot reconheça as opções 1, 2, 3
            const io = (global as any).io;
            if (io) {
              io.to(`manager_${updatedChat.manager_id}`).emit('chat_post_end_state', {
                contactPhone: contact.phone_number,
                operatorName: operatorName,
                chatId: chatId,
                timestamp: new Date()
              });
            }
            
          } else {
            console.error(`❌ Instância WhatsApp não disponível para gestor ${updatedChat.manager_id}`);
            console.error(`   - Instância existe: ${!!instance}`);
            console.error(`   - Cliente existe: ${!!instance?.client}`);
            console.error(`   - IsReady: ${instance?.isReady}`);
          }
        }
      } catch (endChatError) {
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
      const io = (global as any).io;
      if (io && updatedChat) {
        // Buscar dados do contato para o evento
        const contact = await ContactModel.findById(updatedChat.contact_id);
        const operatorId = updatedChat.assigned_to || updatedChat.operator_id;
        const operator = operatorId ? await UserModel.findById(operatorId) : null;
        
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
      } else {
        console.warn('⚠️ Socket.io não disponível para emitir eventos em tempo real');
      }
    } catch (socketError) {
      console.error('❌ Erro ao emitir eventos socket:', socketError);
      // Não falhar a requisição por causa de erro no socket
    }

    res.json({ chat: updatedChat });
  } catch (error) {
    console.error('Erro ao atualizar status do chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste para verificar atualização de status
router.get('/test-status/:id', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);

    // Buscar chat atual
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }

    console.log(`🧪 TESTE - Chat ${chatId} status atual: ${chat.status}`);

    // Tentar atualizar para 'waiting_payment'
    const testStatus = 'waiting_payment';
    const updatedChat = await HumanChatModel.updateStatus(chatId, testStatus);

    console.log(`🧪 TESTE - Chat ${chatId} status após update: ${updatedChat?.status}`);

    res.json({
      message: 'Teste de atualização de status',
      chatId,
      statusAnterior: chat.status,
      statusNovo: updatedChat?.status,
      sucesso: updatedChat?.status === testStatus
    });
  } catch (error) {
    console.error('Erro no teste de status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atribuir operador ao chat (compatibilidade)
router.put('/human-chats/:id/assign', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const { operatorId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && chat.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este chat' });
    }
    
    const updatedChat = await HumanChatModel.assignOperator(chatId, operatorId);
    
    res.json({ chat: updatedChat });
  } catch (error) {
    console.error('Erro ao atribuir operador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atribuir conversa a um usuário (iniciar atendimento)
router.post('/human-chats/:id/take', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
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
    const updatedChat = await HumanChatModel.assignToUser(chatId, req.user.id);
    
    // 🎯 ENVIAR MENSAGEM DE BOAS-VINDAS DO OPERADOR VIA WHATSAPP
    try {
      // Buscar informações do contato
      const contact = await ContactModel.findById(chat.contact_id);
      if (contact) {
        // Buscar instância ativa do WhatsApp
        const instances = (global as any).whatsappInstances;
        const instance = instances && instances.get(chat.manager_id);
        
        if ((instance?.client && instance.isReady) || (instance?.sock && instance.isReady)) {
          const operatorName = req.user.name || 'Operador';
          
          // Formato correto para Baileys vs whatsapp-web.js  
          const phoneNumber = instance.sock ? 
            contact.phone_number + '@s.whatsapp.net' :  // Baileys
            contact.phone_number + '@c.us';             // whatsapp-web.js
          
          // Mensagem de apresentação do operador (já inclui o nome)
          const welcomeMessage = `👋 Olá! Sou *${operatorName}* e estarei te atendendo hoje!

Como posso ajudá-lo? 😊`;

          console.log(`📤 Enviando mensagem de apresentação do operador ${operatorName} para ${phoneNumber}...`);
          
          // Usar Baileys ou whatsapp-web.js conforme disponível
          if (instance.sock) {
            // Enviar via Baileys
            await instance.sock.sendMessage(phoneNumber, { text: welcomeMessage });
            console.log(`✅ Mensagem de apresentação enviada via BAILEYS`);
          } else if (instance.client) {
            // Enviar via whatsapp-web.js (fallback)
            await instance.client.sendMessage(phoneNumber, welcomeMessage);
            console.log(`✅ Mensagem de apresentação enviada via WHATSAPP-WEB.JS`);
          }
          
          // 💾 SALVAR MENSAGEM DO OPERADOR NO BANCO
          await MessageModel.create({
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
          const io = (global as any).io;
          if (io) {
            io.to(`manager_${chat.manager_id}`).emit('operator_message_saved', {
              chatId: contact.phone_number + '@c.us',
              message: welcomeMessage,
              messageId: Date.now(), // ID temporário
              timestamp: new Date(),
              operatorName: operatorName
            });
          }
          
        } else {
          console.log(`⚠️ Instância WhatsApp não disponível para manager ${chat.manager_id}`);
        }
      }
    } catch (messageError) {
      console.error('❌ Erro ao enviar mensagem de boas-vindas:', messageError);
      // Não falhar a atribuição do chat por erro na mensagem
    }
    
    res.json({ 
      success: true,
      message: 'Chat atribuído com sucesso',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Erro ao atribuir chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Transferir conversa para outro operador
router.post('/human-chats/:id/transfer', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const { toUserId, transferReason } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!toUserId) {
      return res.status(400).json({ error: 'ID do usuário de destino é obrigatório' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
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
    const updatedChat = await HumanChatModel.transferToUser(
      chatId, 
      req.user.id, 
      toUserId, 
      transferReason
    );
    
    // Emitir eventos Socket.IO para atualizar dashboards
    if ((req as any).io && updatedChat) {
      const io = (req as any).io;
      
      // Buscar informações do operador que está transferindo e recebendo
      const fromUser = await executeQuery('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const toUser = await executeQuery('SELECT name, manager_id FROM users WHERE id = ?', [toUserId]);
      const chat = await HumanChatModel.findById(chatId);
      
      if (fromUser.length > 0 && toUser.length > 0 && chat) {
        // Buscar dados do contato
        const contact = await executeQuery('SELECT name, phone_number FROM contacts WHERE id = ?', [chat.contact_id]);
        const managerId = (toUser[0] as any).manager_id || chat.manager_id;
        
        // Evento para dashboard - nova transferência
        io.to(`manager_${managerId}`).emit('dashboard_chat_update', {
          type: 'transfer_created',
          chatId: chatId,
          customerName: contact.length > 0 ? (contact[0] as any).name || 'Cliente' : 'Cliente',
          customerPhone: contact.length > 0 ? (contact[0] as any).phone_number : '',
          status: 'transfer_pending',
          transferFrom: (fromUser[0] as any).name,
          transferTo: (toUser[0] as any).name,
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
  } catch (error) {
    console.error('Erro ao transferir chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar transferência de conversa
router.post('/human-chats/:id/accept-transfer', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar se é uma transferência pendente para este usuário
    if (chat.status !== 'transfer_pending' || chat.transfer_to !== req.user.id) {
      return res.status(403).json({ error: 'Transferência não encontrada ou não autorizada' });
    }
    
    // Aceitar a transferência
    const updatedChat = await HumanChatModel.acceptTransfer(chatId, req.user.id);
    
    res.json({ 
      success: true,
      message: 'Transferência aceita com sucesso',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Erro ao aceitar transferência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rejeitar transferência de conversa
router.post('/human-chats/:id/reject-transfer', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar se é uma transferência pendente para este usuário
    if (chat.status !== 'transfer_pending' || chat.transfer_to !== req.user.id) {
      return res.status(403).json({ error: 'Transferência não encontrada ou não autorizada' });
    }
    
    // Rejeitar a transferência
    const updatedChat = await HumanChatModel.rejectTransfer(chatId, req.user.id);
    
    res.json({ 
      success: true,
      message: 'Transferência rejeitada',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Erro ao rejeitar transferência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar transferências pendentes para o usuário atual
router.get('/human-chats/pending-transfers', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const pendingTransfers = await HumanChatModel.findPendingTransfers(req.user.id);
    
    res.json({ transfers: pendingTransfers });
  } catch (error) {
    console.error('Erro ao buscar transferências pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Liberar conversa (remover atribuição)
router.post('/human-chats/:id/release', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
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
    const updatedChat = await HumanChatModel.unassign(chatId);
    
    res.json({ 
      success: true,
      message: 'Chat liberado com sucesso',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Erro ao liberar chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enviar mensagem no chat humano
router.post('/human-chats/:chatId/messages', authenticate, async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId);
    const { content, messageType = 'text' } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }
    
    const chat = await HumanChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    
    // Verificar permissão para envio
    let canSendMessage = false;
    if (req.user.role === 'admin') {
      canSendMessage = true;
    } else if (req.user.role === 'manager') {
      canSendMessage = chat.manager_id === req.user.id;
    } else if (req.user.role === 'operator') {
      // Operador pode enviar se está atribuído ao chat
      canSendMessage = (chat.manager_id === req.user.manager_id) && 
                      (chat.assigned_to === req.user.id);
    }
    
    if (!canSendMessage) {
      return res.status(403).json({ error: 'Sem permissão para enviar mensagem neste chat' });
    }
    
    // Criar mensagem no banco
    const message = await MessageModel.create({
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
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de arquivo para chat humano
router.post('/upload-file', authenticate, upload.single('file'), async (req: Request, res: Response) => {
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
    const contact = await ContactModel.findByPhoneAndManager(chatNumber, managerId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Buscar chat humano ativo
    const humanChat = await HumanChatModel.findActiveByContact(contact.id);
    
    if (!humanChat) {
      return res.status(404).json({ error: 'Chat humano não encontrado' });
    }
    
    // Verificar permissão para envio
    let canSendFile = false;
    if (req.user.role === 'admin') {
      canSendFile = true;
    } else if (req.user.role === 'manager') {
      canSendFile = humanChat.manager_id === req.user.id;
    } else if (req.user.role === 'operator') {
      canSendFile = (humanChat.manager_id === req.user.manager_id) && 
                   (humanChat.assigned_to === req.user.id);
    }
    
    if (!canSendFile) {
      // Remover arquivo se não tem permissão
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Sem permissão para enviar arquivo neste chat' });
    }
    
    // Criar mensagem no banco com informações do arquivo
    const mediaUrl = `/uploads/media/${req.file.filename}`;
    
    const message = await MessageModel.create({
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
      const instances = (global as any).whatsappInstances;
      const instance = instances && instances.get(humanChat.manager_id);
      
      if (instance?.sock && instance.isReady) {
        // Formato correto para Baileys
        const phoneNumber = contact.phone_number + '@s.whatsapp.net';
        
        // Obter nome do operador
        const operatorName = req.user.name || 'Operador';
        
        // Preparar mídia para envio
        const filePath = path.resolve(req.file.path);
        
        let mediaMessage: any;
        
        if (req.file.mimetype.startsWith('image/')) {
          // Enviar como imagem
          mediaMessage = {
            image: { url: filePath },
            caption: `*${operatorName}:* 📷 ${req.file.originalname}`
          };
        } else {
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
        await executeQuery(
          'UPDATE messages SET content = ? WHERE id = ?',
          [`*${operatorName}:* 📎 ${req.file.originalname} ✅`, message.id]
        );
        
        // 📡 NOTIFICAR VIA SOCKET.IO QUE ARQUIVO FOI ENVIADO
        const io = (global as any).io;
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
        
      } else {
        console.warn(`⚠️ Instância do WhatsApp não disponível para manager ${humanChat.manager_id}`);
        console.warn(`🔍 Instance estado:`, {
          exists: !!instance,
          hasSock: !!(instance?.sock),
          isReady: instance?.isReady
        });
      }
    } catch (whatsappError) {
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
    
  } catch (error) {
    console.error('❌ Erro ao fazer upload do arquivo:', error);
    
    // Remover arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===== PROJETOS DE MENSAGENS =====

// Listar projetos de mensagens do gestor
router.get('/projects', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const projects = await MessageProjectModel.findByManagerId(req.user.id);
    res.json({ projects });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar projeto de mensagens
router.post('/projects', authenticate, async (req, res) => {
  try {
    const { name, description, is_default = false } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
    }
    
    const project = await MessageProjectModel.create({
      manager_id: req.user.id,
      name,
      description,
      is_default
    });
    
    res.json({ project });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar projeto por ID
router.get('/projects/:id', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar projeto
router.put('/projects/:id', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { name, description, is_active, is_default } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este projeto' });
    }
    
    const updatedProject = await MessageProjectModel.update(projectId, {
      name,
      description,
      is_active,
      is_default
    });
    
    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Definir projeto como padrão
router.post('/projects/:id/set-default', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este projeto' });
    }
    
    const updatedProject = await MessageProjectModel.setAsDefault(projectId);
    
    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Erro ao definir projeto padrão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar projeto
router.delete('/projects/:id', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para deletar este projeto' });
    }
    
    await MessageProjectModel.delete(projectId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== MENSAGENS AUTOMÁTICAS =====

// Listar mensagens de um projeto
router.get('/projects/:projectId/messages', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
    }
    
    const activeOnly = req.query.active_only === 'true';
    const messages = activeOnly 
      ? await AutoMessageModel.findActiveByProjectId(projectId)
      : await AutoMessageModel.findByProjectId(projectId);
    
    res.json({ messages });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar mensagem automática
router.post('/projects/:projectId/messages', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { trigger_words, response_text, is_active = true, order_index = 0 } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!trigger_words || !response_text) {
      return res.status(400).json({ error: 'Palavras-chave e texto de resposta são obrigatórios' });
    }
    
    const project = await MessageProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para criar mensagem neste projeto' });
    }
    
    const message = await AutoMessageModel.create({
      project_id: projectId,
      trigger_words,
      response_text,
      is_active,
      order_index
    });
    
    res.json({ message });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar mensagem automática por ID
router.get('/messages/:id', authenticate, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const message = await AutoMessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    // Verificar permissão através do projeto
    const project = await MessageProjectModel.findById(message.project_id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
    }
    
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar esta mensagem' });
    }
    
    res.json({ message });
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar mensagem automática
router.put('/messages/:id', authenticate, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const { trigger_words, response_text, is_active, order_index } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const message = await AutoMessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    // Verificar permissão através do projeto
    const project = await MessageProjectModel.findById(message.project_id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
    }
    
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar esta mensagem' });
    }
    
    const updatedMessage = await AutoMessageModel.update(messageId, {
      trigger_words,
      response_text,
      is_active,
      order_index
    });
    
    res.json({ message: updatedMessage });
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar mensagem automática
router.delete('/messages/:id', authenticate, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const message = await AutoMessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    // Verificar permissão através do projeto
    const project = await MessageProjectModel.findById(message.project_id);
    if (!project) {
      return res.status(404).json({ error: 'Projeto da mensagem não encontrado' });
    }
    
    if (req.user.role !== 'admin' && project.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta mensagem' });
    }
    
    await AutoMessageModel.delete(messageId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;