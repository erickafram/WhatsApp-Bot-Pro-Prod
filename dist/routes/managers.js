"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Aplicar autenticação a todas as rotas
router.use(auth_1.authenticate);
// Rota para obter estatísticas da dashboard do gestor
router.get('/dashboard-stats', (0, auth_1.requireRole)(['admin', 'manager']), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const managerId = req.user.role === 'admin' ? req.user.id : req.user.id;
        // Query para buscar estatísticas do gestor
        const statsQuery = `
      SELECT 
        -- Contadores de conversas
        COUNT(DISTINCT hc.id) as total_chats,
        COUNT(DISTINCT CASE WHEN hc.status = 'active' THEN hc.id END) as active_chats,
        COUNT(DISTINCT CASE WHEN hc.status = 'pending' THEN hc.id END) as pending_chats,
        COUNT(DISTINCT CASE WHEN hc.status = 'resolved' AND DATE(hc.updated_at) = CURDATE() THEN hc.id END) as resolved_today,
        
        -- Contadores de operadores
        COUNT(DISTINCT u.id) as total_operators,
        COUNT(DISTINCT CASE WHEN d.status = 'online' THEN u.id END) as online_operators,
        
        -- Contador de mensagens hoje
        COUNT(DISTINCT CASE WHEN DATE(m.created_at) = CURDATE() THEN m.id END) as messages_per_day,
        
        -- Média de tempo de resposta (em minutos)
        COALESCE(AVG(TIMESTAMPDIFF(MINUTE, hc.created_at, CASE WHEN hc.status = 'resolved' THEN hc.updated_at END)), 0) as avg_response_time,
        
        -- Contador de interações do bot
        COUNT(DISTINCT CASE WHEN m.sender_type = 'bot' AND DATE(m.created_at) = CURDATE() THEN m.id END) as bot_interactions,
        
        -- Contador de interações humanas
        COUNT(DISTINCT CASE WHEN m.sender_type = 'operator' AND DATE(m.created_at) = CURDATE() THEN m.id END) as human_interactions
        
      FROM users u
      LEFT JOIN human_chats hc ON u.id = hc.manager_id OR u.manager_id = ?
      LEFT JOIN messages m ON hc.id = m.chat_id
      LEFT JOIN devices d ON u.id = d.manager_id
      WHERE (u.manager_id = ? OR u.id = ?) AND u.role IN ('operator', 'manager')
    `;
        const [statsResult] = await database_1.default.execute(statsQuery, [managerId, managerId, managerId]);
        const stats = Array.isArray(statsResult) ? statsResult[0] : {};
        // Processar resultados
        const dashboardStats = {
            totalChats: parseInt(stats.total_chats || 0),
            activeChats: parseInt(stats.active_chats || 0),
            pendingChats: parseInt(stats.pending_chats || 0),
            resolvedToday: parseInt(stats.resolved_today || 0),
            totalOperators: parseInt(stats.total_operators || 0),
            onlineOperators: parseInt(stats.online_operators || 0),
            messagesPerDay: parseInt(stats.messages_per_day || 0),
            avgResponseTime: Math.round(parseFloat(stats.avg_response_time || 0)),
            customerSatisfaction: 92, // Mock data - implementar sistema de avaliação futuramente
            botInteractions: parseInt(stats.bot_interactions || 0),
            humanInteractions: parseInt(stats.human_interactions || 0),
            conversationsInitiated: 0 // Será calculado na rota específica
        };
        res.json(dashboardStats);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas da dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para obter alertas do gestor
router.get('/alerts', (0, auth_1.requireRole)(['admin', 'manager']), async (req, res) => {
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
        const [alertsResult] = await database_1.default.execute(alertsQuery, [managerId]);
        const alerts = Array.isArray(alertsResult) ? alertsResult : [];
        // Converter para formato de alertas
        const formattedAlerts = alerts.map((alert, index) => ({
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
    }
    catch (error) {
        console.error('Erro ao buscar alertas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para obter atividades recentes
router.get('/recent-activity', (0, auth_1.requireRole)(['admin', 'manager']), async (req, res) => {
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
        const [activityResult] = await database_1.default.execute(activityQuery, [managerId, managerId, managerId]);
        const activities = Array.isArray(activityResult) ? activityResult : [];
        // Formatar atividades
        const formattedActivities = activities.map((activity, index) => ({
            id: `activity_${index}_${Date.now()}`,
            type: activity.type,
            description: activity.description,
            timestamp: activity.timestamp,
            customerName: activity.customer_name,
            operatorName: activity.operator_name
        }));
        res.json(formattedActivities);
    }
    catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para obter conversas iniciadas (incluindo bot-only)
router.get('/initiated-conversations', (0, auth_1.requireRole)(['admin', 'manager']), async (req, res) => {
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
        const [conversationsResult] = await database_1.default.execute(conversationsQuery, [managerId]);
        const conversations = Array.isArray(conversationsResult) ? conversationsResult : [];
        // Formatar conversas
        const formattedConversations = conversations.map((conv) => ({
            id: `conv_${conv.id}`,
            customerName: conv.customer_name || `Cliente ${conv.customer_phone}`,
            customerPhone: conv.customer_phone,
            lastMessage: 'Iniciou uma conversa',
            timestamp: conv.chat_created_at || conv.updated_at,
            status: conv.status || 'bot_only',
            messageCount: 1
        }));
        res.json(formattedConversations);
    }
    catch (error) {
        console.error('Erro ao buscar conversas iniciadas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para marcar alerta como lido
router.put('/alerts/:alertId/read', (0, auth_1.requireRole)(['admin', 'manager']), async (req, res) => {
    try {
        // Em uma implementação completa, você salvaria o estado dos alertas no banco
        // Por enquanto, apenas retornamos sucesso
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao marcar alerta como lido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=managers.js.map