import express from 'express';
import { DeviceModel, CreateDeviceData, UpdateDeviceData } from '../models/Device';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Buscar todos os dispositivos do gestor
router.get('/', async (req, res) => {
  try {
    const managerId = req.user?.role === 'admin' ? 
      parseInt(req.query.manager_id as string) || req.user?.id :
      req.user?.id;

    if (!managerId) {
      return res.status(400).json({ message: 'ID do gestor é obrigatório' });
    }

    // Sincronizar com instâncias WhatsApp antes de buscar
    await DeviceModel.syncWithWhatsAppInstances();
    
    // Auto-criar dispositivos para instâncias órfãs
    const createdCount = await DeviceModel.autoCreateForWhatsAppInstances();
    if (createdCount > 0) {
      console.log(`${createdCount} dispositivos criados automaticamente para instâncias WhatsApp`);
    }

    // Buscar dispositivos com informações do WhatsApp
    const devices = await DeviceModel.findWithWhatsAppInstances(managerId);
    
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Buscar dispositivo por ID
router.get('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar se o usuário tem permissão para ver este dispositivo
    if (req.user?.role !== 'admin' && device.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Erro ao buscar dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Criar novo dispositivo
router.post('/', async (req, res) => {
  try {
    const managerId = req.user?.role === 'admin' ? 
      req.body.manager_id || req.user?.id :
      req.user?.id;

    if (!managerId) {
      return res.status(400).json({ message: 'ID do gestor é obrigatório' });
    }

    // Validar dados obrigatórios
    if (!req.body.device_name) {
      return res.status(400).json({ message: 'Nome do dispositivo é obrigatório' });
    }

    // Detectar informações do dispositivo a partir do user agent
    const userAgent = req.get('User-Agent') || '';
    const deviceInfo = parseUserAgent(userAgent);

    const deviceData: CreateDeviceData = {
      manager_id: managerId,
      device_name: req.body.device_name,
      device_type: req.body.device_type || deviceInfo.device_type || 'computer',
      device_model: req.body.device_model || deviceInfo.device_model,
      os_name: req.body.os_name || deviceInfo.os_name,
      os_version: req.body.os_version || deviceInfo.os_version,
      browser_name: req.body.browser_name || deviceInfo.browser_name,
      browser_version: req.body.browser_version || deviceInfo.browser_version,
      ip_address: req.body.ip_address || getClientIP(req),
      user_agent: req.body.user_agent || userAgent,
      screen_resolution: req.body.screen_resolution,
      timezone: req.body.timezone,
      language: req.body.language || req.get('Accept-Language')?.split(',')[0],
      location_data: req.body.location_data,
      device_fingerprint: req.body.device_fingerprint || generateDeviceFingerprint(req),
      session_token: req.body.session_token,
      push_token: req.body.push_token,
      metadata: req.body.metadata
    };

    const device = await DeviceModel.create(deviceData);
    
    res.status(201).json({
      success: true,
      data: device,
      message: 'Dispositivo criado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao criar dispositivo:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: 'Dispositivo já registrado para este gestor' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Atualizar dispositivo
router.put('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const existingDevice = await DeviceModel.findById(deviceId);
    
    if (!existingDevice) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && existingDevice.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updateData: UpdateDeviceData = {
      device_name: req.body.device_name,
      device_type: req.body.device_type,
      device_model: req.body.device_model,
      os_name: req.body.os_name,
      os_version: req.body.os_version,
      browser_name: req.body.browser_name,
      browser_version: req.body.browser_version,
      ip_address: req.body.ip_address,
      user_agent: req.body.user_agent,
      screen_resolution: req.body.screen_resolution,
      timezone: req.body.timezone,
      language: req.body.language,
      status: req.body.status,
      is_trusted: req.body.is_trusted,
      is_primary: req.body.is_primary,
      location_data: req.body.location_data,
      device_fingerprint: req.body.device_fingerprint,
      session_token: req.body.session_token,
      push_token: req.body.push_token,
      metadata: req.body.metadata
    };

    const updatedDevice = await DeviceModel.update(deviceId, updateData);
    
    res.json({
      success: true,
      data: updatedDevice,
      message: 'Dispositivo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Deletar dispositivo
router.delete('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const existingDevice = await DeviceModel.findById(deviceId);
    
    if (!existingDevice) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && existingDevice.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar se o dispositivo pode ser excluído
    const canDeleteResult = await DeviceModel.canDelete(deviceId);
    if (!canDeleteResult.canDelete) {
      return res.status(400).json({ 
        success: false,
        message: canDeleteResult.reason || 'Dispositivo não pode ser excluído'
      });
    }

    const deleted = await DeviceModel.delete(deviceId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Erro ao deletar dispositivo' });
    }

    res.json({
      success: true,
      message: 'Dispositivo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Atualizar atividade do dispositivo
router.post('/:id/activity', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && device.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updated = await DeviceModel.updateActivity(deviceId);
    
    res.json({
      success: true,
      message: updated ? 'Atividade atualizada com sucesso' : 'Erro ao atualizar atividade'
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Definir dispositivo como primário
router.post('/:id/set-primary', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && device.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updated = await DeviceModel.setPrimary(deviceId, device.manager_id);
    
    res.json({
      success: true,
      message: updated ? 'Dispositivo definido como primário' : 'Erro ao definir como primário'
    });
  } catch (error) {
    console.error('Erro ao definir dispositivo primário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Confiar/desconfiar no dispositivo
router.post('/:id/trust', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const trusted = req.body.trusted === true;
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && device.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updated = await DeviceModel.setTrusted(deviceId, trusted);
    
    res.json({
      success: true,
      message: updated ? 
        (trusted ? 'Dispositivo marcado como confiável' : 'Confiança removida do dispositivo') :
        'Erro ao atualizar confiança'
    });
  } catch (error) {
    console.error('Erro ao atualizar confiança:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Bloquear/desbloquear dispositivo
router.post('/:id/block', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const blocked = req.body.blocked === true;
    
    if (isNaN(deviceId)) {
      return res.status(400).json({ message: 'ID do dispositivo inválido' });
    }

    const device = await DeviceModel.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Verificar permissões
    if (req.user?.role !== 'admin' && device.manager_id !== req.user?.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updated = await DeviceModel.setBlocked(deviceId, blocked);
    
    res.json({
      success: true,
      message: updated ? 
        (blocked ? 'Dispositivo bloqueado' : 'Dispositivo desbloqueado') :
        'Erro ao atualizar status'
    });
  } catch (error) {
    console.error('Erro ao bloquear/desbloquear dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Buscar estatísticas dos dispositivos
router.get('/stats/overview', async (req, res) => {
  try {
    const managerId = req.user?.role === 'admin' ? 
      parseInt(req.query.manager_id as string) :
      req.user?.id;

    const stats = await DeviceModel.getStats(managerId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Buscar dispositivos online
router.get('/status/online', async (req, res) => {
  try {
    const managerId = req.user?.role === 'admin' ? 
      parseInt(req.query.manager_id as string) :
      req.user?.id;

    const devices = await DeviceModel.findOnlineDevices(managerId);
    
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Erro ao buscar dispositivos online:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Forçar sincronização com WhatsApp
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronização forçada de dispositivos...');
    
    // Sincronizar status
    const syncedCount = await DeviceModel.syncWithWhatsAppInstances();
    
    // Auto-criar dispositivos órfãos
    const createdCount = await DeviceModel.autoCreateForWhatsAppInstances();
    
    console.log(`✅ Sincronização concluída: ${syncedCount} atualizados, ${createdCount} criados`);
    
    res.json({
      success: true,
      message: 'Sincronização realizada com sucesso',
      data: {
        synced: syncedCount,
        created: createdCount
      }
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Helper functions
function parseUserAgent(userAgent: string) {
  // Implementação básica de parse do user agent
  // Em produção, considere usar uma biblioteca como 'ua-parser-js'
  const info = {
    device_type: 'computer' as 'smartphone' | 'tablet' | 'computer' | 'other',
    device_model: undefined as string | undefined,
    os_name: undefined as string | undefined,
    os_version: undefined as string | undefined,
    browser_name: undefined as string | undefined,
    browser_version: undefined as string | undefined
  };

  // Detectar tipo de dispositivo
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    info.device_type = /iPad/.test(userAgent) ? 'tablet' : 'smartphone';
  }

  // Detectar OS
  if (/Windows/.test(userAgent)) {
    info.os_name = 'Windows';
    const match = userAgent.match(/Windows NT ([\d.]+)/);
    if (match) info.os_version = match[1];
  } else if (/Mac OS X/.test(userAgent)) {
    info.os_name = 'macOS';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    if (match) info.os_version = match[1].replace(/_/g, '.');
  } else if (/Android/.test(userAgent)) {
    info.os_name = 'Android';
    const match = userAgent.match(/Android ([\d.]+)/);
    if (match) info.os_version = match[1];
  } else if (/iPhone OS/.test(userAgent)) {
    info.os_name = 'iOS';
    const match = userAgent.match(/iPhone OS ([\d_]+)/);
    if (match) info.os_version = match[1].replace(/_/g, '.');
  }

  // Detectar browser
  if (/Chrome/.test(userAgent)) {
    info.browser_name = 'Chrome';
    const match = userAgent.match(/Chrome\/([\d.]+)/);
    if (match) info.browser_version = match[1];
  } else if (/Firefox/.test(userAgent)) {
    info.browser_name = 'Firefox';
    const match = userAgent.match(/Firefox\/([\d.]+)/);
    if (match) info.browser_version = match[1];
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    info.browser_name = 'Safari';
    const match = userAgent.match(/Version\/([\d.]+)/);
    if (match) info.browser_version = match[1];
  } else if (/Edge/.test(userAgent)) {
    info.browser_name = 'Edge';
    const match = userAgent.match(/Edge\/([\d.]+)/);
    if (match) info.browser_version = match[1];
  }

  return info;
}

function getClientIP(req: express.Request): string {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         (req.connection as any)?.socket?.remoteAddress ||
         'unknown';
}

function generateDeviceFingerprint(req: express.Request): string {
  // Gerar fingerprint básico baseado em headers e IP
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const ip = getClientIP(req);
  
  const fingerprint = Buffer.from(
    `${userAgent}${acceptLanguage}${acceptEncoding}${ip}`
  ).toString('base64').substring(0, 32);
  
  return fingerprint;
}

export default router;
