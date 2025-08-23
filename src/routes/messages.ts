import express from 'express';
import { authenticate } from '../middleware/auth';
import { MessageProjectModel, AutoMessageModel } from '../models/MessageProject';
import { ContactModel, MessageModel, HumanChatModel } from '../models/Message';
import { UserModel } from '../models/User';
import { executeQuery } from '../config/database';

const router = express.Router();

// ===== ROTAS DE CONTATOS =====

// Listar contatos do gestor
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

// Buscar contato por ID
router.get('/contacts/:id', authenticate, async (req, res) => {
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
    const limit = parseInt(req.query.limit as string) || 50;
    
    console.log(`🔍 Debug API - chatId: ${req.params.chatId}, parsed: ${chatId}, limit: ${limit}`);
    
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
          
          if (instance?.client && instance.isReady) {
            const operatorName = operator ? operator.name : 'operador';
            const phoneNumber = contact.phone_number + '@c.us';
            
            // Mensagem de encerramento com opções
            const endMessage = `✅ *CONVERSA ENCERRADA*

Sua conversa com o operador ${operatorName} foi finalizada.

Você pode a qualquer momento:

*1* - 👨‍💼 Voltar a falar com o operador ${operatorName}
*2* - 🏠 Ir para o Menu Principal  
*3* - 👥 Falar com outro operador

Digite o número da opção desejada! 😊`;

            console.log(`📤 Enviando mensagem de pós-encerramento para ${phoneNumber}...`);
            await instance.client.sendMessage(phoneNumber, endMessage);
            console.log(`✅ Mensagem de pós-encerramento enviada com sucesso para ${contact.phone_number}`);
            
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