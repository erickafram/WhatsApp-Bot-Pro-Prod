"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSessionModel = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class UserSessionModel {
    // Gerar token seguro
    static generateSecureToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    // Criar nova sessão
    static async create(sessionData) {
        const sessionToken = this.generateSecureToken();
        const refreshToken = this.generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Sessão expira em 24 horas
        const query = `
      INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await (0, database_1.executeQuery)(query, [
            sessionData.user_id,
            sessionToken,
            refreshToken,
            expiresAt,
            sessionData.ip_address || null,
            sessionData.user_agent || null,
            true
        ]);
        const insertId = result.insertId;
        const session = await this.findById(insertId);
        if (!session) {
            throw new Error('Erro ao criar sessão');
        }
        return session;
    }
    // Buscar sessão por ID
    static async findById(id) {
        const query = 'SELECT * FROM user_sessions WHERE id = ?';
        const result = await (0, database_1.executeQuery)(query, [id]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        return result[0];
    }
    // Buscar sessão por token
    static async findByToken(sessionToken) {
        const query = 'SELECT * FROM user_sessions WHERE session_token = ? AND is_active = TRUE';
        const result = await (0, database_1.executeQuery)(query, [sessionToken]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        return result[0];
    }
    // Verificar se sessão é válida
    static async isValidSession(sessionToken) {
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
    static async refresh(refreshToken) {
        const query = 'SELECT * FROM user_sessions WHERE refresh_token = ? AND is_active = TRUE';
        const result = await (0, database_1.executeQuery)(query, [refreshToken]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        const session = result[0];
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
        await (0, database_1.executeQuery)(updateQuery, [newSessionToken, newRefreshToken, newExpiresAt, session.id]);
        return await this.findById(session.id);
    }
    // Desativar sessão
    static async deactivate(sessionId) {
        const query = 'UPDATE user_sessions SET is_active = FALSE WHERE id = ?';
        await (0, database_1.executeQuery)(query, [sessionId]);
    }
    // Desativar sessão por token
    static async deactivateByToken(sessionToken) {
        const query = 'UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?';
        await (0, database_1.executeQuery)(query, [sessionToken]);
    }
    // Desativar todas as sessões de um usuário
    static async deactivateAllUserSessions(userId) {
        const query = 'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?';
        await (0, database_1.executeQuery)(query, [userId]);
    }
    // Limpar sessões expiradas
    static async cleanExpiredSessions() {
        const query = 'DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE';
        await (0, database_1.executeQuery)(query, []);
    }
    // Buscar sessões ativas de um usuário
    static async findActiveUserSessions(userId) {
        const query = `
      SELECT * FROM user_sessions 
      WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
        const result = await (0, database_1.executeQuery)(query, [userId]);
        return Array.isArray(result) ? result : [];
    }
    // Atualizar última atividade da sessão
    static async updateActivity(sessionToken) {
        const query = 'UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_token = ?';
        await (0, database_1.executeQuery)(query, [sessionToken]);
    }
}
exports.UserSessionModel = UserSessionModel;
//# sourceMappingURL=UserSession.js.map