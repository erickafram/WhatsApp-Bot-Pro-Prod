import express from 'express'
import bcrypt from 'bcrypt'
import { authenticate } from '../middleware/auth'
import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = express.Router()

// Interface para Operador
interface Operator {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  is_active: boolean
  manager_id: number
  created_at: string
  updated_at: string
}

// Middleware para verificar se é manager
const requireManager = (req: any, res: any, next: any) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas gestores podem gerenciar operadores.' 
    })
  }
  next()
}

// Middleware para verificar se é operador ou manager/admin
const requireOperatorAccess = (req: any, res: any, next: any) => {
  if (!['admin', 'manager', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas operadores, gestores e administradores.' 
    })
  }
  next()
}

// 📋 Listar todos os operadores do manager
router.get('/', authenticate, requireManager, async (req: any, res) => {
  try {
    const managerId = req.user.role === 'admin' ? req.query.manager_id : req.user.id

    if (!managerId) {
      return res.status(400).json({ error: 'Manager ID é obrigatório' })
    }

    console.log(`🔍 Buscando operadores do manager ${managerId}...`)

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE role = 'operator' AND manager_id = ? 
      ORDER BY created_at DESC`,
      [managerId]
    )

    const operators = rows as Operator[]

    console.log(`✅ ${operators.length} operadores encontrados`)

    res.json({
      success: true,
      operators: operators,
      total: operators.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar operadores:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 👤 Buscar operador específico
router.get('/:id', authenticate, requireManager, async (req: any, res) => {
  try {
    const operatorId = parseInt(req.params.id)
    const managerId = req.user.role === 'admin' ? req.query.manager_id : req.user.id

    console.log(`🔍 Buscando operador ${operatorId} do manager ${managerId}...`)

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ? AND role = 'operator' AND manager_id = ?`,
      [operatorId, managerId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Operador não encontrado' })
    }

    const operator = rows[0] as Operator

    console.log(`✅ Operador encontrado: ${operator.name}`)

    res.json({
      success: true,
      operator: operator
    })

  } catch (error) {
    console.error('❌ Erro ao buscar operador:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// ➕ Criar novo operador
router.post('/', authenticate, requireManager, async (req: any, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body
    const managerId = req.user.id

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios' 
      })
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      })
    }

    // Validar força da senha
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'A senha deve ter pelo menos 6 caracteres' 
      })
    }

    console.log(`➕ Criando novo operador: ${name} (${email}) para manager ${managerId}...`)

    // Verificar se email já existe
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'Este email já está sendo usado por outro usuário' 
      })
    }

    // Hash da senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Inserir operador
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (name, email, password, role, manager_id, phone, avatar, is_active) 
       VALUES (?, ?, ?, 'operator', ?, ?, ?, 1)`,
      [name, email, hashedPassword, managerId, phone || null, avatar || null]
    )

    const operatorId = result.insertId

    // Buscar o operador criado
    const [newOperator] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ?`,
      [operatorId]
    )

    const operator = newOperator[0] as Operator

    console.log(`✅ Operador criado com sucesso: ${operator.name} (ID: ${operatorId})`)

    res.status(201).json({
      success: true,
      message: 'Operador criado com sucesso',
      operator: operator
    })

  } catch (error) {
    console.error('❌ Erro ao criar operador:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// ✏️ Atualizar operador
router.put('/:id', authenticate, requireManager, async (req: any, res) => {
  try {
    const operatorId = parseInt(req.params.id)
    const { name, email, phone, avatar, is_active } = req.body
    const managerId = req.user.id

    // Validações
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Nome e email são obrigatórios' 
      })
    }

    console.log(`✏️ Atualizando operador ${operatorId} do manager ${managerId}...`)

    // Verificar se operador existe e pertence ao manager
    const [existingOperators] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = ? AND manager_id = ?',
      [operatorId, 'operator', managerId]
    )

    if (existingOperators.length === 0) {
      return res.status(404).json({ 
        error: 'Operador não encontrado ou não pertence ao seu gerenciamento' 
      })
    }

    // Verificar se email já existe (exceto para o próprio operador)
    const [emailExists] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, operatorId]
    )

    if (emailExists.length > 0) {
      return res.status(400).json({ 
        error: 'Este email já está sendo usado por outro usuário' 
      })
    }

    // Atualizar operador
    await pool.execute<ResultSetHeader>(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, avatar = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND role = 'operator' AND manager_id = ?`,
      [name, email, phone || null, avatar || null, is_active ? 1 : 0, operatorId, managerId]
    )

    // Buscar operador atualizado
    const [updatedOperator] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ?`,
      [operatorId]
    )

    const operator = updatedOperator[0] as Operator

    console.log(`✅ Operador atualizado com sucesso: ${operator.name}`)

    res.json({
      success: true,
      message: 'Operador atualizado com sucesso',
      operator: operator
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar operador:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 🔄 Alterar senha do operador
router.put('/:id/password', authenticate, requireManager, async (req: any, res) => {
  try {
    const operatorId = parseInt(req.params.id)
    const { newPassword } = req.body
    const managerId = req.user.id

    if (!newPassword) {
      return res.status(400).json({ 
        error: 'Nova senha é obrigatória' 
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'A senha deve ter pelo menos 6 caracteres' 
      })
    }

    console.log(`🔄 Alterando senha do operador ${operatorId}...`)

    // Verificar se operador existe e pertence ao manager
    const [existingOperators] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name FROM users WHERE id = ? AND role = ? AND manager_id = ?',
      [operatorId, 'operator', managerId]
    )

    if (existingOperators.length === 0) {
      return res.status(404).json({ 
        error: 'Operador não encontrado ou não pertence ao seu gerenciamento' 
      })
    }

    const operator = existingOperators[0]

    // Hash da nova senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar senha
    await pool.execute<ResultSetHeader>(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, operatorId]
    )

    console.log(`✅ Senha alterada com sucesso para operador: ${operator.name}`)

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 🗑️ Excluir operador
router.delete('/:id', authenticate, requireManager, async (req: any, res) => {
  try {
    const operatorId = parseInt(req.params.id)
    const managerId = req.user.id

    console.log(`🗑️ Excluindo operador ${operatorId} do manager ${managerId}...`)

    // Verificar se operador existe e pertence ao manager
    const [existingOperators] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name FROM users WHERE id = ? AND role = ? AND manager_id = ?',
      [operatorId, 'operator', managerId]
    )

    if (existingOperators.length === 0) {
      return res.status(404).json({ 
        error: 'Operador não encontrado ou não pertence ao seu gerenciamento' 
      })
    }

    const operator = existingOperators[0]

    // Verificar se operador tem chats ativos
    const [activeChats] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM human_chats WHERE operator_id = ? AND status IN (?, ?)',
      [operatorId, 'pending', 'active']
    )

    const activeChatCount = (activeChats[0] as any).count

    if (activeChatCount > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir este operador pois ele possui ${activeChatCount} chat(s) ativo(s). Finalize os chats primeiro.` 
      })
    }

    // Excluir operador
    await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ? AND role = ? AND manager_id = ?',
      [operatorId, 'operator', managerId]
    )

    console.log(`✅ Operador excluído com sucesso: ${operator.name}`)

    res.json({
      success: true,
      message: 'Operador excluído com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao excluir operador:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 📊 Estatísticas de operadores
router.get('/stats/overview', authenticate, requireManager, async (req: any, res) => {
  try {
    const managerId = req.user.id

    console.log(`📊 Buscando estatísticas de operadores do manager ${managerId}...`)

    // Contar operadores por status
    const [operatorStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM users 
      WHERE role = 'operator' AND manager_id = ?`,
      [managerId]
    )

    // Contar chats por operador
    const [chatStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id, u.name,
        COUNT(hc.id) as total_chats,
        SUM(CASE WHEN hc.status IN ('pending', 'active') THEN 1 ELSE 0 END) as active_chats,
        SUM(CASE WHEN hc.status = 'finished' THEN 1 ELSE 0 END) as finished_chats
      FROM users u
      LEFT JOIN human_chats hc ON u.id = hc.operator_id
      WHERE u.role = 'operator' AND u.manager_id = ?
      GROUP BY u.id, u.name
      ORDER BY total_chats DESC`,
      [managerId]
    )

    const stats = operatorStats[0] as any

    console.log(`✅ Estatísticas: ${stats.total} operadores (${stats.active} ativos)`)

    res.json({
      success: true,
      stats: {
        total_operators: stats.total,
        active_operators: stats.active,
        inactive_operators: stats.inactive,
        operator_performance: chatStats
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// ===== DASHBOARD ENDPOINTS =====

// 📊 Dashboard Stats - Estatísticas para operadores
router.get('/dashboard/stats', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const operatorId = req.user.id
    const managerId = req.user.manager_id || req.user.id
    
    console.log(`📊 Carregando stats do dashboard para operador ${operatorId}`)

    // Buscar conversas pendentes
    const [pendingChats] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM human_chats 
       WHERE manager_id = ? AND status = 'pending'`,
      [managerId]
    )

    // Buscar conversas ativas do operador
    const [activeChats] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM human_chats 
       WHERE operator_id = ? AND status = 'active'`,
      [operatorId]
    )

    // Buscar conversas resolvidas hoje
    const [resolvedToday] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM human_chats 
       WHERE operator_id = ? 
       AND status IN ('resolved', 'finished') 
       AND DATE(updated_at) = CURDATE()`,
      [operatorId]
    )

    // Calcular tempo médio de resposta (mock por enquanto)
    const averageResponseTime = Math.floor(Math.random() * 10) + 2

    // Contar mensagens novas não lidas
    const [newMessages] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM messages m
       JOIN human_chats hc ON m.chat_id = hc.id
       WHERE hc.operator_id = ? 
       AND m.sender_type = 'contact' 
       AND m.is_read = FALSE 
       AND m.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [operatorId]
    )

    const stats = {
      pendingChats: pendingChats[0]?.count || 0,
      activeChats: activeChats[0]?.count || 0,
      resolvedToday: resolvedToday[0]?.count || 0,
      averageResponseTime,
      newMessagesCount: newMessages[0]?.count || 0,
      customerSatisfaction: 4.8 // Mock value
    }

    console.log('✅ Stats carregadas:', stats)
    res.json({ stats })

  } catch (error) {
    console.error('❌ Erro ao carregar stats do dashboard:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 💬 Conversas Pendentes - Lista de conversas aguardando atendimento
router.get('/chats/pending', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const managerId = req.user.manager_id || req.user.id
    
    console.log(`💬 Carregando conversas pendentes para manager ${managerId}`)

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        hc.id,
        c.name as customer_name,
        c.phone_number,
        hc.status,
        hc.created_at,
        (SELECT m.content 
         FROM messages m 
         WHERE m.chat_id = hc.id 
         ORDER BY m.created_at DESC 
         LIMIT 1) as last_message,
        TIMESTAMPDIFF(MINUTE, hc.created_at, NOW()) as waiting_minutes
      FROM human_chats hc
      JOIN contacts c ON hc.contact_id = c.id
      WHERE hc.manager_id = ? 
      AND hc.status = 'pending'
      ORDER BY hc.created_at ASC`,
      [managerId]
    )

    const chats = rows.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name || row.phone_number,
      lastMessage: row.last_message || 'Nova conversa',
      waitingTime: row.waiting_minutes || 0,
      priority: row.waiting_minutes > 10 ? 'high' : row.waiting_minutes > 5 ? 'medium' : 'low',
      timestamp: row.created_at
    }))

    console.log(`✅ ${chats.length} conversas pendentes encontradas`)
    res.json({ chats })

  } catch (error) {
    console.error('❌ Erro ao carregar conversas pendentes:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 🔔 Alertas - Lista de alertas para o operador
router.get('/alerts', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const operatorId = req.user.id
    const managerId = req.user.manager_id || req.user.id
    
    console.log(`🔔 Carregando alertas para operador ${operatorId}`)

    // Por enquanto, retornar alertas mock
    // No futuro, implementar sistema de alertas no banco
    const alerts = [
      {
        id: `timeout_${Date.now()}`,
        type: 'timeout',
        title: 'Tempo limite excedido',
        message: 'Algumas conversas estão aguardando há mais de 10 minutos',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        priority: 'high',
        read: false
      },
      {
        id: `new_chat_${Date.now()}`,
        type: 'pending_chat',
        title: 'Nova conversa pendente',
        message: 'Cliente solicitou atendimento humano',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        priority: 'medium',
        read: false
      }
    ]

    console.log(`✅ ${alerts.length} alertas carregados`)
    res.json({ alerts })

  } catch (error) {
    console.error('❌ Erro ao carregar alertas:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 🔄 Conversas Transferidas - Lista de conversas transferidas para o operador
router.get('/chats/transferred', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const operatorId = req.user.id
    
    console.log(`🔄 Carregando conversas transferidas para operador ${operatorId}`)

    // Buscar conversas com status 'transfer_pending' que foram transferidas para este operador
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        hc.id,
        hc.status,
        hc.transfer_reason,
        hc.transfer_from,
        hc.transfer_to,
        hc.created_at,
        hc.updated_at,
        c.name as customer_name,
        c.phone_number,
        u_from.name as transfer_from_name,
        TIMESTAMPDIFF(MINUTE, hc.updated_at, NOW()) as waiting_minutes
      FROM human_chats hc
      JOIN contacts c ON hc.contact_id = c.id
      LEFT JOIN users u_from ON hc.transfer_from = u_from.id
      WHERE hc.transfer_to = ? AND hc.status = 'transfer_pending'
      ORDER BY hc.updated_at ASC
      LIMIT 20`,
      [operatorId]
    )

    const transferredChats = rows.map((row: any) => {
      const waitingMinutes = row.waiting_minutes || 0
      
      // Calcular prioridade baseada no tempo de espera
      let priority: 'low' | 'medium' | 'high' = 'low'
      if (waitingMinutes > 30) priority = 'high'
      else if (waitingMinutes > 15) priority = 'medium'

      return {
        id: row.id,
        customerName: row.customer_name || `Cliente ${row.phone_number}`,
        phoneNumber: row.phone_number,
        transferFromName: row.transfer_from_name || 'Sistema',
        transferReason: row.transfer_reason || 'Transferência solicitada',
        waitingTime: waitingMinutes,
        priority,
        transferredAt: row.updated_at
      }
    })

    console.log(`✅ ${transferredChats.length} conversas transferidas encontradas`)
    
    res.json({ 
      success: true,
      transferredChats,
      total: transferredChats.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar conversas transferidas:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// 🎯 Atender Conversa - Atribuir conversa pendente ao operador
router.post('/chats/:chatId/attend', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const chatId = parseInt(req.params.chatId)
    const operatorId = req.user.id
    
    console.log(`🎯 Operador ${operatorId} atendendo conversa ${chatId}`)

    // Verificar se a conversa existe e está pendente
    const [chatRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status, manager_id FROM human_chats WHERE id = ?`,
      [chatId]
    )

    if (chatRows.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada' })
    }

    const chat = chatRows[0]
    
    if (chat.status !== 'pending') {
      return res.status(400).json({ error: 'Esta conversa não está pendente' })
    }

    // Verificar se o operador pode atender conversas deste manager
    const managerId = req.user.manager_id || req.user.id
    if (chat.manager_id !== managerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para atender esta conversa' })
    }

    // Atribuir a conversa ao operador
    await pool.execute(
      `UPDATE human_chats 
       SET operator_id = ?, assigned_to = ?, status = 'active', updated_at = NOW()
       WHERE id = ?`,
      [operatorId, operatorId, chatId]
    )

    console.log(`✅ Conversa ${chatId} atribuída ao operador ${operatorId}`)
    
    res.json({ 
      success: true,
      message: 'Conversa atribuída com sucesso',
      chatId,
      operatorId
    })

  } catch (error) {
    console.error('❌ Erro ao atender conversa:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

// ✅ Aceitar Transferência - Aceitar conversa transferida
router.post('/chats/:chatId/accept-transfer', authenticate, requireOperatorAccess, async (req: any, res) => {
  try {
    const chatId = parseInt(req.params.chatId)
    const operatorId = req.user.id
    
    console.log(`✅ Operador ${operatorId} aceitando transferência da conversa ${chatId}`)

    // Verificar se a conversa existe e está transferida para este operador
    const [chatRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status, transfer_from, transfer_to, manager_id FROM human_chats WHERE id = ?`,
      [chatId]
    )

    if (chatRows.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada' })
    }

    const chat = chatRows[0]
    
    if (chat.status !== 'transfer_pending') {
      return res.status(400).json({ error: 'Esta conversa não está aguardando transferência' })
    }

    if (chat.transfer_to !== operatorId) {
      return res.status(403).json({ error: 'Esta transferência não é para você' })
    }

    // Aceitar a transferência - atribuir ao operador e limpar campos de transferência
    await pool.execute(
      `UPDATE human_chats 
       SET assigned_to = ?, operator_id = ?, status = 'active', 
           transfer_from = NULL, transfer_to = NULL, transfer_reason = NULL, updated_at = NOW()
       WHERE id = ?`,
      [operatorId, operatorId, chatId]
    )

    console.log(`✅ Transferência da conversa ${chatId} aceita pelo operador ${operatorId}`)
    
    // Emitir eventos Socket.IO para atualizar dashboards
    if ((req as any).io) {
      const io = (req as any).io;
      
      // Buscar dados do chat e contato para o evento
      const [chatRows] = await pool.execute<RowDataPacket[]>(
        `SELECT hc.manager_id, c.name as contact_name, c.phone_number 
         FROM human_chats hc
         JOIN contacts c ON hc.contact_id = c.id 
         WHERE hc.id = ?`,
        [chatId]
      );
      
      if (chatRows.length > 0) {
        const chatData = chatRows[0];
        
        // Evento para dashboard - transferência aceita
        io.to(`manager_${chatData.manager_id}`).emit('dashboard_chat_update', {
          type: 'transfer_accepted',
          chatId: chatId,
          customerName: chatData.contact_name || 'Cliente',
          customerPhone: chatData.phone_number,
          status: 'active',
          operatorId: operatorId,
          timestamp: new Date()
        });
        
        console.log(`📊 Evento dashboard_chat_update (transfer_accepted) emitido para gestor ${chatData.manager_id}`);
      }
    }
    
    res.json({ 
      success: true,
      message: 'Transferência aceita com sucesso',
      chatId,
      operatorId
    })

  } catch (error) {
    console.error('❌ Erro ao aceitar transferência:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
})

export default router
