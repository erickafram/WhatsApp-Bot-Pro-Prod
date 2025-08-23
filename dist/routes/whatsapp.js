"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WhatsAppInstance_1 = require("../models/WhatsAppInstance");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Listar instâncias do gestor
router.get('/instances', auth_1.authenticate, auth_1.requireManager, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        let instances;
        if (req.user.role === 'admin') {
            // Admin pode ver todas as instâncias (implementar se necessário)
            instances = await WhatsAppInstance_1.WhatsAppInstanceModel.findByManagerId(req.user.id);
        }
        else {
            // Gestor vê apenas suas instâncias
            instances = await WhatsAppInstance_1.WhatsAppInstanceModel.findByManagerId(req.user.id);
        }
        // Contar instâncias ativas e totais
        const activeCount = await WhatsAppInstance_1.WhatsAppInstanceModel.countActiveInstances(req.user.id);
        const totalCount = await WhatsAppInstance_1.WhatsAppInstanceModel.countByManager(req.user.id);
        // Determinar limite baseado no role
        const instanceLimit = req.user.role === 'admin' ? null : 1; // null = ilimitado
        res.json({
            instances,
            stats: {
                activeCount,
                totalCount,
                limit: instanceLimit,
                canCreateMore: req.user.role === 'admin' || activeCount < 1
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar instâncias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Criar nova instância
router.post('/instances', auth_1.authenticate, auth_1.requireManager, (0, auth_1.logAction)('create_whatsapp_instance'), async (req, res) => {
    try {
        const { instance_name, webhook_url } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!instance_name || instance_name.trim().length < 3) {
            return res.status(400).json({ error: 'Nome da instância deve ter pelo menos 3 caracteres' });
        }
        // Verificar se o usuário pode criar instâncias (assinatura ativa)
        const canCreate = await User_1.UserModel.canCreateInstance(req.user.id);
        if (!canCreate) {
            return res.status(403).json({
                error: 'Você precisa de uma assinatura ativa para criar instâncias do WhatsApp.',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }
        // Verificar limitação de instâncias baseada no role do usuário
        if (req.user.role !== 'admin') {
            // Usuários não-admin (managers) podem ter apenas 1 instância ativa
            const hasActive = await WhatsAppInstance_1.WhatsAppInstanceModel.hasActiveInstance(req.user.id);
            if (hasActive) {
                return res.status(400).json({
                    error: 'Você já possui uma instância ativa. Desconecte-a primeiro ou contate o administrador para ter mais instâncias.'
                });
            }
        }
        // Administradores podem criar quantas instâncias quiserem (sem verificação)
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.create({
            manager_id: req.user.id,
            instance_name: instance_name.trim(),
            webhook_url: webhook_url || null
        });
        res.status(201).json({
            message: 'Instância criada com sucesso',
            instance
        });
    }
    catch (error) {
        console.error('Erro ao criar instância:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Buscar instância específica
router.get('/instances/:instanceId', auth_1.authenticate, async (req, res) => {
    try {
        const instanceId = parseInt(req.params.instanceId);
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }
        // Verificar permissão
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (req.user.role !== 'admin' && instance.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar esta instância' });
        }
        res.json({ instance });
    }
    catch (error) {
        console.error('Erro ao buscar instância:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar status da instância (usado pelo sistema interno)
router.patch('/instances/:instanceId/status', auth_1.authenticate, async (req, res) => {
    try {
        const instanceId = parseInt(req.params.instanceId);
        const { status, phone_number, qr_code, session_data } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && instance.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para atualizar esta instância' });
        }
        const additionalData = {};
        if (phone_number)
            additionalData.phone_number = phone_number;
        if (qr_code !== undefined)
            additionalData.qr_code = qr_code;
        if (session_data)
            additionalData.session_data = session_data;
        if (status === 'connected')
            additionalData.connected_at = new Date();
        const success = await WhatsAppInstance_1.WhatsAppInstanceModel.updateStatus(instanceId, status, additionalData);
        if (!success) {
            return res.status(400).json({ error: 'Erro ao atualizar status' });
        }
        const updatedInstance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        res.json({
            message: 'Status atualizado com sucesso',
            instance: updatedInstance
        });
    }
    catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Desconectar instância
router.post('/instances/:instanceId/disconnect', auth_1.authenticate, (0, auth_1.logAction)('disconnect_whatsapp'), async (req, res) => {
    try {
        const instanceId = parseInt(req.params.instanceId);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && instance.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para desconectar esta instância' });
        }
        const success = await WhatsAppInstance_1.WhatsAppInstanceModel.disconnect(instanceId);
        if (!success) {
            return res.status(400).json({ error: 'Erro ao desconectar instância' });
        }
        res.json({ message: 'Instância desconectada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao desconectar instância:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Deletar instância
router.delete('/instances/:instanceId', auth_1.authenticate, (0, auth_1.logAction)('delete_whatsapp_instance'), async (req, res) => {
    try {
        const instanceId = parseInt(req.params.instanceId);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && instance.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar esta instância' });
        }
        const success = await WhatsAppInstance_1.WhatsAppInstanceModel.deactivate(instanceId);
        if (!success) {
            return res.status(400).json({ error: 'Erro ao deletar instância' });
        }
        res.json({ message: 'Instância deletada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar instância:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Estatísticas das instâncias
router.get('/stats', auth_1.authenticate, auth_1.requireManager, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        let stats;
        if (req.user.role === 'admin') {
            // Admin vê estatísticas globais
            stats = await WhatsAppInstance_1.WhatsAppInstanceModel.getStats();
        }
        else {
            // Gestor vê apenas suas estatísticas
            stats = await WhatsAppInstance_1.WhatsAppInstanceModel.getStats(req.user.id);
        }
        res.json({ stats });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Limpar QR codes expirados (rota de manutenção)
router.post('/maintenance/clear-qr', auth_1.authenticate, auth_1.requireManager, async (req, res) => {
    try {
        const clearedCount = await WhatsAppInstance_1.WhatsAppInstanceModel.clearExpiredQRCodes();
        res.json({
            message: `${clearedCount} QR codes expirados foram limpos`,
            cleared: clearedCount
        });
    }
    catch (error) {
        console.error('Erro ao limpar QR codes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Atualizar atividade da instância (heartbeat)
router.post('/instances/:instanceId/heartbeat', auth_1.authenticate, async (req, res) => {
    try {
        const instanceId = parseInt(req.params.instanceId);
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const instance = await WhatsAppInstance_1.WhatsAppInstanceModel.findById(instanceId);
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }
        // Verificar permissão
        if (req.user.role !== 'admin' && instance.manager_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para esta instância' });
        }
        const success = await WhatsAppInstance_1.WhatsAppInstanceModel.updateActivity(instanceId);
        if (!success) {
            return res.status(400).json({ error: 'Erro ao atualizar atividade' });
        }
        res.json({ message: 'Atividade atualizada' });
    }
    catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// 📊 Status real das instâncias para header
router.get('/instances/status', auth_1.authenticate, async (req, res) => {
    try {
        const managerId = req.user.id;
        const [instances] = await database_1.default.execute('SELECT id, instance_name, status, phone_number, connected_at, last_activity FROM whatsapp_instances WHERE manager_id = ? AND is_active = 1', [managerId]);
        const totalInstances = instances.length;
        const connectedInstances = instances.filter((instance) => instance.status === 'connected').length;
        const overallStatus = connectedInstances > 0 ? 'connected' : 'disconnected';
        res.json({
            overallStatus,
            totalInstances,
            connectedInstances,
            instances: instances.map((instance) => ({
                id: instance.id,
                name: instance.instance_name,
                status: instance.status,
                phone: instance.phone_number,
                connectedAt: instance.connected_at,
                lastActivity: instance.last_activity
            }))
        });
    }
    catch (error) {
        console.error('Erro ao buscar status das instâncias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// 🔔 Contagem de conversas pendentes para notificações
router.get('/chats/pending-count', auth_1.authenticate, async (req, res) => {
    try {
        const managerId = req.user.id;
        // Buscar conversas pendentes
        const [pendingChats] = await database_1.default.execute('SELECT COUNT(*) as count FROM human_chats WHERE manager_id = ? AND status = "pending"', [managerId]);
        // Buscar conversas ativas sem operador
        const [unassignedChats] = await database_1.default.execute('SELECT COUNT(*) as count FROM human_chats WHERE manager_id = ? AND status = "active" AND operator_id IS NULL', [managerId]);
        // Buscar mensagens não lidas das últimas 24h
        const [unreadMessages] = await database_1.default.execute(`SELECT COUNT(*) as count FROM messages m 
       INNER JOIN human_chats hc ON m.chat_id = hc.id 
       WHERE hc.manager_id = ? AND m.is_read = 0 AND m.sender_type = 'contact' 
       AND m.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`, [managerId]);
        const totalNotifications = pendingChats[0].count + unassignedChats[0].count;
        res.json({
            total: totalNotifications,
            pending: pendingChats[0].count,
            unassigned: unassignedChats[0].count,
            unreadMessages: unreadMessages[0].count
        });
    }
    catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=whatsapp.js.map