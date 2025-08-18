import { executeQuery } from '../config/database';

export interface WhatsAppInstance {
  id: number;
  manager_id: number;
  instance_name: string;
  phone_number?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qr_code?: string;
  session_data?: any;
  webhook_url?: string;
  is_active: boolean;
  connected_at?: Date;
  last_activity?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstanceData {
  manager_id: number;
  instance_name: string;
  webhook_url?: string;
}

export class WhatsAppInstanceModel {
  // Criar nova instância
  static async create(data: CreateInstanceData): Promise<WhatsAppInstance> {
    const query = `
      INSERT INTO whatsapp_instances (manager_id, instance_name, webhook_url, status, is_active)
      VALUES (?, ?, ?, 'disconnected', TRUE)
    `;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.instance_name,
      data.webhook_url || null
    ]);
    
    const insertId = (result as any).insertId;
    const instance = await WhatsAppInstanceModel.findById(insertId);
    
    if (!instance) {
      throw new Error('Erro ao criar instância');
    }
    
    return instance;
  }

  // Buscar instância por ID
  static async findById(id: number): Promise<WhatsAppInstance | null> {
    const query = 'SELECT * FROM whatsapp_instances WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const instance = result[0] as any;
    
    // Parse JSON fields
    if (instance.session_data && typeof instance.session_data === 'string') {
      try {
        instance.session_data = JSON.parse(instance.session_data);
      } catch (e) {
        instance.session_data = null;
      }
    }
    
    return instance;
  }

  // Buscar instâncias de um gestor
  static async findByManagerId(managerId: number): Promise<WhatsAppInstance[]> {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE manager_id = ? AND is_active = TRUE 
      ORDER BY created_at DESC
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((instance: any) => {
      // Parse JSON fields
      if (instance.session_data && typeof instance.session_data === 'string') {
        try {
          instance.session_data = JSON.parse(instance.session_data);
        } catch (e) {
          instance.session_data = null;
        }
      }
      return instance;
    });
  }

  // Buscar instância ativa de um gestor
  static async findActiveByManagerId(managerId: number): Promise<WhatsAppInstance | null> {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE manager_id = ? AND status = 'connected' AND is_active = TRUE 
      ORDER BY connected_at DESC 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const instance = result[0] as any;
    
    // Parse JSON fields
    if (instance.session_data && typeof instance.session_data === 'string') {
      try {
        instance.session_data = JSON.parse(instance.session_data);
      } catch (e) {
        instance.session_data = null;
      }
    }
    
    return instance;
  }

  // Atualizar status da instância
  static async updateStatus(
    id: number, 
    status: WhatsAppInstance['status'], 
    additionalData?: {
      phone_number?: string;
      qr_code?: string;
      session_data?: any;
      connected_at?: Date;
    }
  ): Promise<boolean> {
    const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [status];
    
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
    const result = await executeQuery(query, values);
    
    return (result as any).affectedRows > 0;
  }

  // Atualizar atividade da instância
  static async updateActivity(id: number): Promise<boolean> {
    const query = 'UPDATE whatsapp_instances SET last_activity = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Desconectar instância
  static async disconnect(id: number): Promise<boolean> {
    const query = `
      UPDATE whatsapp_instances 
      SET status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Desativar instância (soft delete)
  static async deactivate(id: number): Promise<boolean> {
    const query = `
      UPDATE whatsapp_instances 
      SET is_active = FALSE, status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Buscar todas as instâncias conectadas
  static async findAllConnected(): Promise<WhatsAppInstance[]> {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE status = 'connected' AND is_active = TRUE
      ORDER BY last_activity DESC
    `;
    
    const result = await executeQuery(query);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map((instance: any) => {
      // Parse JSON fields
      if (instance.session_data && typeof instance.session_data === 'string') {
        try {
          instance.session_data = JSON.parse(instance.session_data);
        } catch (e) {
          instance.session_data = null;
        }
      }
      return instance;
    });
  }

  // Estatísticas das instâncias
  static async getStats(managerId?: number): Promise<{
    total: number;
    connected: number;
    connecting: number;
    disconnected: number;
    error: number;
  }> {
    let query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM whatsapp_instances 
      WHERE is_active = TRUE
    `;
    
    const params: any[] = [];
    
    if (managerId) {
      query += ' AND manager_id = ?';
      params.push(managerId);
    }
    
    query += ' GROUP BY status';
    
    const result = await executeQuery(query, params);
    
    const stats = {
      total: 0,
      connected: 0,
      connecting: 0,
      disconnected: 0,
      error: 0
    };
    
    if (Array.isArray(result)) {
      result.forEach((row: any) => {
        const count = parseInt(row.count);
        stats[row.status as keyof typeof stats] = count;
        stats.total += count;
      });
    }
    
    return stats;
  }

  // Limpar QR codes expirados (mais de 5 minutos)
  static async clearExpiredQRCodes(): Promise<number> {
    const query = `
      UPDATE whatsapp_instances 
      SET qr_code = NULL 
      WHERE qr_code IS NOT NULL 
        AND status = 'connecting' 
        AND updated_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `;
    
    const result = await executeQuery(query);
    return (result as any).affectedRows;
  }

  // Verificar se gestor já tem instância ativa
  static async hasActiveInstance(managerId: number): Promise<boolean> {
    const query = `
      SELECT id FROM whatsapp_instances 
      WHERE manager_id = ? AND status = 'connected' AND is_active = TRUE 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [managerId]);
    return Array.isArray(result) && result.length > 0;
  }

  // Contar instâncias por gestor
  static async countByManager(managerId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM whatsapp_instances 
      WHERE manager_id = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (Array.isArray(result) && result.length > 0) {
      return parseInt((result[0] as any).count);
    }
    
    return 0;
  }
}
