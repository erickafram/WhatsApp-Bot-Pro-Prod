import express from 'express';
import { UserModel } from '../models/User';
import { authenticate, validateUserData, logAction } from '../middleware/auth';

const router = express.Router();

// Rota de registro
router.post('/register', validateUserData, logAction('user_register'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Verificar se email já existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    // Criar usuário como gestor por padrão
    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
      role: 'manager' // Todo usuário que se cadastra é gestor
    });
    
    // Gerar token
    const token = UserModel.generateToken(user);
    
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
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', logAction('user_login'), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const result = await UserModel.login({ email, password });
    
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
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar token
router.get('/verify', authenticate, async (req, res) => {
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
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar perfil
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (password && password.length >= 6) updateData.password = password;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum dado para atualizar' });
    }
    
    const updatedUser = await UserModel.update(req.user.id, updateData);
    
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
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para logout (invalidar token no frontend)
router.post('/logout', authenticate, logAction('user_logout'), async (req, res) => {
  try {
    // Em uma implementação mais robusta, você manteria uma blacklist de tokens
    // Por enquanto, apenas confirmamos o logout
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
