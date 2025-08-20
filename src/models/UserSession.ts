import crypto from 'crypto';
import { executeQuery } from '../config/database';

export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface CreateSessionData {
  user_id: number;
  ip_address?: string;
  user_agent?: string;
}

export class UserSessionModel {
  // Gerar token seguro
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Criar nova sessão
  static async create(sessionData: CreateSessionData): Promise<UserSession> {
    const sessionToken = this.generateSecureToken();
    const refreshToken = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Sessão expira em 24 horas

    const query = `
      INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      sessionData.user_id,
      sessionToken,
      refreshToken,
      expiresAt,
      sessionData.ip_address || null,
      sessionData.user_agent || null,
      true
    ]);

    const insertId = (result as any).insertId;
    const session = await this.findById(insertId);

    if (!session) {
      throw new Error('Erro ao criar sessão');
    }

    return session;
  }

  // Buscar sessão por ID
  static async findById(id: number): Promise<UserSession | null> {
    const query = 'SELECT * FROM user_sessions WHERE id = ?';
    const result = await executeQuery(query, [id]);

    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }

    return result[0] as UserSession;
  }

  // Buscar sessão por token
  static async findByToken(sessionToken: string): Promise<UserSession | null> {
    const query = 'SELECT * FROM user_sessions WHERE session_token = ? AND is_active = TRUE';
    const result = await executeQuery(query, [sessionToken]);

    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }

    return result[0] as UserSession;
  }

  // Verificar se sessão é válida
  static async isValidSession(sessionToken: string): Promise<boolean> {
    const session = await this.findByToken(sessionToken);
    
    if (!session) {
      return false;
    }

    // Verificar se não expirou
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Sessão expirada, desativar
      await this.deactivate(session.id);
      return false;
    }

    return true;
  }

  // Renovar sessão
  static async refresh(refreshToken: string): Promise<UserSession | null> {
    const query = 'SELECT * FROM user_sessions WHERE refresh_token = ? AND is_active = TRUE';
    const result = await executeQuery(query, [refreshToken]);

    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }

    const session = result[0] as UserSession;
    
    // Verificar se não expirou
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      await this.deactivate(session.id);
      return null;
    }

    // Gerar novos tokens
    const newSessionToken = this.generateSecureToken();
    const newRefreshToken = this.generateSecureToken();
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24);

    const updateQuery = `
      UPDATE user_sessions 
      SET session_token = ?, refresh_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [newSessionToken, newRefreshToken, newExpiresAt, session.id]);

    return await this.findById(session.id);
  }

  // Desativar sessão
  static async deactivate(sessionId: number): Promise<void> {
    const query = 'UPDATE user_sessions SET is_active = FALSE WHERE id = ?';
    await executeQuery(query, [sessionId]);
  }

  // Desativar sessão por token
  static async deactivateByToken(sessionToken: string): Promise<void> {
    const query = 'UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?';
    await executeQuery(query, [sessionToken]);
  }

  // Desativar todas as sessões de um usuário
  static async deactivateAllUserSessions(userId: number): Promise<void> {
    const query = 'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?';
    await executeQuery(query, [userId]);
  }

  // Limpar sessões expiradas
  static async cleanExpiredSessions(): Promise<void> {
    const query = 'DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE';
    await executeQuery(query, []);
  }

  // Buscar sessões ativas de um usuário
  static async findActiveUserSessions(userId: number): Promise<UserSession[]> {
    const query = `
      SELECT * FROM user_sessions 
      WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const result = await executeQuery(query, [userId]);
    return Array.isArray(result) ? result as UserSession[] : [];
  }

  // Atualizar última atividade da sessão
  static async updateActivity(sessionToken: string): Promise<void> {
    const query = 'UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_token = ?';
    await executeQuery(query, [sessionToken]);
  }
}
