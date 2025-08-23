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

    // Capturar dados da sessão
    const sessionData = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    };

    const result = await UserModel.login({ email, password }, sessionData);

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
        avatar: result.user.avatar,
        subscription_status: result.user.subscription_status || 'free',
        subscription_plan: result.user.subscription_plan,
        subscription_start_date: result.user.subscription_start_date,
        subscription_end_date: result.user.subscription_end_date,
        subscription_amount: result.user.subscription_amount
      },
      token: result.sessionToken, // Usar sessionToken em vez de JWT
      sessionToken: result.sessionToken
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

// Rota de logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    if (!req.token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    // Desativar sessão no banco de dados
    await UserModel.logout(req.token);

    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de debug para verificar token sem middleware
router.post('/debug-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    console.log('🔍 Debug Token - Recebido:', token.substring(0, 20) + '...');
    console.log('🔍 Debug Token - JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 10) + '...');

    const payload = UserModel.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const user = await UserModel.findById(payload.id);

    res.json({
      valid: true,
      payload,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      } : null
    });
  } catch (error) {
    console.error('Erro no debug do token:', error);
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

// Rota para obter dados completos do usuário atual
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar dados completos do usuário, incluindo assinatura
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager_id: user.manager_id,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at,
        subscription_status: user.subscription_status || 'free',
        subscription_plan: user.subscription_plan,
        subscription_start_date: user.subscription_start_date,
        subscription_end_date: user.subscription_end_date,
        subscription_amount: user.subscription_amount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
