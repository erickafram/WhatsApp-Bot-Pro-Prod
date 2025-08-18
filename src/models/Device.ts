import { executeQuery } from '../config/database';

export interface Device {
  id: number;
  manager_id: number;
  whatsapp_instance_id?: number;
  device_name: string;
  device_type: 'smartphone' | 'tablet' | 'computer' | 'other';
  device_model?: string;
  os_name?: string;
  os_version?: string;
  browser_name?: string;
  browser_version?: string;
  ip_address?: string;
  user_agent?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  whatsapp_status: 'disconnected' | 'connecting' | 'connected' | 'error';
  whatsapp_phone?: string;
  status: 'online' | 'offline' | 'idle' | 'blocked';
  is_trusted: boolean;
  is_primary: boolean;
  last_activity?: Date;
  location_data?: any;
  device_fingerprint?: string;
  session_token?: string;
  push_token?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeviceData {
  manager_id: number;
  whatsapp_instance_id?: number;
  device_name: string;
  device_type?: 'smartphone' | 'tablet' | 'computer' | 'other';
  device_model?: string;
  os_name?: string;
  os_version?: string;
  browser_name?: string;
  browser_version?: string;
  ip_address?: string;
  user_agent?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  whatsapp_status?: 'disconnected' | 'connecting' | 'connected' | 'error';
  whatsapp_phone?: string;
  location_data?: any;
  device_fingerprint?: string;
  session_token?: string;
  push_token?: string;
  metadata?: any;
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> {
  device_name?: string;
  status?: 'online' | 'offline' | 'idle' | 'blocked';
  whatsapp_status?: 'disconnected' | 'connecting' | 'connected' | 'error';
  whatsapp_phone?: string;
  is_trusted?: boolean;
  is_primary?: boolean;
}

export class DeviceModel {
  // Criar novo dispositivo
  static async create(data: CreateDeviceData): Promise<Device> {
    const query = `
      INSERT INTO devices (
        manager_id, whatsapp_instance_id, device_name, device_type, device_model, os_name, os_version,
        browser_name, browser_version, ip_address, user_agent, screen_resolution,
        timezone, language, whatsapp_status, whatsapp_phone, location_data, device_fingerprint, session_token,
        push_token, metadata, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'offline')
    `;
    
    const result = await executeQuery(query, [
      data.manager_id,
      data.whatsapp_instance_id || null,
      data.device_name,
      data.device_type || 'smartphone',
      data.device_model || null,
      data.os_name || null,
      data.os_version || null,
      data.browser_name || null,
      data.browser_version || null,
      data.ip_address || null,
      data.user_agent || null,
      data.screen_resolution || null,
      data.timezone || null,
      data.language || null,
      data.whatsapp_status || 'disconnected',
      data.whatsapp_phone || null,
      data.location_data ? JSON.stringify(data.location_data) : null,
      data.device_fingerprint || null,
      data.session_token || null,
      data.push_token || null,
      data.metadata ? JSON.stringify(data.metadata) : null
    ]);
    
    const insertId = (result as any).insertId;
    const device = await DeviceModel.findById(insertId);
    
    if (!device) {
      throw new Error('Erro ao criar dispositivo');
    }
    
    return device;
  }

  // Buscar dispositivo por ID
  static async findById(id: number): Promise<Device | null> {
    const query = 'SELECT * FROM devices WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return DeviceModel.parseDevice(result[0]);
  }

  // Buscar dispositivos de um gestor
  static async findByManagerId(managerId: number): Promise<Device[]> {
    const query = `
      SELECT * FROM devices 
      WHERE manager_id = ? 
      ORDER BY is_primary DESC, last_activity DESC, created_at DESC
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map(device => DeviceModel.parseDevice(device));
  }

  // Buscar dispositivo por fingerprint
  static async findByFingerprint(managerId: number, fingerprint: string): Promise<Device | null> {
    const query = 'SELECT * FROM devices WHERE manager_id = ? AND device_fingerprint = ?';
    const result = await executeQuery(query, [managerId, fingerprint]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return DeviceModel.parseDevice(result[0]);
  }

  // Buscar dispositivo por token de sessão
  static async findBySessionToken(sessionToken: string): Promise<Device | null> {
    const query = 'SELECT * FROM devices WHERE session_token = ?';
    const result = await executeQuery(query, [sessionToken]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return DeviceModel.parseDevice(result[0]);
  }

  // Atualizar dispositivo
  static async update(id: number, updateData: UpdateDeviceData): Promise<Device | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updateData.device_name) {
      fields.push('device_name = ?');
      values.push(updateData.device_name);
    }
    
    if (updateData.device_type) {
      fields.push('device_type = ?');
      values.push(updateData.device_type);
    }
    
    if (updateData.device_model !== undefined) {
      fields.push('device_model = ?');
      values.push(updateData.device_model);
    }
    
    if (updateData.os_name !== undefined) {
      fields.push('os_name = ?');
      values.push(updateData.os_name);
    }
    
    if (updateData.os_version !== undefined) {
      fields.push('os_version = ?');
      values.push(updateData.os_version);
    }
    
    if (updateData.browser_name !== undefined) {
      fields.push('browser_name = ?');
      values.push(updateData.browser_name);
    }
    
    if (updateData.browser_version !== undefined) {
      fields.push('browser_version = ?');
      values.push(updateData.browser_version);
    }
    
    if (updateData.ip_address !== undefined) {
      fields.push('ip_address = ?');
      values.push(updateData.ip_address);
    }
    
    if (updateData.user_agent !== undefined) {
      fields.push('user_agent = ?');
      values.push(updateData.user_agent);
    }
    
    if (updateData.screen_resolution !== undefined) {
      fields.push('screen_resolution = ?');
      values.push(updateData.screen_resolution);
    }
    
    if (updateData.timezone !== undefined) {
      fields.push('timezone = ?');
      values.push(updateData.timezone);
    }
    
    if (updateData.language !== undefined) {
      fields.push('language = ?');
      values.push(updateData.language);
    }
    
    if (updateData.status) {
      fields.push('status = ?');
      values.push(updateData.status);
    }
    
    if (updateData.is_trusted !== undefined) {
      fields.push('is_trusted = ?');
      values.push(updateData.is_trusted);
    }
    
    if (updateData.is_primary !== undefined) {
      fields.push('is_primary = ?');
      values.push(updateData.is_primary);
    }
    
    if (updateData.location_data !== undefined) {
      fields.push('location_data = ?');
      values.push(updateData.location_data ? JSON.stringify(updateData.location_data) : null);
    }
    
    if (updateData.device_fingerprint !== undefined) {
      fields.push('device_fingerprint = ?');
      values.push(updateData.device_fingerprint);
    }
    
    if (updateData.session_token !== undefined) {
      fields.push('session_token = ?');
      values.push(updateData.session_token);
    }
    
    if (updateData.push_token !== undefined) {
      fields.push('push_token = ?');
      values.push(updateData.push_token);
    }
    
    if (updateData.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(updateData.metadata ? JSON.stringify(updateData.metadata) : null);
    }
    
    if (fields.length === 0) {
      return await DeviceModel.findById(id);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await DeviceModel.findById(id);
  }

  // Atualizar atividade do dispositivo
  static async updateActivity(id: number): Promise<boolean> {
    const query = `
      UPDATE devices 
      SET last_activity = CURRENT_TIMESTAMP, status = 'online', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Marcar dispositivo como offline
  static async setOffline(id: number): Promise<boolean> {
    const query = `
      UPDATE devices 
      SET status = 'offline', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Definir dispositivo como primário
  static async setPrimary(id: number, managerId: number): Promise<boolean> {
    // Primeiro, remover o flag primário de todos os dispositivos do gestor
    await executeQuery(
      'UPDATE devices SET is_primary = FALSE WHERE manager_id = ?',
      [managerId]
    );
    
    // Depois, definir o dispositivo atual como primário
    const result = await executeQuery(
      'UPDATE devices SET is_primary = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND manager_id = ?',
      [id, managerId]
    );
    
    return (result as any).affectedRows > 0;
  }

  // Confiar no dispositivo
  static async setTrusted(id: number, trusted: boolean): Promise<boolean> {
    const query = `
      UPDATE devices 
      SET is_trusted = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [trusted, id]);
    return (result as any).affectedRows > 0;
  }

  // Bloquear/desbloquear dispositivo
  static async setBlocked(id: number, blocked: boolean): Promise<boolean> {
    const status = blocked ? 'blocked' : 'offline';
    const query = `
      UPDATE devices 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [status, id]);
    return (result as any).affectedRows > 0;
  }

  // Deletar dispositivo
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM devices WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return (result as any).affectedRows > 0;
  }

  // Buscar dispositivos online
  static async findOnlineDevices(managerId?: number): Promise<Device[]> {
    let query = `
      SELECT * FROM devices 
      WHERE status = 'online'
    `;
    const params: any[] = [];
    
    if (managerId) {
      query += ' AND manager_id = ?';
      params.push(managerId);
    }
    
    query += ' ORDER BY last_activity DESC';
    
    const result = await executeQuery(query, params);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map(device => DeviceModel.parseDevice(device));
  }

  // Estatísticas dos dispositivos
  static async getStats(managerId?: number): Promise<{
    total: number;
    online: number;
    offline: number;
    idle: number;
    blocked: number;
    trusted: number;
  }> {
    let query = `
      SELECT 
        status,
        is_trusted,
        COUNT(*) as count
      FROM devices
    `;
    const params: any[] = [];
    
    if (managerId) {
      query += ' WHERE manager_id = ?';
      params.push(managerId);
    }
    
    query += ' GROUP BY status, is_trusted';
    
    const result = await executeQuery(query, params);
    
    const stats = {
      total: 0,
      online: 0,
      offline: 0,
      idle: 0,
      blocked: 0,
      trusted: 0
    };
    
    if (Array.isArray(result)) {
      result.forEach((row: any) => {
        const count = parseInt(row.count);
        stats.total += count;
        
        if (row.status === 'online') stats.online += count;
        else if (row.status === 'offline') stats.offline += count;
        else if (row.status === 'idle') stats.idle += count;
        else if (row.status === 'blocked') stats.blocked += count;
        
        if (row.is_trusted) stats.trusted += count;
      });
    }
    
    return stats;
  }

  // Limpar dispositivos inativos (mais de 30 dias sem atividade)
  static async cleanupInactiveDevices(): Promise<number> {
    const query = `
      DELETE FROM devices 
      WHERE status = 'offline' 
        AND (last_activity IS NULL OR last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY))
        AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const result = await executeQuery(query);
    return (result as any).affectedRows;
  }

  // Marcar dispositivos como offline se não têm atividade recente
  static async markInactiveAsOffline(): Promise<number> {
    const query = `
      UPDATE devices 
      SET status = 'offline', updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('online', 'idle') 
        AND last_activity < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `;
    
    const result = await executeQuery(query);
    return (result as any).affectedRows;
  }

  // Helper para fazer parse dos campos JSON
  private static parseDevice(deviceData: any): Device {
    const device = { ...deviceData };
    
    // Parse JSON fields
    if (device.location_data && typeof device.location_data === 'string') {
      try {
        device.location_data = JSON.parse(device.location_data);
      } catch (e) {
        device.location_data = null;
      }
    }
    
    if (device.metadata && typeof device.metadata === 'string') {
      try {
        device.metadata = JSON.parse(device.metadata);
      } catch (e) {
        device.metadata = null;
      }
    }
    
    return device;
  }

  // Buscar dispositivo primário do gestor
  static async findPrimaryDevice(managerId: number): Promise<Device | null> {
    const query = `
      SELECT * FROM devices 
      WHERE manager_id = ? AND is_primary = TRUE 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [managerId]);
    
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    return DeviceModel.parseDevice(result[0]);
  }

  // Contar dispositivos por gestor
  static async countByManager(managerId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM devices WHERE manager_id = ?';
    const result = await executeQuery(query, [managerId]);
    
    if (Array.isArray(result) && result.length > 0) {
      return parseInt((result[0] as any).count);
    }
    
    return 0;
  }

  // Buscar dispositivos conectados ao WhatsApp
  static async findWithWhatsAppInstances(managerId?: number): Promise<Device[]> {
    let query = `
      SELECT d.*, wi.instance_name, wi.phone_number as whatsapp_phone_instance, wi.status as whatsapp_status_instance
      FROM devices d
      LEFT JOIN whatsapp_instances wi ON d.whatsapp_instance_id = wi.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (managerId) {
      query += ' AND d.manager_id = ?';
      params.push(managerId);
    }
    
    query += ' ORDER BY d.is_primary DESC, CASE WHEN wi.status = "connected" THEN 1 WHEN wi.status = "connecting" THEN 2 ELSE 3 END, d.created_at DESC';
    
    const result = await executeQuery(query, params);
    
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result.map(device => DeviceModel.parseDevice(device));
  }

  // Associar dispositivo com instância WhatsApp
  static async linkToWhatsAppInstance(deviceId: number, instanceId: number): Promise<boolean> {
    const query = `
      UPDATE devices 
      SET whatsapp_instance_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [instanceId, deviceId]);
    return (result as any).affectedRows > 0;
  }

  // Desassociar dispositivo de instância WhatsApp
  static async unlinkFromWhatsAppInstance(deviceId: number): Promise<boolean> {
    const query = `
      UPDATE devices 
      SET whatsapp_instance_id = NULL, whatsapp_status = 'disconnected', whatsapp_phone = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [deviceId]);
    return (result as any).affectedRows > 0;
  }

  // Atualizar status do WhatsApp
  static async updateWhatsAppStatus(
    deviceId: number, 
    status: 'disconnected' | 'connecting' | 'connected' | 'error',
    phone?: string
  ): Promise<boolean> {
    const fields = ['whatsapp_status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [status];
    
    if (phone) {
      fields.push('whatsapp_phone = ?');
      values.push(phone);
    }
    
    values.push(deviceId);
    
    const query = `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, values);
    
    return (result as any).affectedRows > 0;
  }

  // Verificar se dispositivo pode ser excluído (não deve ter WhatsApp ativo)
  static async canDelete(deviceId: number): Promise<{ canDelete: boolean; reason?: string }> {
    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return { canDelete: false, reason: 'Dispositivo não encontrado' };
    }

    // Se tem instância WhatsApp associada, verificar se está conectada
    if (device.whatsapp_instance_id) {
      if (device.whatsapp_status === 'connected' || device.whatsapp_status === 'connecting') {
        return { 
          canDelete: false, 
          reason: 'Dispositivo está conectado ao WhatsApp. Desconecte primeiro antes de excluir.' 
        };
      }
    }

    return { canDelete: true };
  }

  // Sincronizar status com instâncias WhatsApp
  static async syncWithWhatsAppInstances(): Promise<number> {
    const query = `
      UPDATE devices d
      LEFT JOIN whatsapp_instances wi ON d.whatsapp_instance_id = wi.id
      SET 
        d.whatsapp_status = COALESCE(wi.status, 'disconnected'),
        d.whatsapp_phone = wi.phone_number,
        d.status = CASE 
          WHEN wi.status = 'connected' THEN 'online'
          WHEN wi.status = 'connecting' THEN 'idle'
          ELSE 'offline'
        END,
        d.last_activity = CASE 
          WHEN wi.status = 'connected' THEN COALESCE(wi.last_activity, CURRENT_TIMESTAMP)
          ELSE d.last_activity
        END,
        d.updated_at = CURRENT_TIMESTAMP
      WHERE d.whatsapp_instance_id IS NOT NULL
    `;
    
    const result = await executeQuery(query);
    return (result as any).affectedRows;
  }

  // Auto-criar dispositivos para instâncias WhatsApp órfãs
  static async autoCreateForWhatsAppInstances(): Promise<number> {
    // Buscar instâncias que não têm dispositivo associado
    const orphanQuery = `
      SELECT wi.* 
      FROM whatsapp_instances wi
      LEFT JOIN devices d ON wi.id = d.whatsapp_instance_id
      WHERE d.id IS NULL AND wi.is_active = TRUE
    `;
    
    const orphanInstances = await executeQuery(orphanQuery);
    
    if (!Array.isArray(orphanInstances) || orphanInstances.length === 0) {
      return 0;
    }

    let created = 0;
    
    for (const instance of orphanInstances) {
      try {
        const deviceData: CreateDeviceData = {
          manager_id: instance.manager_id,
          whatsapp_instance_id: instance.id,
          device_name: instance.instance_name || `Dispositivo WhatsApp ${instance.id}`,
          device_type: 'smartphone',
          whatsapp_status: instance.status || 'disconnected',
          whatsapp_phone: instance.phone_number
        };

        await DeviceModel.create(deviceData);
        created++;
      } catch (error) {
        console.error(`Erro ao criar dispositivo para instância ${instance.id}:`, error);
      }
    }

    return created;
  }
}
