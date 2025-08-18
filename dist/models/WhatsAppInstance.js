"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppInstanceModel = void 0;
const database_1 = require("../config/database");
class WhatsAppInstanceModel {
    // Criar nova instância
    static async create(data) {
        const query = `
      INSERT INTO whatsapp_instances (manager_id, instance_name, webhook_url, status, is_active)
      VALUES (?, ?, ?, 'disconnected', TRUE)
    `;
        const result = await (0, database_1.executeQuery)(query, [
            data.manager_id,
            data.instance_name,
            data.webhook_url || null
        ]);
        const insertId = result.insertId;
        const instance = await WhatsAppInstanceModel.findById(insertId);
        if (!instance) {
            throw new Error('Erro ao criar instância');
        }
        return instance;
    }
    // Buscar instância por ID
    static async findById(id) {
        const query = 'SELECT * FROM whatsapp_instances WHERE id = ?';
        const result = await (0, database_1.executeQuery)(query, [id]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        const instance = result[0];
        // Parse JSON fields
        if (instance.session_data && typeof instance.session_data === 'string') {
            try {
                instance.session_data = JSON.parse(instance.session_data);
            }
            catch (e) {
                instance.session_data = null;
            }
        }
        return instance;
    }
    // Buscar instâncias de um gestor
    static async findByManagerId(managerId) {
        const query = `
      SELECT * FROM whatsapp_instances 
      WHERE manager_id = ? AND is_active = TRUE 
      ORDER BY created_at DESC
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        if (!Array.isArray(result)) {
            return [];
        }
        return result.map((instance) => {
            // Parse JSON fields
            if (instance.session_data && typeof instance.session_data === 'string') {
                try {
                    instance.session_data = JSON.parse(instance.session_data);
                }
                catch (e) {
                    instance.session_data = null;
                }
            }
            return instance;
        });
    }
    // Buscar instância ativa de um gestor
    static async findActiveByManagerId(managerId) {
        const query = `
      SELECT * FROM whatsapp_instances 
      WHERE manager_id = ? AND status = 'connected' AND is_active = TRUE 
      ORDER BY connected_at DESC 
      LIMIT 1
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }
        const instance = result[0];
        // Parse JSON fields
        if (instance.session_data && typeof instance.session_data === 'string') {
            try {
                instance.session_data = JSON.parse(instance.session_data);
            }
            catch (e) {
                instance.session_data = null;
            }
        }
        return instance;
    }
    // Atualizar status da instância
    static async updateStatus(id, status, additionalData) {
        const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
        const values = [status];
        if (additionalData?.phone_number) {
            fields.push('phone_number = ?');
            values.push(additionalData.phone_number);
        }
        if (additionalData?.qr_code !== undefined) {
            fields.push('qr_code = ?');
            values.push(additionalData.qr_code);
        }
        if (additionalData?.session_data !== undefined) {
            fields.push('session_data = ?');
            values.push(JSON.stringify(additionalData.session_data));
        }
        if (additionalData?.connected_at) {
            fields.push('connected_at = ?');
            values.push(additionalData.connected_at);
        }
        if (status === 'connected') {
            fields.push('last_activity = CURRENT_TIMESTAMP');
        }
        values.push(id);
        const query = `UPDATE whatsapp_instances SET ${fields.join(', ')} WHERE id = ?`;
        const result = await (0, database_1.executeQuery)(query, values);
        return result.affectedRows > 0;
    }
    // Atualizar atividade da instância
    static async updateActivity(id) {
        const query = 'UPDATE whatsapp_instances SET last_activity = CURRENT_TIMESTAMP WHERE id = ?';
        const result = await (0, database_1.executeQuery)(query, [id]);
        return result.affectedRows > 0;
    }
    // Desconectar instância
    static async disconnect(id) {
        const query = `
      UPDATE whatsapp_instances 
      SET status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        const result = await (0, database_1.executeQuery)(query, [id]);
        return result.affectedRows > 0;
    }
    // Desativar instância (soft delete)
    static async deactivate(id) {
        const query = `
      UPDATE whatsapp_instances 
      SET is_active = FALSE, status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        const result = await (0, database_1.executeQuery)(query, [id]);
        return result.affectedRows > 0;
    }
    // Buscar todas as instâncias conectadas
    static async findAllConnected() {
        const query = `
      SELECT * FROM whatsapp_instances 
      WHERE status = 'connected' AND is_active = TRUE
      ORDER BY last_activity DESC
    `;
        const result = await (0, database_1.executeQuery)(query);
        if (!Array.isArray(result)) {
            return [];
        }
        return result.map((instance) => {
            // Parse JSON fields
            if (instance.session_data && typeof instance.session_data === 'string') {
                try {
                    instance.session_data = JSON.parse(instance.session_data);
                }
                catch (e) {
                    instance.session_data = null;
                }
            }
            return instance;
        });
    }
    // Estatísticas das instâncias
    static async getStats(managerId) {
        let query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM whatsapp_instances 
      WHERE is_active = TRUE
    `;
        const params = [];
        if (managerId) {
            query += ' AND manager_id = ?';
            params.push(managerId);
        }
        query += ' GROUP BY status';
        const result = await (0, database_1.executeQuery)(query, params);
        const stats = {
            total: 0,
            connected: 0,
            connecting: 0,
            disconnected: 0,
            error: 0
        };
        if (Array.isArray(result)) {
            result.forEach((row) => {
                const count = parseInt(row.count);
                stats[row.status] = count;
                stats.total += count;
            });
        }
        return stats;
    }
    // Limpar QR codes expirados (mais de 5 minutos)
    static async clearExpiredQRCodes() {
        const query = `
      UPDATE whatsapp_instances 
      SET qr_code = NULL 
      WHERE qr_code IS NOT NULL 
        AND status = 'connecting' 
        AND updated_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `;
        const result = await (0, database_1.executeQuery)(query);
        return result.affectedRows;
    }
    // Verificar se gestor já tem instância ativa
    static async hasActiveInstance(managerId) {
        const query = `
      SELECT id FROM whatsapp_instances 
      WHERE manager_id = ? AND status = 'connected' AND is_active = TRUE 
      LIMIT 1
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        return Array.isArray(result) && result.length > 0;
    }
    // Contar instâncias por gestor
    static async countByManager(managerId) {
        const query = `
      SELECT COUNT(*) as count 
      FROM whatsapp_instances 
      WHERE manager_id = ? AND is_active = TRUE
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        if (Array.isArray(result) && result.length > 0) {
            return parseInt(result[0].count);
        }
        return 0;
    }
}
exports.WhatsAppInstanceModel = WhatsAppInstanceModel;
//# sourceMappingURL=WhatsAppInstance.js.map