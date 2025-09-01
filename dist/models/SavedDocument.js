"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedDocumentModel = void 0;
const database_1 = require("../config/database");
class SavedDocumentModel {
    // Helper para fazer parse seguro das tags JSON
    static safeParseTags(tagsJson) {
        try {
            console.log('🔍 Debug safeParseTags - input:', tagsJson, 'type:', typeof tagsJson);
            // Se for null ou undefined, retornar array vazio
            if (!tagsJson) {
                console.log('🔍 Tags null/undefined, retornando array vazio');
                return [];
            }
            // Se já for um array, retornar diretamente
            if (Array.isArray(tagsJson)) {
                console.log('🔍 Tags já é array:', tagsJson);
                return tagsJson;
            }
            // Se for string, tentar fazer parse
            if (typeof tagsJson === 'string') {
                // String vazia retorna array vazio
                if (tagsJson.trim() === '') {
                    console.log('🔍 String vazia, retornando array vazio');
                    return [];
                }
                console.log('🔍 Tentando fazer parse da string:', tagsJson);
                try {
                    const parsed = JSON.parse(tagsJson);
                    console.log('🔍 Parse bem-sucedido:', parsed);
                    return Array.isArray(parsed) ? parsed : [];
                }
                catch (parseError) {
                    console.warn('❌ Erro ao fazer parse das tags JSON:', tagsJson, parseError);
                    // Se não é JSON válido, tratar como string única
                    const cleanTag = tagsJson.replace(/["\[\]]/g, '').trim();
                    return cleanTag ? [cleanTag] : [];
                }
            }
            // Para outros tipos, converter para string e tratar
            const tagStr = String(tagsJson).trim();
            console.log('🔍 Convertendo para string:', tagStr);
            return tagStr ? [tagStr] : [];
        }
        catch (error) {
            console.warn('❌ Erro geral ao processar tags:', tagsJson, error);
            return [];
        }
    }
    // Criar novo documento salvo
    static async create(data) {
        const query = `
      INSERT INTO saved_documents (
        manager_id, message_id, contact_id, chat_id, operator_id,
        document_name, document_url, original_message_content, description,
        category, file_size, mime_type, tags, is_important
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const tagsJson = data.tags ? JSON.stringify(data.tags) : null;
        const result = await (0, database_1.executeQuery)(query, [
            data.manager_id,
            data.message_id,
            data.contact_id,
            data.chat_id || null,
            data.operator_id,
            data.document_name,
            data.document_url,
            data.original_message_content || null,
            data.description,
            data.category,
            data.file_size || null,
            data.mime_type || null,
            tagsJson,
            data.is_important ? 1 : 0
        ]);
        return {
            id: result.insertId,
            ...data,
            tags: data.tags || [],
            created_at: new Date(),
            updated_at: new Date()
        };
    }
    // Buscar documentos salvos com filtros
    static async findByFilters(filters, limit = 50, offset = 0) {
        let query = `
      SELECT sd.*, 
             c.name as contact_name, c.phone_number,
             u.name as operator_name,
             hc.id as chat_id
      FROM saved_documents sd
      LEFT JOIN contacts c ON sd.contact_id = c.id
      LEFT JOIN users u ON sd.operator_id = u.id
      LEFT JOIN human_chats hc ON sd.chat_id = hc.id
      WHERE sd.manager_id = ?
    `;
        const params = [filters.manager_id];
        // Aplicar filtros
        if (filters.category) {
            query += ` AND sd.category = ?`;
            params.push(filters.category);
        }
        if (filters.operator_id) {
            query += ` AND sd.operator_id = ?`;
            params.push(filters.operator_id);
        }
        if (filters.contact_id) {
            query += ` AND sd.contact_id = ?`;
            params.push(filters.contact_id);
        }
        if (filters.date_from) {
            query += ` AND DATE(sd.created_at) >= ?`;
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            query += ` AND DATE(sd.created_at) <= ?`;
            params.push(filters.date_to);
        }
        if (filters.search) {
            query += ` AND (sd.description LIKE ? OR sd.document_name LIKE ? OR c.name LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (filters.is_important !== undefined) {
            query += ` AND sd.is_important = ?`;
            params.push(filters.is_important ? 1 : 0);
        }
        query += ` ORDER BY sd.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const result = await (0, database_1.executeQuery)(query, params);
        return result.map((row) => {
            try {
                return {
                    id: row.id,
                    manager_id: row.manager_id,
                    message_id: row.message_id,
                    contact_id: row.contact_id,
                    chat_id: row.chat_id,
                    operator_id: row.operator_id,
                    document_name: row.document_name,
                    document_url: row.document_url,
                    original_message_content: row.original_message_content,
                    description: row.description,
                    category: row.category,
                    file_size: row.file_size,
                    mime_type: row.mime_type,
                    tags: SavedDocumentModel.safeParseTags(row.tags),
                    is_important: Boolean(row.is_important),
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    // Dados relacionados
                    contact_name: row.contact_name,
                    phone_number: row.phone_number,
                    operator_name: row.operator_name
                };
            }
            catch (error) {
                console.error('❌ Erro ao processar linha do resultado:', row.id, error);
                // Retornar objeto com valores seguros em caso de erro
                return {
                    id: row.id,
                    manager_id: row.manager_id,
                    message_id: row.message_id,
                    contact_id: row.contact_id,
                    chat_id: row.chat_id,
                    operator_id: row.operator_id,
                    document_name: row.document_name || 'Documento sem nome',
                    document_url: row.document_url || '',
                    original_message_content: row.original_message_content,
                    description: row.description || 'Sem descrição',
                    category: row.category || 'outros',
                    file_size: row.file_size,
                    mime_type: row.mime_type,
                    tags: [], // Tags vazias em caso de erro
                    is_important: Boolean(row.is_important),
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    // Dados relacionados
                    contact_name: row.contact_name,
                    phone_number: row.phone_number,
                    operator_name: row.operator_name
                };
            }
        });
    }
    // Buscar por ID
    static async findById(id, managerId) {
        const query = `
      SELECT sd.*, 
             c.name as contact_name, c.phone_number,
             u.name as operator_name
      FROM saved_documents sd
      LEFT JOIN contacts c ON sd.contact_id = c.id
      LEFT JOIN users u ON sd.operator_id = u.id
      WHERE sd.id = ? AND sd.manager_id = ?
    `;
        const result = await (0, database_1.executeQuery)(query, [id, managerId]);
        if (result.length === 0) {
            return null;
        }
        const row = result[0];
        try {
            return {
                id: row.id,
                manager_id: row.manager_id,
                message_id: row.message_id,
                contact_id: row.contact_id,
                chat_id: row.chat_id,
                operator_id: row.operator_id,
                document_name: row.document_name,
                document_url: row.document_url,
                original_message_content: row.original_message_content,
                description: row.description,
                category: row.category,
                file_size: row.file_size,
                mime_type: row.mime_type,
                tags: SavedDocumentModel.safeParseTags(row.tags),
                is_important: Boolean(row.is_important),
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        }
        catch (error) {
            console.error('❌ Erro ao processar documento:', row.id, error);
            return null;
        }
    }
    // Atualizar documento salvo
    static async update(id, managerId, data) {
        const allowedFields = ['description', 'category', 'tags', 'is_important'];
        const updates = [];
        const params = [];
        Object.entries(data).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                if (key === 'tags') {
                    updates.push(`${key} = ?`);
                    params.push(Array.isArray(value) ? JSON.stringify(value) : null);
                }
                else if (key === 'is_important') {
                    updates.push(`${key} = ?`);
                    params.push(value ? 1 : 0);
                }
                else {
                    updates.push(`${key} = ?`);
                    params.push(value);
                }
            }
        });
        if (updates.length === 0) {
            return false;
        }
        updates.push('updated_at = NOW()');
        params.push(id, managerId);
        const query = `UPDATE saved_documents SET ${updates.join(', ')} WHERE id = ? AND manager_id = ?`;
        const result = await (0, database_1.executeQuery)(query, params);
        return result.affectedRows > 0;
    }
    // Deletar documento salvo
    static async delete(id, managerId) {
        const query = `DELETE FROM saved_documents WHERE id = ? AND manager_id = ?`;
        const result = await (0, database_1.executeQuery)(query, [id, managerId]);
        return result.affectedRows > 0;
    }
    // Estatísticas por categoria
    static async getStatsByCategory(managerId, dateFrom, dateTo) {
        let query = `
      SELECT category, COUNT(*) as count
      FROM saved_documents 
      WHERE manager_id = ?
    `;
        const params = [managerId];
        if (dateFrom) {
            query += ` AND DATE(created_at) >= ?`;
            params.push(dateFrom);
        }
        if (dateTo) {
            query += ` AND DATE(created_at) <= ?`;
            params.push(dateTo);
        }
        query += ` GROUP BY category ORDER BY count DESC`;
        return await (0, database_1.executeQuery)(query, params);
    }
    // Verificar se documento já foi salvo
    static async isDocumentSaved(messageId, managerId) {
        const query = `SELECT id FROM saved_documents WHERE message_id = ? AND manager_id = ?`;
        const result = await (0, database_1.executeQuery)(query, [messageId, managerId]);
        return result.length > 0;
    }
    // Contar documentos salvos no mês atual
    static async countDocumentsThisMonth(managerId) {
        const query = `
      SELECT COUNT(*) as count 
      FROM saved_documents 
      WHERE manager_id = ? 
        AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `;
        const result = await (0, database_1.executeQuery)(query, [managerId]);
        return result[0]?.count || 0;
    }
    // Verificar se o usuário pode salvar mais documentos (limite mensal)
    static async canSaveDocument(managerId, userRole = 'manager') {
        // Admin não tem limite
        if (userRole === 'admin') {
            const currentCount = await this.countDocumentsThisMonth(managerId);
            return {
                canSave: true,
                currentCount,
                limit: -1 // -1 indica ilimitado
            };
        }
        // Usuários normais têm limite de 200 por mês
        const limit = 200;
        const currentCount = await this.countDocumentsThisMonth(managerId);
        const canSave = currentCount < limit;
        return {
            canSave,
            currentCount,
            limit,
            message: canSave
                ? undefined
                : `Limite mensal de ${limit} documentos atingido. Entre em contato com o administrador para obter um plano superior.`
        };
    }
    // Obter estatísticas de uso mensal
    static async getMonthlyUsageStats(managerId) {
        const currentCount = await this.countDocumentsThisMonth(managerId);
        const limit = 200;
        const percentage = Math.round((currentCount / limit) * 100);
        // Calcular dias restantes no mês
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const remainingDays = lastDay.getDate() - now.getDate();
        return {
            currentMonth: currentCount,
            limit,
            percentage,
            remainingDays
        };
    }
}
exports.SavedDocumentModel = SavedDocumentModel;
//# sourceMappingURL=SavedDocument.js.map