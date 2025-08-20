"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.logAction = exports.validateUserData = exports.requireUserManagement = exports.requireManagerAccess = exports.requireManager = exports.requireAdmin = exports.authenticate = void 0;
const User_1 = require("../models/User");
// Middleware para verificar autenticação
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token de acesso requerido' });
            return;
        }
        const token = authHeader.substring(7);
        // Primeiro tentar verificar como sessão do banco de dados
        const sessionResult = await User_1.UserModel.verifySession(token);
        if (sessionResult) {
            // Sessão válida no banco de dados
            req.user = sessionResult.user;
            req.token = token;
            req.session = sessionResult.session;
            next();
            return;
        }
        // Fallback para JWT (compatibilidade com tokens antigos)
        const payload = User_1.UserModel.verifyToken(token);
        if (!payload) {
            res.status(401).json({ error: 'Token inválido ou expirado' });
            return;
        }
        const user = await User_1.UserModel.findById(payload.id);
        if (!user) {
            res.status(401).json({ error: 'Usuário não encontrado' });
            return;
        }
        if (!user.is_active) {
            res.status(401).json({ error: 'Usuário inativo' });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('❌ Erro na autenticação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.authenticate = authenticate;
// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Middleware para verificar se é gestor ou admin
const requireManager = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
        res.status(403).json({ error: 'Acesso negado. Apenas gestores e administradores.' });
        return;
    }
    next();
};
exports.requireManager = requireManager;
// Middleware para verificar se o usuário pode acessar dados de um gestor específico
const requireManagerAccess = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }
    const managerId = parseInt(req.params.managerId || req.body.managerId || req.query.managerId);
    // Admin pode acessar qualquer gestor
    if (req.user.role === 'admin') {
        next();
        return;
    }
    // Gestor só pode acessar seus próprios dados
    if (req.user.role === 'manager' && req.user.id === managerId) {
        next();
        return;
    }
    // Operador só pode acessar dados do seu gestor
    if (req.user.role === 'operator' && req.user.manager_id === managerId) {
        next();
        return;
    }
    res.status(403).json({ error: 'Acesso negado. Sem permissão para este recurso.' });
};
exports.requireManagerAccess = requireManagerAccess;
// Middleware para verificar se o usuário pode gerenciar outro usuário
const requireUserManagement = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }
    const targetUserId = parseInt(req.params.userId || req.body.userId);
    // Admin pode gerenciar qualquer usuário
    if (req.user.role === 'admin') {
        next();
        return;
    }
    // Gestor pode gerenciar seus próprios operadores
    if (req.user.role === 'manager') {
        // Verificar se o usuário alvo é operador do gestor atual
        User_1.UserModel.findById(targetUserId).then(targetUser => {
            if (targetUser && targetUser.manager_id === req.user.id) {
                next();
                return;
            }
            res.status(403).json({ error: 'Acesso negado. Você só pode gerenciar seus próprios operadores.' });
        }).catch(error => {
            console.error('Erro ao verificar permissões:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        });
        return;
    }
    // Usuário comum só pode gerenciar a si mesmo
    if (req.user.id === targetUserId) {
        next();
        return;
    }
    res.status(403).json({ error: 'Acesso negado. Sem permissão para gerenciar este usuário.' });
};
exports.requireUserManagement = requireUserManagement;
// Middleware para validar dados de entrada
const validateUserData = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];
    // Validar nome
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email inválido');
    }
    // Validar senha (apenas para criação, não para atualização)
    if (req.method === 'POST' && (!password || password.length < 6)) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    // Validar role
    if (role && !['admin', 'manager', 'operator'].includes(role)) {
        errors.push('Tipo de usuário inválido');
    }
    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }
    next();
};
exports.validateUserData = validateUserData;
// Middleware para log de ações
const logAction = (action) => {
    return (req, res, next) => {
        // Salvar informações da requisição para log posterior
        req.body._logAction = action;
        req.body._logIP = req.ip || req.connection.remoteAddress;
        req.body._logUserAgent = req.headers['user-agent'];
        next();
    };
};
exports.logAction = logAction;
// Middleware para verificar roles específicos
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Acesso negado. Apenas usuários com papel: ${allowedRoles.join(', ')} podem acessar esta funcionalidade.`
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map