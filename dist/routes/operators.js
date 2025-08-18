"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Middleware para verificar se é manager
const requireManager = (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Acesso negado. Apenas gestores podem gerenciar operadores.'
        });
    }
    next();
};
// 📋 Listar todos os operadores do manager
router.get('/', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const managerId = req.user.role === 'admin' ? req.query.manager_id : req.user.id;
        if (!managerId) {
            return res.status(400).json({ error: 'Manager ID é obrigatório' });
        }
        console.log(`🔍 Buscando operadores do manager ${managerId}...`);
        const [rows] = await database_1.default.execute(`SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE role = 'operator' AND manager_id = ? 
      ORDER BY created_at DESC`, [managerId]);
        const operators = rows;
        console.log(`✅ ${operators.length} operadores encontrados`);
        res.json({
            success: true,
            operators: operators,
            total: operators.length
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar operadores:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// 👤 Buscar operador específico
router.get('/:id', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const operatorId = parseInt(req.params.id);
        const managerId = req.user.role === 'admin' ? req.query.manager_id : req.user.id;
        console.log(`🔍 Buscando operador ${operatorId} do manager ${managerId}...`);
        const [rows] = await database_1.default.execute(`SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ? AND role = 'operator' AND manager_id = ?`, [operatorId, managerId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Operador não encontrado' });
        }
        const operator = rows[0];
        console.log(`✅ Operador encontrado: ${operator.name}`);
        res.json({
            success: true,
            operator: operator
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar operador:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// ➕ Criar novo operador
router.post('/', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const { name, email, password, phone, avatar } = req.body;
        const managerId = req.user.id;
        // Validações
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Nome, email e senha são obrigatórios'
            });
        }
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }
        // Validar força da senha
        if (password.length < 6) {
            return res.status(400).json({
                error: 'A senha deve ter pelo menos 6 caracteres'
            });
        }
        console.log(`➕ Criando novo operador: ${name} (${email}) para manager ${managerId}...`);
        // Verificar se email já existe
        const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                error: 'Este email já está sendo usado por outro usuário'
            });
        }
        // Hash da senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Inserir operador
        const [result] = await database_1.default.execute(`INSERT INTO users (name, email, password, role, manager_id, phone, avatar, is_active) 
       VALUES (?, ?, ?, 'operator', ?, ?, ?, 1)`, [name, email, hashedPassword, managerId, phone || null, avatar || null]);
        const operatorId = result.insertId;
        // Buscar o operador criado
        const [newOperator] = await database_1.default.execute(`SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ?`, [operatorId]);
        const operator = newOperator[0];
        console.log(`✅ Operador criado com sucesso: ${operator.name} (ID: ${operatorId})`);
        res.status(201).json({
            success: true,
            message: 'Operador criado com sucesso',
            operator: operator
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar operador:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// ✏️ Atualizar operador
router.put('/:id', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const operatorId = parseInt(req.params.id);
        const { name, email, phone, avatar, is_active } = req.body;
        const managerId = req.user.id;
        // Validações
        if (!name || !email) {
            return res.status(400).json({
                error: 'Nome e email são obrigatórios'
            });
        }
        console.log(`✏️ Atualizando operador ${operatorId} do manager ${managerId}...`);
        // Verificar se operador existe e pertence ao manager
        const [existingOperators] = await database_1.default.execute('SELECT id FROM users WHERE id = ? AND role = ? AND manager_id = ?', [operatorId, 'operator', managerId]);
        if (existingOperators.length === 0) {
            return res.status(404).json({
                error: 'Operador não encontrado ou não pertence ao seu gerenciamento'
            });
        }
        // Verificar se email já existe (exceto para o próprio operador)
        const [emailExists] = await database_1.default.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, operatorId]);
        if (emailExists.length > 0) {
            return res.status(400).json({
                error: 'Este email já está sendo usado por outro usuário'
            });
        }
        // Atualizar operador
        await database_1.default.execute(`UPDATE users 
       SET name = ?, email = ?, phone = ?, avatar = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND role = 'operator' AND manager_id = ?`, [name, email, phone || null, avatar || null, is_active ? 1 : 0, operatorId, managerId]);
        // Buscar operador atualizado
        const [updatedOperator] = await database_1.default.execute(`SELECT 
        id, name, email, phone, avatar, is_active, manager_id, 
        created_at, updated_at
      FROM users 
      WHERE id = ?`, [operatorId]);
        const operator = updatedOperator[0];
        console.log(`✅ Operador atualizado com sucesso: ${operator.name}`);
        res.json({
            success: true,
            message: 'Operador atualizado com sucesso',
            operator: operator
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar operador:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// 🔄 Alterar senha do operador
router.put('/:id/password', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const operatorId = parseInt(req.params.id);
        const { newPassword } = req.body;
        const managerId = req.user.id;
        if (!newPassword) {
            return res.status(400).json({
                error: 'Nova senha é obrigatória'
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'A senha deve ter pelo menos 6 caracteres'
            });
        }
        console.log(`🔄 Alterando senha do operador ${operatorId}...`);
        // Verificar se operador existe e pertence ao manager
        const [existingOperators] = await database_1.default.execute('SELECT id, name FROM users WHERE id = ? AND role = ? AND manager_id = ?', [operatorId, 'operator', managerId]);
        if (existingOperators.length === 0) {
            return res.status(404).json({
                error: 'Operador não encontrado ou não pertence ao seu gerenciamento'
            });
        }
        const operator = existingOperators[0];
        // Hash da nova senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        // Atualizar senha
        await database_1.default.execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, operatorId]);
        console.log(`✅ Senha alterada com sucesso para operador: ${operator.name}`);
        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// 🗑️ Excluir operador
router.delete('/:id', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const operatorId = parseInt(req.params.id);
        const managerId = req.user.id;
        console.log(`🗑️ Excluindo operador ${operatorId} do manager ${managerId}...`);
        // Verificar se operador existe e pertence ao manager
        const [existingOperators] = await database_1.default.execute('SELECT id, name FROM users WHERE id = ? AND role = ? AND manager_id = ?', [operatorId, 'operator', managerId]);
        if (existingOperators.length === 0) {
            return res.status(404).json({
                error: 'Operador não encontrado ou não pertence ao seu gerenciamento'
            });
        }
        const operator = existingOperators[0];
        // Verificar se operador tem chats ativos
        const [activeChats] = await database_1.default.execute('SELECT COUNT(*) as count FROM human_chats WHERE operator_id = ? AND status IN (?, ?)', [operatorId, 'pending', 'active']);
        const activeChatCount = activeChats[0].count;
        if (activeChatCount > 0) {
            return res.status(400).json({
                error: `Não é possível excluir este operador pois ele possui ${activeChatCount} chat(s) ativo(s). Finalize os chats primeiro.`
            });
        }
        // Excluir operador
        await database_1.default.execute('DELETE FROM users WHERE id = ? AND role = ? AND manager_id = ?', [operatorId, 'operator', managerId]);
        console.log(`✅ Operador excluído com sucesso: ${operator.name}`);
        res.json({
            success: true,
            message: 'Operador excluído com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao excluir operador:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// 📊 Estatísticas de operadores
router.get('/stats/overview', auth_1.authenticate, requireManager, async (req, res) => {
    try {
        const managerId = req.user.id;
        console.log(`📊 Buscando estatísticas de operadores do manager ${managerId}...`);
        // Contar operadores por status
        const [operatorStats] = await database_1.default.execute(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM users 
      WHERE role = 'operator' AND manager_id = ?`, [managerId]);
        // Contar chats por operador
        const [chatStats] = await database_1.default.execute(`SELECT 
        u.id, u.name,
        COUNT(hc.id) as total_chats,
        SUM(CASE WHEN hc.status IN ('pending', 'active') THEN 1 ELSE 0 END) as active_chats,
        SUM(CASE WHEN hc.status = 'finished' THEN 1 ELSE 0 END) as finished_chats
      FROM users u
      LEFT JOIN human_chats hc ON u.id = hc.operator_id
      WHERE u.role = 'operator' AND u.manager_id = ?
      GROUP BY u.id, u.name
      ORDER BY total_chats DESC`, [managerId]);
        const stats = operatorStats[0];
        console.log(`✅ Estatísticas: ${stats.total} operadores (${stats.active} ativos)`);
        res.json({
            success: true,
            stats: {
                total_operators: stats.total,
                active_operators: stats.active,
                inactive_operators: stats.inactive,
                operator_performance: chatStats
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
exports.default = router;
//# sourceMappingURL=operators.js.map