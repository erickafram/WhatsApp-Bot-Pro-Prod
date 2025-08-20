"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const UserSession_1 = require("./UserSession");
class UserModel {
    // Criar usuário
    static async create(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        const query = `
      INSERT INTO users (name, email, password, role, manager_id, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await (0, database_1.executeQuery)(query, [
            userData.name,
            userData.email,
            hashedPassword,
            userData.role || 'manager',
            userData.manager_id || null,
            userData.phone || null,
            true
        ]);
        const insertId = result.insertId;
        const user = await UserModel.findById(insertId);
        if (!user) {
            throw new Error('Erro ao criar usuário');
        }
        return user;
    }
    // Buscar usuário por ID
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
        const result = await (0, database_1.executeQuery)(query, [id]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        const user = result[0];
        delete user.password; // Não retornar senha
        return user;
    }
    // Buscar usuário por email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
        const result = await (0, database_1.executeQuery)(query, [email]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        return result[0];
    }
    // Buscar usuário por email com senha (para login)
    static async findByEmailWithPassword(email) {
        const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
        const result = await (0, database_1.executeQuery)(query, [email]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        return result[0];
    }
    // Verificar se email já existe
    static async emailExists(email, excludeId) {
        let query = 'SELECT id FROM users WHERE email = ?';
        const params = [email];
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        const result = await (0, database_1.executeQuery)(query, params);
        return Array.isArray(result) && result.length > 0;
    }
    // Fazer login
    static async login(credentials, sessionData) {
        const user = await UserModel.findByEmailWithPassword(credentials.email);
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        // Criar sessão no banco de dados
        const session = await UserSession_1.UserSessionModel.create({
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
    static generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            manager_id: user.manager_id
        };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'default_secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    }
    // Verificar token JWT
    static verifyToken(token) {
        try {
            const secret = process.env.JWT_SECRET || 'default_secret';
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            return null;
        }
    }
    // Fazer logout
    static async logout(sessionToken) {
        await UserSession_1.UserSessionModel.deactivateByToken(sessionToken);
    }
    // Verificar sessão no banco de dados
    static async verifySession(sessionToken) {
        const isValid = await UserSession_1.UserSessionModel.isValidSession(sessionToken);
        if (!isValid) {
            return null;
        }
        const session = await UserSession_1.UserSessionModel.findByToken(sessionToken);
        if (!session) {
            return null;
        }
        const user = await UserModel.findById(session.user_id);
        if (!user) {
            return null;
        }
        // Atualizar última atividade
        await UserSession_1.UserSessionModel.updateActivity(sessionToken);
        return { user, session };
    }
    // Buscar operadores de um gestor
    static async findOperatorsByManager(managerId) {
        const query = `
      SELECT id, name, email, role, phone, avatar, is_active, created_at, updated_at
      FROM users 
      WHERE manager_id = ? AND role = 'operator' AND is_active = TRUE
      ORDER BY name ASC
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        return Array.isArray(result) ? result : [];
    }
    // Buscar todos os gestores (para admin)
    static async findAllManagers() {
        const query = `
      SELECT id, name, email, role, phone, avatar, is_active, created_at, updated_at
      FROM users 
      WHERE role = 'manager' AND is_active = TRUE
      ORDER BY name ASC
    `;
        const result = await (0, database_1.executeQuery)(query);
        return Array.isArray(result) ? result : [];
    }
    // Atualizar usuário
    static async update(id, updateData) {
        const fields = [];
        const values = [];
        if (updateData.name) {
            fields.push('name = ?');
            values.push(updateData.name);
        }
        if (updateData.email) {
            fields.push('email = ?');
            values.push(updateData.email);
        }
        if (updateData.password) {
            const hashedPassword = await bcryptjs_1.default.hash(updateData.password, 12);
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
        await (0, database_1.executeQuery)(query, values);
        return await UserModel.findById(id);
    }
    // Desativar usuário (soft delete)
    static async deactivate(id) {
        const query = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        const result = await (0, database_1.executeQuery)(query, [id]);
        return result.affectedRows > 0;
    }
    // Ativar usuário
    static async activate(id) {
        const query = 'UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        const result = await (0, database_1.executeQuery)(query, [id]);
        return result.affectedRows > 0;
    }
    // Contar usuários por tipo
    static async getCountsByRole() {
        const query = `
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE is_active = TRUE 
      GROUP BY role
    `;
        const result = await (0, database_1.executeQuery)(query);
        const counts = { admin: 0, manager: 0, operator: 0 };
        if (Array.isArray(result)) {
            result.forEach((row) => {
                counts[row.role] = parseInt(row.count);
            });
        }
        return counts;
    }
    // Criar usuário admin padrão (primeira instalação)
    static async createDefaultAdmin() {
        const existingAdmin = await (0, database_1.executeQuery)('SELECT id FROM users WHERE role = "admin" LIMIT 1');
        if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
            console.log('✅ Admin já existe no sistema');
            return null;
        }
        const adminData = {
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
        }
        catch (error) {
            console.error('❌ Erro ao criar admin padrão:', error);
            return null;
        }
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map