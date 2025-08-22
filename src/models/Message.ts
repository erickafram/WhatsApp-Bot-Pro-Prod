import { executeQuery } from '../config/database';

export interface Contact {
  id: number;
  manager_id: number;
  phone_number: string;
  name: string | null;
  avatar: string | null;
  tags: string[] | null;
  notes: string | null;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  manager_id: number;
  chat_id: number | null;
  contact_id: number;
  whatsapp_message_id: string | null;
  sender_type: 'contact' | 'bot' | 'operator';
  sender_id: number | null;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  media_url: string | null;
  is_read: boolean;
  delivered_at: Date | null;
  read_at: Date | null;
  created_at: Date;
}

export interface HumanChat {
  id: number;
  manager_id: number;
  contact_id: number;
  operator_id: number | null;
  assigned_to: number | null;
  status: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved' | 'transfer_pending';
  transfer_reason: string | null;
  transfer_from: number | null;
  transfer_to: number | null;
  tags: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactData {
  manager_id: number;
  phone_number: string;
  name?: string;
  avatar?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateMessageData {
  manager_id: number;
  chat_id?: number | null;
  contact_id: number;
  whatsapp_message_id?: string;
  sender_type: 'contact' | 'bot' | 'operator';
  sender_id?: number;
  content: string;
  message_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  media_url?: string;
}

export interface CreateHumanChatData {
  manager_id: number;
  contact_id: number;
  operator_id?: number;
  assigned_to?: number;
  status?: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved' | 'transfer_pending';
  transfer_reason?: string;
  transfer_from?: number;
  transfer_to?: number;
  tags?: string[];
}

// ===== MODELO DE CONTATOS =====

export class ContactModel {
  // Criar ou encontrar contato existente
  static async findOrCreate(data: CreateContactData): Promise<Contact> {
    // Primeiro tentar encontrar contato existente
    const existingContact = await this.findByPhoneAndManager(data.phone_number, data.manager_id);
    if (existingContact) {
      return existingContact;
    }

    // Criar novo contato
    const query = `
      INSERT INTO contacts (manager_id, phone_number, name, avatar, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const tagsJson = data.tags ? JSON.stringify(data.tags) : null;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.phone_number,
      data.name || null,
      data.avatar || null,
      tagsJson,
      data.notes || null
    ]);

    if (!result || typeof result !== 'object' || !('insertId' in result)) {
      throw new Error('Erro ao criar contato');
    }

    const newContact = await this.findById(result.insertId as number);
    if (!newContact) {
      throw new Error('Contato criado mas não encontrado');
    }

    return newContact;
  }

  // Buscar contato por telefone e gestor
  static async findByPhoneAndManager(phoneNumber: string, managerId: number): Promise<Contact | null> {
    const query = `
      SELECT * FROM contacts 
      WHERE phone_number = ? AND manager_id = ?
    `;
    
    const result = await executeQuery(query, [phoneNumber, managerId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const contact = result[0] as any;
    
    // Parse tags JSON
    if (contact.tags && typeof contact.tags === 'string') {
      try {
        contact.tags = JSON.parse(contact.tags);
      } catch (e) {
        contact.tags = null;
      }
    }
    
    return contact;
  }

  // Buscar contato por ID
  static async findById(id: number): Promise<Contact | null> {
    const query = `SELECT * FROM contacts WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const contact = result[0] as any;
    
    // Parse tags JSON
    if (contact.tags && typeof contact.tags === 'string') {
      try {
        contact.tags = JSON.parse(contact.tags);
      } catch (e) {
        contact.tags = null;
      }
    }
    
    return contact;
  }

  // Listar contatos do gestor
  static async findByManager(managerId: number): Promise<Contact[]> {
    const query = `
      SELECT * FROM contacts 
      WHERE manager_id = ? 
      ORDER BY updated_at DESC
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((contact: any) => {
      // Parse tags JSON
      if (contact.tags && typeof contact.tags === 'string') {
        try {
          contact.tags = JSON.parse(contact.tags);
        } catch (e) {
          contact.tags = null;
        }
      }
      return contact;
    });
  }

  // Atualizar contato
  static async update(id: number, updateData: Partial<CreateContactData>): Promise<Contact | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updateData.avatar);
    }
    
    if (updateData.tags !== undefined) {
      fields.push('tags = ?');
      values.push(updateData.tags ? JSON.stringify(updateData.tags) : null);
    }
    
    if (updateData.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateData.notes);
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    const query = `UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    await executeQuery(query, values);
    return this.findById(id);
  }
}

// ===== MODELO DE MENSAGENS =====

export class MessageModel {
  // Criar nova mensagem
  static async create(data: CreateMessageData): Promise<Message> {
    const query = `
      INSERT INTO messages (
        manager_id, chat_id, contact_id, whatsapp_message_id, 
        sender_type, sender_id, content, message_type, media_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.chat_id || null,
      data.contact_id,
      data.whatsapp_message_id || null,
      data.sender_type,
      data.sender_id || null,
      data.content,
      data.message_type || 'text',
      data.media_url || null
    ]);

    if (!result || typeof result !== 'object' || !('insertId' in result)) {
      throw new Error('Erro ao criar mensagem');
    }

    const newMessage = await this.findById(result.insertId as number);
    if (!newMessage) {
      throw new Error('Mensagem criada mas não encontrada');
    }

    return newMessage;
  }

  // Buscar mensagem por ID
  static async findById(id: number): Promise<Message | null> {
    const query = `SELECT * FROM messages WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return result[0] as Message;
  }

  // Buscar mensagens por contato
  static async findByContact(contactId: number, limit: number = 50): Promise<Message[]> {
    console.log(`🔍 Debug findByContact - contactId: ${contactId} (${typeof contactId}), limit: ${limit} (${typeof limit})`);
    
    if (!contactId || isNaN(contactId)) {
      console.error('❌ contactId inválido:', contactId);
      return [];
    }
    
    if (!limit || isNaN(limit) || limit <= 0) {
      limit = 50;
    }
    
    // Converter para inteiros explicitamente
    const safeContactId = parseInt(contactId.toString());
    const safeLimit = parseInt(limit.toString());
    
    // Query mais simples sem JOIN
    const query = `SELECT * FROM messages WHERE contact_id = ? ORDER BY created_at ASC LIMIT ?`;
    
    console.log(`🔍 Debug SQL findByContact - Query: ${query}`);
    console.log(`🔍 Debug SQL findByContact - Params originais: [${contactId}, ${limit}]`);
    console.log(`🔍 Debug SQL findByContact - Params seguros: [${safeContactId}, ${safeLimit}]`);
    
    const result = await executeQuery(query, [safeContactId, safeLimit]);
    
    if (!Array.isArray(result)) {
      console.log('❌ findByContact: Resultado não é array');
      return [];
    }
    
    console.log(`✅ Debug findByContact - Retornando ${result.length} mensagens para contact ${contactId}`);
    return result as any[];
  }

  // Buscar mensagens por chat humano
  static async findByChat(chatId: number, limit: number = 50): Promise<Message[]> {
    console.log(`🔍 Debug findByChat - chatId: ${chatId} (${typeof chatId}), limit: ${limit} (${typeof limit})`);
    
    if (!chatId || isNaN(chatId)) {
      console.error('❌ chatId inválido:', chatId);
      return [];
    }
    
    if (!limit || isNaN(limit) || limit <= 0) {
      limit = 50;
    }
    
    // Converter para inteiros explicitamente
    const safeChatId = parseInt(chatId.toString());
    const safeLimit = parseInt(limit.toString());
    
    // Buscar mensagens diretamente por chat_id
    const query = `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC LIMIT ?`;
    
    console.log(`🔍 Debug SQL findByChat - Query: ${query}`);
    console.log(`🔍 Debug SQL findByChat - Params: [${safeChatId}, ${safeLimit}]`);
    
    const result = await executeQuery(query, [safeChatId, safeLimit]);
    
    if (!Array.isArray(result)) {
      console.log('❌ findByChat: Resultado não é array');
      return [];
    }
    
    console.log(`✅ Debug findByChat - Retornando ${result.length} mensagens para chat ${chatId}`);
    return result as any[];
  }

  // Buscar mensagens por gestor (todas as conversas)
  static async findByManager(managerId: number, limit: number = 100): Promise<Message[]> {
    const query = `
      SELECT m.*, c.name as contact_name, c.phone_number 
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.manager_id = ? 
      ORDER BY m.created_at DESC 
      LIMIT ?
    `;
    
    const result = await executeQuery(query, [managerId, limit]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result as any[];
  }

  // Marcar mensagem como lida
  static async markAsRead(id: number): Promise<void> {
    const query = `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?`;
    await executeQuery(query, [id]);
  }

  // Marcar mensagens de um contato como lidas
  static async markContactMessagesAsRead(contactId: number): Promise<void> {
    const query = `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE contact_id = ? AND is_read = FALSE`;
    await executeQuery(query, [contactId]);
  }
}

// ===== MODELO DE CHAT HUMANO =====

export class HumanChatModel {
  // Criar nova conversa humana
  static async create(data: CreateHumanChatData): Promise<HumanChat> {
    const query = `
      INSERT INTO human_chats (manager_id, contact_id, operator_id, assigned_to, status, transfer_reason, transfer_from, transfer_to, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const tagsJson = data.tags ? JSON.stringify(data.tags) : null;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.contact_id,
      data.operator_id || null,
      data.assigned_to || null,
      data.status || 'pending',
      data.transfer_reason || null,
      data.transfer_from || null,
      data.transfer_to || null,
      tagsJson
    ]);

    if (!result || typeof result !== 'object' || !('insertId' in result)) {
      throw new Error('Erro ao criar chat humano');
    }

    const newChat = await this.findById(result.insertId as number);
    if (!newChat) {
      throw new Error('Chat criado mas não encontrado');
    }

    return newChat;
  }

  // Buscar chat por ID
  static async findById(id: number): Promise<HumanChat | null> {
    const query = `SELECT * FROM human_chats WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const chat = result[0] as any;
    
    // Parse tags JSON
    if (chat.tags && typeof chat.tags === 'string') {
      try {
        chat.tags = JSON.parse(chat.tags);
      } catch (e) {
        chat.tags = null;
      }
    }
    
    return chat;
  }

  // Buscar chats por gestor ou por atribuição (dependendo do papel do usuário)
  static async findByManager(managerId: number, userId?: number, userRole?: string): Promise<any[]> {
    let whereClause = '';
    let params: any[] = [];
    
    if (userRole === 'admin' || userRole === 'manager') {
      // Manager/Admin vê todas as conversas
      whereClause = 'WHERE hc.manager_id = ?';
      params = [managerId];
    } else {
      // Operador vê suas conversas atribuídas + conversas pendentes não atribuídas + transferências para ele
      whereClause = 'WHERE hc.manager_id = ? AND (hc.assigned_to = ? OR (hc.assigned_to IS NULL AND hc.status = "pending") OR hc.transfer_to = ?)';
      params = [managerId, userId, userId];
    }
    
    const query = `
      SELECT 
        hc.*,
        c.name as contact_name,
        c.phone_number,
        u_op.name as operator_name,
        u_assigned.name as assigned_name,
        u_from.name as transfer_from_name,
        u_to.name as transfer_to_name,
        (SELECT COUNT(*) FROM messages WHERE chat_id = hc.id AND is_read = FALSE) as unread_count,
        (SELECT content FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM human_chats hc
      LEFT JOIN contacts c ON hc.contact_id = c.id
      LEFT JOIN users u_op ON hc.operator_id = u_op.id
      LEFT JOIN users u_assigned ON hc.assigned_to = u_assigned.id
      LEFT JOIN users u_from ON hc.transfer_from = u_from.id
      LEFT JOIN users u_to ON hc.transfer_to = u_to.id
      ${whereClause}
      ORDER BY hc.updated_at DESC
    `;
    
    const result = await executeQuery(query, params);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((chat: any) => {
      // Parse tags JSON
      if (chat.tags && typeof chat.tags === 'string') {
        try {
          chat.tags = JSON.parse(chat.tags);
        } catch (e) {
          chat.tags = null;
        }
      }
      return chat;
    });
  }

  // Buscar chat ativo por contato
  static async findActiveByContact(contactId: number): Promise<HumanChat | null> {
    const query = `
      SELECT * FROM human_chats 
      WHERE contact_id = ? AND status IN ('pending', 'active', 'waiting_payment', 'transfer_pending') 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [contactId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const chat = result[0] as any;
    
    // Parse tags JSON
    if (chat.tags && typeof chat.tags === 'string') {
      try {
        chat.tags = JSON.parse(chat.tags);
      } catch (e) {
        chat.tags = null;
      }
    }
    
    return chat as HumanChat;
  }

  // Buscar qualquer chat por contato (incluindo encerrados)
  static async findAnyByContact(contactId: number): Promise<HumanChat | null> {
    const query = `
      SELECT * FROM human_chats 
      WHERE contact_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [contactId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const chat = result[0] as any;
    
    // Parse tags JSON
    if (chat.tags && typeof chat.tags === 'string') {
      try {
        chat.tags = JSON.parse(chat.tags);
      } catch (e) {
        chat.tags = null;
      }
    }
    
    return chat as HumanChat;
  }

  // Atualizar status do chat
  static async updateStatus(id: number, status: HumanChat['status']): Promise<HumanChat | null> {
    console.log(`🔄 HumanChatModel.updateStatus - ID: ${id}, Status: ${status}`);

    // Verificar se o chat existe antes de atualizar
    const existingChat = await this.findById(id);
    if (!existingChat) {
      console.error(`❌ Chat ${id} não encontrado para atualização`);
      return null;
    }

    console.log(`📋 Chat antes do update - Status atual: ${existingChat.status}`);

    const query = `UPDATE human_chats SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    console.log(`🔍 Executando query: ${query} com params: [${status}, ${id}]`);
    const result = await executeQuery(query, [status, id]);

    console.log(`📊 Update result:`, result);
    console.log(`📊 Affected rows:`, result?.affectedRows || 'N/A');

    // Verificação direta no banco para confirmar a atualização
    const directQuery = `SELECT id, status, updated_at FROM human_chats WHERE id = ?`;
    const directResult = await executeQuery(directQuery, [id]);
    console.log(`🔍 Verificação direta no banco:`, directResult);

    // Aguardar um pouco para garantir que a transação foi commitada
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedChat = await this.findById(id);
    console.log(`📋 Chat após update - Status: ${updatedChat?.status}`);

    if (updatedChat?.status !== status) {
      console.error(`❌ ERRO: Status não foi atualizado! Esperado: ${status}, Atual: ${updatedChat?.status}`);
      console.error(`❌ Resultado direto do banco:`, directResult);
    } else {
      console.log(`✅ Status atualizado com sucesso: ${status}`);
    }

    return updatedChat;
  }

  // Atribuir operador
  static async assignOperator(id: number, operatorId: number): Promise<HumanChat | null> {
    const query = `UPDATE human_chats SET operator_id = ?, status = 'active', updated_at = NOW() WHERE id = ?`;
    await executeQuery(query, [operatorId, id]);
    return this.findById(id);
  }

  // Atribuir conversa a um usuário (iniciar atendimento)
  static async assignToUser(id: number, userId: number): Promise<HumanChat | null> {
    const query = `UPDATE human_chats SET assigned_to = ?, status = 'active', updated_at = NOW() WHERE id = ?`;
    await executeQuery(query, [userId, id]);
    return this.findById(id);
  }

  // Transferir conversa entre operadores (cria transferência pendente)
  static async transferToUser(id: number, fromUserId: number, toUserId: number, transferReason?: string): Promise<HumanChat | null> {
    const updateFields = [
      'status = ?', 
      'transfer_from = ?', 
      'transfer_to = ?',
      'updated_at = NOW()'
    ];
    const params: any[] = ['transfer_pending', fromUserId, toUserId];
    
    if (transferReason) {
      updateFields.push('transfer_reason = ?');
      params.push(transferReason);
    }
    
    params.push(id);
    
    const query = `UPDATE human_chats SET ${updateFields.join(', ')} WHERE id = ?`;
    await executeQuery(query, params);
    return this.findById(id);
  }

  // Aceitar transferência
  static async acceptTransfer(id: number, userId: number): Promise<HumanChat | null> {
    const query = `
      UPDATE human_chats 
      SET assigned_to = ?, status = 'active', transfer_from = NULL, transfer_to = NULL, updated_at = NOW() 
      WHERE id = ? AND transfer_to = ? AND status = 'transfer_pending'
    `;
    await executeQuery(query, [userId, id, userId]);
    return this.findById(id);
  }

  // Rejeitar transferência
  static async rejectTransfer(id: number, userId: number): Promise<HumanChat | null> {
    const query = `
      UPDATE human_chats 
      SET status = 'active', transfer_from = NULL, transfer_to = NULL, transfer_reason = NULL, assigned_to = transfer_from, updated_at = NOW() 
      WHERE id = ? AND transfer_to = ? AND status = 'transfer_pending'
    `;
    await executeQuery(query, [id, userId]);
    return this.findById(id);
  }

  // Buscar transferências pendentes para um usuário
  static async findPendingTransfers(userId: number): Promise<any[]> {
    const query = `
      SELECT 
        hc.*,
        c.name as contact_name,
        c.phone_number,
        u_from.name as transfer_from_name,
        (SELECT COUNT(*) FROM messages WHERE chat_id = hc.id AND is_read = FALSE) as unread_count,
        (SELECT content FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM human_chats hc
      LEFT JOIN contacts c ON hc.contact_id = c.id
      LEFT JOIN users u_from ON hc.transfer_from = u_from.id
      WHERE hc.transfer_to = ? AND hc.status = 'transfer_pending'
      ORDER BY hc.updated_at DESC
    `;
    
    const result = await executeQuery(query, [userId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((chat: any) => {
      if (chat.tags && typeof chat.tags === 'string') {
        try {
          chat.tags = JSON.parse(chat.tags);
        } catch (e) {
          chat.tags = null;
        }
      }
      return chat;
    });
  }

  // Liberar conversa (remover atribuição)
  static async unassign(id: number): Promise<HumanChat | null> {
    const query = `UPDATE human_chats SET assigned_to = NULL, status = 'pending', updated_at = NOW() WHERE id = ?`;
    await executeQuery(query, [id]);
    return this.findById(id);
  }

  // Buscar conversas pendentes (não atribuídas)
  static async findPending(managerId: number): Promise<any[]> {
    const query = `
      SELECT 
        hc.*,
        c.name as contact_name,
        c.phone_number,
        (SELECT COUNT(*) FROM messages WHERE chat_id = hc.id AND is_read = FALSE) as unread_count,
        (SELECT content FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM human_chats hc
      LEFT JOIN contacts c ON hc.contact_id = c.id
      WHERE hc.manager_id = ? AND hc.assigned_to IS NULL AND hc.status = 'pending'
      ORDER BY hc.created_at ASC
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((chat: any) => {
      if (chat.tags && typeof chat.tags === 'string') {
        try {
          chat.tags = JSON.parse(chat.tags);
        } catch (e) {
          chat.tags = null;
        }
      }
      return chat;
    });
  }
}
