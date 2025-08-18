import express from 'express';
import { UserModel } from '../models/User';
import { 
  authenticate, 
  requireAdmin, 
  requireManager, 
  requireUserManagement,
  validateUserData,
  logAction 
} from '../middleware/auth';

const router = express.Router();

// Rota para listar usuários (apenas admin vê todos, gestor vê seus operadores)
router.get('/', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    let users: any[] = [];
    
    if (req.user.role === 'admin') {
      // Admin vê todos os gestores
      users = await UserModel.findAllManagers();
    } else if (req.user.role === 'manager') {
      // Gestor vê seus operadores
      users = await UserModel.findOperatorsByManager(req.user.id);
    } else {
      // Operador não pode listar usuários
      return res.status(403).json({ error: 'Sem permissão para listar usuários' });
    }
    
    res.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar operador (apenas gestores)
router.post('/', authenticate, requireManager, validateUserData, logAction('create_operator'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Verificar se email já existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    // Apenas gestores podem criar operadores
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas gestores podem criar operadores' });
    }
    
    // Criar operador vinculado ao gestor atual
    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
      role: 'operator',
      manager_id: req.user.role === 'admin' ? req.body.manager_id : req.user.id
    });
    
    res.status(201).json({
      message: 'Operador criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager_id: user.manager_id,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao criar operador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar usuário por ID
router.get('/:userId', authenticate, requireUserManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar usuário
router.put('/:userId', authenticate, requireUserManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { name, email, password, phone, role } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Verificar se email já existe (excluindo o usuário atual)
    if (email) {
      const existingUser = await UserModel.emailExists(email, userId);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password && password.length >= 6) updateData.password = password;
    if (phone !== undefined) updateData.phone = phone;
    
    // Apenas admin pode alterar role
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    const updatedUser = await UserModel.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para desativar usuário
router.delete('/:userId', authenticate, requireUserManagement, logAction('deactivate_user'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Não permitir que o usuário desative a si mesmo
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Você não pode desativar sua própria conta' });
    }
    
    const success = await UserModel.deactivate(userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para ativar usuário
router.patch('/:userId/activate', authenticate, requireUserManagement, logAction('activate_user'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const success = await UserModel.activate(userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário ativado com sucesso' });
  } catch (error) {
    console.error('Erro ao ativar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas de usuários (apenas admin)
router.get('/stats/counts', authenticate, requireAdmin, async (req, res) => {
  try {
    const counts = await UserModel.getCountsByRole();
    res.json({ counts });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
