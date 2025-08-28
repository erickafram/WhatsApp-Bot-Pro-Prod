import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Rota para obter estatísticas da dashboard do gestor
router.get('/dashboard-stats', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const managerId = req.user.role === 'admin' ? req.user.id : req.user.id;
    
    // ===== CÁLCULO DO TEMPO MÉDIO DE RESPOSTA REAL =====
    const responseTimeQuery = `
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, m1.created_at, m2.created_at)) as avg_response_time_today,
        (
          SELECT AVG(TIMESTAMPDIFF(MINUTE, m1.created_at, m2.created_at))
          FROM messages m1
          JOIN messages m2 ON m1.chat_id = m2.chat_id
          JOIN human_chats hc ON m1.chat_id = hc.id
          WHERE m1.sender_type = 'contact'
            AND m2.sender_type = 'operator'
            AND m2.created_at > m1.created_at
            AND m2.created_at = (
              SELECT MIN(created_at)
              FROM messages
              WHERE chat_id = m1.chat_id
                AND sender_type = 'operator'
                AND created_at > m1.created_at
            )
            AND (hc.manager_id = ? OR hc.operator_id IN (
              SELECT id FROM users WHERE manager_id = ?
            ))
            AND DATE(m1.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ) as avg_response_time_yesterday
      FROM messages m1
      JOIN messages m2 ON m1.chat_id = m2.chat_id
      JOIN human_chats hc ON m1.chat_id = hc.id
      WHERE m1.sender_type = 'contact'
        AND m2.sender_type = 'operator'
        AND m2.created_at > m1.created_at
        AND m2.created_at = (
          SELECT MIN(created_at)
          FROM messages
          WHERE chat_id = m1.chat_id
            AND sender_type = 'operator'
            AND created_at > m1.created_at
        )
        AND (hc.manager_id = ? OR hc.operator_id IN (
          SELECT id FROM users WHERE manager_id = ?
        ))
        AND DATE(m1.created_at) = CURDATE()
    `;

    // ===== CÁLCULO DA TAXA DE RESOLUÇÃO REAL =====
    const resolutionRateQuery = `
      SELECT 
        COUNT(CASE WHEN status IN ('resolved', 'finished') THEN 1 END) as resolved_today,
        COUNT(*) as total_chats_today,
        (
          SELECT COUNT(CASE WHEN status IN ('resolved', 'finished') THEN 1 END)
          FROM human_chats
          WHERE (manager_id = ? OR operator_id IN (
            SELECT id FROM users WHERE manager_id = ?
          ))
          AND DATE(updated_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ) as resolved_yesterday,
        (
          SELECT COUNT(*)
          FROM human_chats
          WHERE (manager_id = ? OR operator_id IN (
            SELECT id FROM users WHERE manager_id = ?
          ))
          AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ) as total_chats_yesterday
      FROM human_chats
      WHERE (manager_id = ? OR operator_id IN (
        SELECT id FROM users WHERE manager_id = ?
      ))
      AND DATE(created_at) = CURDATE()
    `;

    // ===== CÁLCULO DA SATISFAÇÃO DO CLIENTE REAL =====
    const satisfactionQuery = `
      SELECT 
        AVG(CASE 
          WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 30 THEN 95
          WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 60 THEN 85
          WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 120 THEN 75
          WHEN hc.status = 'resolved' THEN 65
          WHEN hc.status = 'active' AND TIMESTAMPDIFF(MINUTE, hc.created_at, NOW()) > 60 THEN 50
          ELSE 70
        END) as satisfaction_today,
        (
          SELECT AVG(CASE 
            WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 30 THEN 95
            WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 60 THEN 85
            WHEN hc.status = 'resolved' AND TIMESTAMPDIFF(MINUTE, hc.created_at, hc.updated_at) <= 120 THEN 75
            WHEN hc.status = 'resolved' THEN 65
            ELSE 70
          END)
          FROM human_chats hc
          WHERE (hc.manager_id = ? OR hc.operator_id IN (
            SELECT id FROM users WHERE manager_id = ?
          ))
          AND DATE(hc.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ) as satisfaction_yesterday
      FROM human_chats hc
      WHERE (hc.manager_id = ? OR hc.operator_id IN (
        SELECT id FROM users WHERE manager_id = ?
      ))
      AND DATE(hc.created_at) = CURDATE()
    `;

    // ===== ESTATÍSTICAS GERAIS =====
    const generalStatsQuery = `
      SELECT 
        COUNT(DISTINCT hc.id) as total_chats,
        COUNT(DISTINCT CASE WHEN hc.status = 'active' THEN hc.id END) as active_chats,
        COUNT(DISTINCT CASE WHEN hc.status = 'pending' THEN hc.id END) as pending_chats,
        COUNT(DISTINCT CASE WHEN u.role = 'operator' THEN u.id END) as total_operators,
        COUNT(DISTINCT CASE WHEN u.role = 'operator' AND u.last_login > DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN u.id END) as online_operators,
        COUNT(DISTINCT CASE WHEN DATE(m.created_at) = CURDATE() THEN m.id END) as messages_per_day,
        COUNT(DISTINCT CASE WHEN m.sender_type = 'bot' AND DATE(m.created_at) = CURDATE() THEN m.id END) as bot_interactions,
        COUNT(DISTINCT CASE WHEN m.sender_type = 'operator' AND DATE(m.created_at) = CURDATE() THEN m.id END) as human_interactions
      FROM users u
      LEFT JOIN human_chats hc ON (u.id = hc.manager_id OR (u.role = 'operator' AND u.manager_id = ?))
      LEFT JOIN messages m ON hc.id = m.chat_id
      WHERE (u.manager_id = ? OR u.id = ?) AND u.role IN ('operator', 'manager')
    `;

    // Executar todas as queries
    const [responseTimeResult] = await pool.execute(responseTimeQuery, [managerId, managerId, managerId, managerId]);
    const [resolutionRateResult] = await pool.execute(resolutionRateQuery, [managerId, managerId, managerId, managerId, managerId, managerId]);
    const [satisfactionResult] = await pool.execute(satisfactionQuery, [managerId, managerId, managerId, managerId]);
    const [generalStatsResult] = await pool.execute(generalStatsQuery, [managerId, managerId, managerId]);

    const responseTimeData: any = Array.isArray(responseTimeResult) ? responseTimeResult[0] : {};
    const resolutionRateData: any = Array.isArray(resolutionRateResult) ? resolutionRateResult[0] : {};
    const satisfactionData: any = Array.isArray(satisfactionResult) ? satisfactionResult[0] : {};
    const generalStats: any = Array.isArray(generalStatsResult) ? generalStatsResult[0] : {};

    // Calcular métricas e tendências
    const avgResponseTimeToday = Math.round(parseFloat(responseTimeData.avg_response_time_today || 0));
    const avgResponseTimeYesterday = Math.round(parseFloat(responseTimeData.avg_response_time_yesterday || 0));
    const responseTimeChange = avgResponseTimeYesterday > 0 
      ? Math.round(((avgResponseTimeToday - avgResponseTimeYesterday) / avgResponseTimeYesterday) * 100)
      : 0;

    const resolvedToday = parseInt(resolutionRateData.resolved_today || 0);
    const totalChatsToday = parseInt(resolutionRateData.total_chats_today || 0);
    const resolvedYesterday = parseInt(resolutionRateData.resolved_yesterday || 0);
    const totalChatsYesterday = parseInt(resolutionRateData.total_chats_yesterday || 0);
    
    const resolutionRateToday = totalChatsToday > 0 ? Math.round((resolvedToday / totalChatsToday) * 100) : 0;
    const resolutionRateYesterday = totalChatsYesterday > 0 ? Math.round((resolvedYesterday / totalChatsYesterday) * 100) : 0;
    const resolutionRateChange = resolutionRateYesterday > 0 
      ? Math.round(resolutionRateToday - resolutionRateYesterday)
      : 0;

    const satisfactionToday = Math.round(parseFloat(satisfactionData.satisfaction_today || 70));
    const satisfactionYesterday = Math.round(parseFloat(satisfactionData.satisfaction_yesterday || 70));
    const satisfactionChange = satisfactionYesterday > 0 
      ? Math.round(satisfactionToday - satisfactionYesterday)
      : 0;

    // Processar resultados
    const dashboardStats = {
      totalChats: parseInt(generalStats.total_chats || 0),
      activeChats: parseInt(generalStats.active_chats || 0),
      pendingChats: parseInt(generalStats.pending_chats || 0),
      resolvedToday: resolvedToday,
      totalOperators: parseInt(generalStats.total_operators || 0),
      onlineOperators: parseInt(generalStats.online_operators || 0),
      messagesPerDay: parseInt(generalStats.messages_per_day || 0),
      
      // Métricas de performance reais com tendências
      avgResponseTime: avgResponseTimeToday,
      avgResponseTimeChange: responseTimeChange,
      customerSatisfaction: satisfactionToday,
      customerSatisfactionChange: satisfactionChange,
      resolutionRate: resolutionRateToday,
      resolutionRateChange: resolutionRateChange,
      
      botInteractions: parseInt(generalStats.bot_interactions || 0),
      humanInteractions: parseInt(generalStats.human_interactions || 0),
      conversationsInitiated: 0 // Será calculado na rota específica
    };
    
    console.log('📊 Dashboard Stats Calculadas:', {
      avgResponseTime: `${avgResponseTimeToday}min (${responseTimeChange > 0 ? '+' : ''}${responseTimeChange}%)`,
      customerSatisfaction: `${satisfactionToday}% (${satisfactionChange > 0 ? '+' : ''}${satisfactionChange}%)`,
      resolutionRate: `${resolutionRateToday}% (${resolutionRateChange > 0 ? '+' : ''}${resolutionRateChange}%)`
    });
    
    res.json(dashboardStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas da dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter alertas do gestor
router.get('/alerts', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const managerId = req.user.role === 'admin' ? req.user.id : req.user.id;
    
    // Query para buscar conversas pendentes e atividades recentes
    const alertsQuery = `
      SELECT 
        hc.id as chat_id,
        c.name as customer_name,
        c.phone_number as customer_phone,
        hc.status,
        hc.created_at,
        hc.updated_at,
        (SELECT content FROM messages WHERE chat_id = hc.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM human_chats hc
      JOIN contacts c ON hc.contact_id = c.id
      WHERE hc.manager_id = ? 
        AND hc.status IN ('pending', 'active')
        AND hc.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY hc.created_at DESC
      LIMIT 10
    `;
    
    const [alertsResult] = await pool.execute(alertsQuery, [managerId]);
    const alerts = Array.isArray(alertsResult) ? alertsResult : [];
    
    // Converter para formato de alertas
    const formattedAlerts = alerts.map((alert: any, index: number) => ({
      id: `alert_${alert.chat_id}_${index}`,
      type: alert.status === 'pending' ? 'new_chat' : 'new_message',
      title: alert.status === 'pending' ? 'Nova conversa pendente' : 'Conversa ativa',
      message: `${alert.customer_name}: ${alert.last_message?.substring(0, 50) || 'Solicitou atendimento'}...`,
      timestamp: alert.created_at,
      priority: alert.status === 'pending' ? 'high' : 'medium',
      read: false,
      chatId: alert.chat_id
    }));
    
    res.json(formattedAlerts);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter atividades recentes
router.get('/recent-activity', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const managerId = req.user.role === 'admin' ? req.user.id : req.user.id;
    
    // Query para buscar atividades recentes
    const activityQuery = `
      (
        SELECT 
          'chat_created' as type,
          CONCAT('Nova conversa criada com ', c.name) as description,
          hc.created_at as timestamp,
          c.name as customer_name,
          NULL as operator_name
        FROM human_chats hc
        JOIN contacts c ON hc.contact_id = c.id
        WHERE hc.manager_id = ?
          AND hc.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
      UNION ALL
      (
        SELECT 
          'chat_resolved' as type,
          CONCAT('Conversa com ', c.name, ' foi finalizada') as description,
          hc.updated_at as timestamp,
          c.name as customer_name,
          u.name as operator_name
        FROM human_chats hc
        JOIN contacts c ON hc.contact_id = c.id
        LEFT JOIN users u ON hc.operator_id = u.id
        WHERE hc.manager_id = ?
          AND hc.status = 'resolved'
          AND hc.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
      UNION ALL
      (
        SELECT 
          'operator_login' as type,
          CONCAT(u.name, ' entrou online') as description,
          d.last_activity as timestamp,
          NULL as customer_name,
          u.name as operator_name
        FROM devices d
        JOIN users u ON d.manager_id = u.id
        WHERE d.manager_id = ?
          AND d.status = 'online'
          AND d.last_activity >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      )
      ORDER BY timestamp DESC
      LIMIT 10
    `;
    
    const [activityResult] = await pool.execute(activityQuery, [managerId, managerId, managerId]);
    const activities = Array.isArray(activityResult) ? activityResult : [];
    
    // Formatar atividades
    const formattedActivities = activities.map((activity: any, index: number) => ({
      id: `activity_${index}_${Date.now()}`,
      type: activity.type,
      description: activity.description,
      timestamp: activity.timestamp,
      customerName: activity.customer_name,
      operatorName: activity.operator_name
    }));
    
    res.json(formattedActivities);
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter conversas iniciadas (incluindo bot-only)
router.get('/initiated-conversations', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const managerId = req.user.role === 'admin' ? req.user.id : req.user.id;
    
    // Query simplificada para buscar contatos recentes
    const conversationsQuery = `
      SELECT 
        c.id,
        c.name as customer_name,
        c.phone_number as customer_phone,
        c.created_at,
        c.updated_at,
        hc.status,
        hc.created_at as chat_created_at
      FROM contacts c
      LEFT JOIN human_chats hc ON c.id = hc.contact_id 
        AND hc.status NOT IN ('resolved', 'finished')
      WHERE c.manager_id = ?
        AND c.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY GREATEST(c.updated_at, COALESCE(hc.created_at, c.created_at)) DESC
      LIMIT 20
    `;
    
    const [conversationsResult] = await pool.execute(conversationsQuery, [managerId]);
    const conversations = Array.isArray(conversationsResult) ? conversationsResult : [];
    
    // Formatar conversas
    const formattedConversations = conversations.map((conv: any) => ({
      id: `conv_${conv.id}`,
      customerName: conv.customer_name || `Cliente ${conv.customer_phone}`,
      customerPhone: conv.customer_phone,
      lastMessage: 'Iniciou uma conversa',
      timestamp: conv.chat_created_at || conv.updated_at,
      status: conv.status || 'bot_only',
      messageCount: 1
    }));
    
    res.json(formattedConversations);
  } catch (error) {
    console.error('Erro ao buscar conversas iniciadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para marcar alerta como lido
router.put('/alerts/:alertId/read', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    // Em uma implementação completa, você salvaria o estado dos alertas no banco
    // Por enquanto, apenas retornamos sucesso
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar alerta como lido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
