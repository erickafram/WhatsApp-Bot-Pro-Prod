import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database';
import { UserSessionModel } from './UserSession';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Optional for response objects
  role: 'admin' | 'manager' | 'operator';
  manager_id?: number;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  email_verified_at?: Date;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
  subscription_plan?: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  subscription_payment_method?: string;
  subscription_amount?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'operator';
  manager_id?: number;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  manager_id?: number;
}

export class UserModel {
  // Criar usuário
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const query = `
      INSERT INTO users (name, email, password, role, manager_id, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      userData.name,
      userData.email,
      hashedPassword,
      userData.role || 'manager',
      userData.manager_id || null,
      userData.phone || null,
      true
    ]);
    
    const insertId = (result as any).insertId;
    const user = await UserModel.findById(insertId);
    
    if (!user) {
      throw new Error('Erro ao criar usuário');
    }
    
    return user;
  }

  // Buscar usuário por ID
  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT 
        id, name, email, role, manager_id, phone, avatar, is_active, 
        email_verified_at, created_at, updated_at, last_login,
        subscription_status, subscription_plan, subscription_start_date, 
        subscription_end_date, subscription_payment_method, subscription_amount
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `;
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return result[0] as User;
  }

  // Buscar usuário por email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const result = await executeQuery(query, [email]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return result[0] as User;
  }

  // Buscar usuário por email com senha (para login)
  static async findByEmailWithPassword(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const result = await executeQuery(query, [email]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return result[0] as User;
  }

  // Verificar se email já existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params: any[] = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await executeQuery(query, params);
    return Array.isArray(result) && result.length > 0;
  }

  // Fazer login
  static async login(
    credentials: LoginCredentials,
    sessionData?: { ip_address?: string; user_agent?: string }
  ): Promise<{ user: User; token: string; sessionToken: string } | null> {
    const user = await UserModel.findByEmailWithPassword(credentials.email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Criar sessão no banco de dados
    const session = await UserSessionModel.create({
      user_id: user.id,
      ip_address: sessionData?.ip_address,
      user_agent: sessionData?.user_agent
    });

    // Gerar token JWT (mantido para compatibilidade)
    const token = UserModel.generateToken(user);

    // Remover senha do objeto de retorno
    delete user.password;

    return { user, token, sessionToken: session.session_token };
  }

  // Gerar token JWT
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      manager_id: user.manager_id
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions);
  }

  // Verificar token JWT
  static verifyToken(token: string): JWTPayload | null {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Fazer logout
  static async logout(sessionToken: string): Promise<void> {
    await UserSessionModel.deactivateByToken(sessionToken);
  }

  // Verificar sessão no banco de dados
  static async verifySession(sessionToken: string): Promise<{ user: User; session: any } | null> {
    const isValid = await UserSessionModel.isValidSession(sessionToken);

    if (!isValid) {
      return null;
    }

    const session = await UserSessionModel.findByToken(sessionToken);

    if (!session) {
      return null;
    }

    const user = await UserModel.findById(session.user_id);

    if (!user) {
      return null;
    }

    // Atualizar última atividade
    await UserSessionModel.updateActivity(sessionToken);

    return { user, session };
  }

  // Buscar operadores de um gestor
  static async findOperatorsByManager(managerId: number): Promise<User[]> {
    const query = `
      SELECT id, name, email, role, phone, avatar, is_active, created_at, updated_at
      FROM users 
      WHERE manager_id = ? AND role = 'operator' AND is_active = TRUE
      ORDER BY name ASC
    `;
    
    const result = await executeQuery(query, [managerId]);
    return Array.isArray(result) ? result : [];
  }

  // Buscar todos os gestores (para admin)
  static async findAllManagers(): Promise<User[]> {
    const query = `
      SELECT id, name, email, role, phone, avatar, is_active, created_at, updated_at
      FROM users 
      WHERE role = 'manager' AND is_active = TRUE
      ORDER BY name ASC
    `;
    
    const result = await executeQuery(query);
    return Array.isArray(result) ? result : [];
  }

  // Atualizar usuário
  static async update(id: number, updateData: Partial<CreateUserData>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 12);
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    
    if (updateData.role) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    
    if (fields.length === 0) {
      return await UserModel.findById(id);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await UserModel.findById(id);
  }

  // Desativar usuário (soft delete)
  static async deactivate(id: number): Promise<boolean> {
    const query = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Ativar usuário
  static async activate(id: number): Promise<boolean> {
    const query = 'UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Contar usuários por tipo
  static async getCountsByRole(): Promise<{ admin: number; manager: number; operator: number }> {
    const query = `
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE is_active = TRUE 
      GROUP BY role
    `;
    
    const result = await executeQuery(query);
    const counts = { admin: 0, manager: 0, operator: 0 };
    
    if (Array.isArray(result)) {
      result.forEach((row: any) => {
        counts[row.role as keyof typeof counts] = parseInt(row.count);
      });
    }
    
    return counts;
  }

  // Criar usuário admin padrão (primeira instalação)
  static async createDefaultAdmin(): Promise<User | null> {
    const existingAdmin = await executeQuery(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );
    
    if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
      console.log('✅ Admin já existe no sistema');
      return null;
    }
    
    const adminData: CreateUserData = {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin'
    };
    
    try {
      const admin = await UserModel.create(adminData);
      console.log('✅ Usuário admin padrão criado:', adminData.email);
      console.log('🔑 Senha padrão:', adminData.password);
      console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
      return admin;
    } catch (error) {
      console.error('❌ Erro ao criar admin padrão:', error);
      return null;
    }
  }

  // Verificar se usuário pode criar instâncias
  static async canCreateInstance(userId: number): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) return false;

    // Admin sempre pode
    if (user.role === 'admin') return true;

    // Verificar assinatura ativa
    return user.subscription_status === 'active';
  }

  // Atualizar assinatura do usuário
  static async updateSubscription(userId: number, subscriptionData: {
    status: 'free' | 'active' | 'expired' | 'cancelled';
    plan?: string;
    start_date?: Date;
    end_date?: Date;
    payment_method?: string;
    amount?: number;
  }): Promise<User | null> {
    const query = `
      UPDATE users SET 
        subscription_status = ?,
        subscription_plan = ?,
        subscription_start_date = ?,
        subscription_end_date = ?,
        subscription_payment_method = ?,
        subscription_amount = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(query, [
      subscriptionData.status,
      subscriptionData.plan || null,
      subscriptionData.start_date || null,
      subscriptionData.end_date || null,
      subscriptionData.payment_method || null,
      subscriptionData.amount || null,
      userId
    ]);

    return await UserModel.findById(userId);
  }

  // Verificar assinaturas que estão vencendo
  static async getExpiringSubscriptions(daysBeforeExpiry: number = 7): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE subscription_status = 'active' 
        AND subscription_end_date IS NOT NULL
        AND subscription_end_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
        AND subscription_end_date > NOW()
        AND is_active = TRUE
      ORDER BY subscription_end_date ASC
    `;
    
    const result = await executeQuery(query, [daysBeforeExpiry]);
    return Array.isArray(result) ? result : [];
  }

  // Cancelar assinatura vencida automaticamente
  static async expireSubscriptions(): Promise<number> {
    const query = `
      UPDATE users SET 
        subscription_status = 'expired',
        updated_at = CURRENT_TIMESTAMP
      WHERE subscription_status = 'active' 
        AND subscription_end_date IS NOT NULL
        AND subscription_end_date < NOW()
    `;
    
    const result = await executeQuery(query);
    return (result as any).affectedRows || 0;
  }
}
