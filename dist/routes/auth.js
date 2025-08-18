"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Rota de registro
router.post('/register', auth_1.validateUserData, (0, auth_1.logAction)('user_register'), async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // Verificar se email já existe
        const existingUser = await User_1.UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        // Criar usuário como gestor por padrão
        const user = await User_1.UserModel.create({
            name,
            email,
            password,
            phone,
            role: 'manager' // Todo usuário que se cadastra é gestor
        });
        // Gerar token
        const token = User_1.UserModel.generateToken(user);
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                created_at: user.created_at
            },
            token
        });
    }
    catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota de login
router.post('/login', (0, auth_1.logAction)('user_login'), async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        const result = await User_1.UserModel.login({ email, password });
        if (!result) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        res.json({
            message: 'Login realizado com sucesso',
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                manager_id: result.user.manager_id,
                phone: result.user.phone,
                avatar: result.user.avatar
            },
            token: result.token
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para verificar token
router.get('/verify', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        res.json({
            valid: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                manager_id: req.user.manager_id,
                phone: req.user.phone,
                avatar: req.user.avatar
            }
        });
    }
    catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para atualizar perfil
router.put('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        if (password && password.length >= 6)
            updateData.password = password;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        }
        const updatedUser = await User_1.UserModel.update(req.user.id, updateData);
        if (!updatedUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                manager_id: updatedUser.manager_id,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar
            }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para logout (invalidar token no frontend)
router.post('/logout', auth_1.authenticate, (0, auth_1.logAction)('user_logout'), async (req, res) => {
    try {
        // Em uma implementação mais robusta, você manteria uma blacklist de tokens
        // Por enquanto, apenas confirmamos o logout
        res.json({ message: 'Logout realizado com sucesso' });
    }
    catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map