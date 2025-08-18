import express from 'express';
import { authenticate } from '../middleware/auth';
import { MessageProjectModel, AutoMessageModel } from '../models/MessageProject';
import { ContactModel, MessageModel, HumanChatModel } from '../models/Message';
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
      // Operador pode acessar se está atribuído ao chat ou se é uma conversa pendente do seu manager
      hasPermission = (chat.manager_id === req.user.manager_id) && 
                     (chat.assigned_to === req.user.id || (chat.assigned_to === null && chat.status === 'pending'));
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
    
    // Verificar permissão
    if (req.user.role !== 'admin' && chat.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este chat' });
    }
    
    const validStatuses = ['pending', 'active', 'waiting_payment', 'paid', 'finished', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const updatedChat = await HumanChatModel.updateStatus(chatId, status);
    
    res.json({ chat: updatedChat });
  } catch (error) {
    console.error('Erro ao atualizar status do chat:', error);
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
    
    // Realizar a transferência
    const updatedChat = await HumanChatModel.transferToUser(
      chatId, 
      req.user.id, 
      toUserId, 
      transferReason
    );
    
    res.json({ 
      success: true,
      message: 'Chat transferido com sucesso',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Erro ao transferir chat:', error);
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