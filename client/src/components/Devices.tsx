import React, { useState, useEffect } from 'react';
import '../styles/Devices.css';

interface Device {
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
  last_activity?: string;
  location_data?: any;
  device_fingerprint?: string;
  session_token?: string;
  push_token?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  idle: number;
  blocked: number;
  trusted: number;
}

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Formulário de adição de dispositivo
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    device_type: 'computer' as 'smartphone' | 'tablet' | 'computer' | 'other',
    device_model: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    screen_resolution: `${screen.width}x${screen.height}`
  });

  useEffect(() => {
    loadDevices();
    loadStats();
    
    // Detectar informações do dispositivo atual
    detectCurrentDevice();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      loadDevices();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const detectCurrentDevice = () => {
    const deviceInfo = getDeviceInfo();
    setNewDevice(prev => ({
      ...prev,
      device_name: deviceInfo.name,
      device_type: deviceInfo.type,
      device_model: deviceInfo.model || ''
    }));
  };

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dispositivos');
      }

      const result = await response.json();
      setDevices(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/devices/stats/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Detectar informações adicionais do dispositivo
      const deviceInfo = getDeviceInfo();
      
      const deviceData = {
        ...newDevice,
        os_name: deviceInfo.os.name,
        os_version: deviceInfo.os.version,
        browser_name: deviceInfo.browser.name,
        browser_version: deviceInfo.browser.version,
        user_agent: navigator.userAgent,
        device_fingerprint: await generateDeviceFingerprint()
      };

      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar dispositivo');
      }

      // Resetar formulário
      setNewDevice({
        device_name: '',
        device_type: 'computer' as 'smartphone' | 'tablet' | 'computer' | 'other',
        device_model: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screen_resolution: `${screen.width}x${screen.height}`
      });

      setShowAddForm(false);
      await loadDevices();
      await loadStats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceAction = async (deviceId: number, action: string, data?: any) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/devices/${deviceId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data || {})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na ação');
      }

      await loadDevices();
      await loadStats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDevices = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/devices/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao sincronizar dispositivos');
      }

      const result = await response.json();
      console.log('Sincronização:', result);
      
      // Recarregar dados após sincronização
      await loadDevices();
      await loadStats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na sincronização');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    const device = devices.find(d => d.id === deviceId);
    
    // Verificar se o dispositivo está conectado ao WhatsApp
    if (device && (device.whatsapp_status === 'connected' || device.whatsapp_status === 'connecting')) {
      if (!confirm(
        `⚠️ ATENÇÃO: Este dispositivo está ${device.whatsapp_status === 'connected' ? 'conectado' : 'conectando'} ao WhatsApp!\n\n` +
        `Dispositivo: ${device.device_name}\n` +
        `WhatsApp: ${device.whatsapp_phone || 'Conectado'}\n\n` +
        `Desconecte o WhatsApp primeiro antes de excluir o dispositivo.\n\n` +
        `Tem certeza que deseja continuar mesmo assim? (NÃO RECOMENDADO)`
      )) {
        return;
      }
    } else {
      if (!confirm('Tem certeza que deseja remover este dispositivo?')) {
        return;
      }
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover dispositivo');
      }

      await loadDevices();
      await loadStats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return '📱';
      case 'tablet': return '⬜';
      case 'computer': return '💻';
      default: return '⚫';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#6b7280';
      case 'idle': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'idle': return 'Inativo';
      case 'blocked': return 'Bloqueado';
      default: return 'Desconhecido';
    }
  };

  const getWhatsAppStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getWhatsAppStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  const getWhatsAppStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '●';
      case 'connecting': return '●';
      case 'disconnected': return '●';
      case 'error': return '●';
      default: return '●';
    }
  };

  const formatLastActivity = (lastActivity?: string) => {
    if (!lastActivity) return 'Nunca';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    
    // Detectar tipo de dispositivo
    let type: 'smartphone' | 'tablet' | 'computer' | 'other' = 'computer';
    let name = 'Meu Computador';
    let model = '';

    if (/iPad/.test(ua)) {
      type = 'tablet';
      name = 'Meu iPad';
      model = 'iPad';
    } else if (/iPhone/.test(ua)) {
      type = 'smartphone';
      name = 'Meu iPhone';
      model = 'iPhone';
    } else if (/Android/.test(ua)) {
      if (/Mobile/.test(ua)) {
        type = 'smartphone';
        name = 'Meu Android';
      } else {
        type = 'tablet';
        name = 'Meu Tablet Android';
      }
    }

    // Detectar OS
    const os = {
      name: 'Unknown',
      version: ''
    };

    if (/Windows NT ([\d.]+)/.test(ua)) {
      os.name = 'Windows';
      os.version = RegExp.$1;
    } else if (/Mac OS X ([\d_]+)/.test(ua)) {
      os.name = 'macOS';
      os.version = RegExp.$1.replace(/_/g, '.');
    } else if (/Android ([\d.]+)/.test(ua)) {
      os.name = 'Android';
      os.version = RegExp.$1;
    } else if (/iPhone OS ([\d_]+)/.test(ua)) {
      os.name = 'iOS';
      os.version = RegExp.$1.replace(/_/g, '.');
    }

    // Detectar Browser
    const browser = {
      name: 'Unknown',
      version: ''
    };

    if (/Chrome\/([\d.]+)/.test(ua) && !/Edge/.test(ua)) {
      browser.name = 'Chrome';
      browser.version = RegExp.$1;
    } else if (/Firefox\/([\d.]+)/.test(ua)) {
      browser.name = 'Firefox';
      browser.version = RegExp.$1;
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      browser.name = 'Safari';
      if (/Version\/([\d.]+)/.test(ua)) {
        browser.version = RegExp.$1;
      }
    } else if (/Edge\/([\d.]+)/.test(ua)) {
      browser.name = 'Edge';
      browser.version = RegExp.$1;
    }

    return { type, name, model, os, browser };
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    // Gerar fingerprint básico do dispositivo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Gerar hash simples
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  };

  if (loading && devices.length === 0) {
    return (
      <div className="devices-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dispositivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="devices-container">
      <div className="devices-header">
        <div className="header-content">
          <h1>Dispositivos WhatsApp</h1>
          <p>Monitore dispositivos conectados às suas instâncias WhatsApp</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={handleSyncDevices}
            disabled={loading}
            title="Sincronizar com instâncias WhatsApp"
          >
            Sincronizar
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Adicionar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

              {/* Estatísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">●</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total</p>
            </div>
          </div>
          
          <div className="stat-card online">
            <div className="stat-icon">●</div>
            <div className="stat-content">
              <h3>{stats.online}</h3>
              <p>Online</p>
            </div>
          </div>
          
          <div className="stat-card offline">
            <div className="stat-icon">●</div>
            <div className="stat-content">
              <h3>{stats.offline}</h3>
              <p>Offline</p>
            </div>
          </div>
          
          <div className="stat-card trusted">
            <div className="stat-icon">●</div>
            <div className="stat-content">
              <h3>{stats.trusted}</h3>
              <p>Confiáveis</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Dispositivos */}
      <div className="devices-grid">
        {devices.map(device => (
          <div key={device.id} className={`device-card ${device.status}`}>
            <div className="device-header">
              <div className="device-icon">
                {getDeviceIcon(device.device_type)}
              </div>
              <div className="device-info">
                <h3>{device.device_name}</h3>
                <p>{device.device_model || device.device_type}</p>
              </div>
              <div className="device-badges">
                {device.is_primary && <span className="badge primary">Principal</span>}
                {device.is_trusted && <span className="badge trusted">Confiável</span>}
              </div>
            </div>

            <div className="device-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(device.status) }}
              ></div>
              <span>{getStatusText(device.status)}</span>
            </div>

            <div className="whatsapp-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getWhatsAppStatusColor(device.whatsapp_status) }}
              ></div>
              <span>
                <span style={{ color: getWhatsAppStatusColor(device.whatsapp_status) }}>
                  {getWhatsAppStatusIcon(device.whatsapp_status)}
                </span> WhatsApp: {getWhatsAppStatusText(device.whatsapp_status)}
              </span>
              {device.whatsapp_phone && (
                <small className="whatsapp-phone">{device.whatsapp_phone}</small>
              )}
            </div>

            <div className="device-details">
              <div className="detail-row">
                <span>Sistema:</span>
                <span>{device.os_name} {device.os_version}</span>
              </div>
              <div className="detail-row">
                <span>Navegador:</span>
                <span>{device.browser_name} {device.browser_version}</span>
              </div>
              <div className="detail-row">
                <span>IP:</span>
                <span>{device.ip_address || 'Desconhecido'}</span>
              </div>
              <div className="detail-row">
                <span>Última atividade:</span>
                <span>{formatLastActivity(device.last_activity)}</span>
              </div>
            </div>

            <div className="device-actions">
              <button
                className="btn-action"
                onClick={() => {
                  setSelectedDevice(device);
                  setShowDetails(true);
                }}
              >
                Detalhes
              </button>

              {!device.is_primary && (
                <button
                  className="btn-action primary"
                  onClick={() => handleDeviceAction(device.id, 'set-primary')}
                >
                  Principal
                </button>
              )}

              <button
                className={`btn-action ${device.is_trusted ? 'trusted' : ''}`}
                onClick={() => handleDeviceAction(device.id, 'trust', { trusted: !device.is_trusted })}
              >
                {device.is_trusted ? 'Desconfiar' : 'Confiar'}
              </button>

              {device.status !== 'blocked' ? (
                <button
                  className="btn-action danger"
                  onClick={() => handleDeviceAction(device.id, 'block', { blocked: true })}
                >
                  Bloquear
                </button>
              ) : (
                <button
                  className="btn-action"
                  onClick={() => handleDeviceAction(device.id, 'block', { blocked: false })}
                >
                  Desbloquear
                </button>
              )}

              <button
                className="btn-action danger"
                onClick={() => handleDeleteDevice(device.id)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">●</div>
          <h3>Nenhum dispositivo encontrado</h3>
          <p>Os dispositivos aparecerão automaticamente quando você conectar instâncias WhatsApp</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Adicionar Dispositivo
          </button>
        </div>
      )}

      {/* Modal de Adicionar Dispositivo */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Adicionar Novo Dispositivo</h2>
              <button onClick={() => setShowAddForm(false)}>✕</button>
            </div>

            <form onSubmit={handleAddDevice}>
              <div className="form-group">
                <label>Nome do Dispositivo:</label>
                <input
                  type="text"
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice({...newDevice, device_name: e.target.value})}
                  placeholder="Ex: Meu iPhone, Computador do Escritório"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Dispositivo:</label>
                <select
                  value={newDevice.device_type}
                  onChange={(e) => setNewDevice({...newDevice, device_type: e.target.value as any})}
                >
                  <option value="computer">💻 Computador</option>
                  <option value="smartphone">📱 Smartphone</option>
                  <option value="tablet">📱 Tablet</option>
                  <option value="other">📟 Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Modelo (opcional):</label>
                <input
                  type="text"
                  value={newDevice.device_model}
                  onChange={(e) => setNewDevice({...newDevice, device_model: e.target.value})}
                  placeholder="Ex: iPhone 13, MacBook Pro"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adicionando...' : 'Adicionar Dispositivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 Detalhes do Dispositivo</h2>
              <button onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="device-details-full">
              <div className="detail-section">
                <h3>Informações Básicas</h3>
                <div className="detail-grid">
                  <div><strong>Nome:</strong> {selectedDevice.device_name}</div>
                  <div><strong>Tipo:</strong> {selectedDevice.device_type}</div>
                  <div><strong>Modelo:</strong> {selectedDevice.device_model || 'Não informado'}</div>
                  <div><strong>Status:</strong> {getStatusText(selectedDevice.status)}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sistema e Navegador</h3>
                <div className="detail-grid">
                  <div><strong>Sistema:</strong> {selectedDevice.os_name} {selectedDevice.os_version}</div>
                  <div><strong>Navegador:</strong> {selectedDevice.browser_name} {selectedDevice.browser_version}</div>
                  <div><strong>Idioma:</strong> {selectedDevice.language}</div>
                  <div><strong>Fuso Horário:</strong> {selectedDevice.timezone}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Rede e Localização</h3>
                <div className="detail-grid">
                  <div><strong>IP:</strong> {selectedDevice.ip_address || 'Desconhecido'}</div>
                  <div><strong>Resolução:</strong> {selectedDevice.screen_resolution || 'Desconhecida'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Atividade</h3>
                <div className="detail-grid">
                  <div><strong>Criado em:</strong> {new Date(selectedDevice.created_at).toLocaleString()}</div>
                  <div><strong>Última atividade:</strong> {selectedDevice.last_activity ? new Date(selectedDevice.last_activity).toLocaleString() : 'Nunca'}</div>
                  <div><strong>Principal:</strong> {selectedDevice.is_primary ? 'Sim' : 'Não'}</div>
                  <div><strong>Confiável:</strong> {selectedDevice.is_trusted ? 'Sim' : 'Não'}</div>
                </div>
              </div>

              {selectedDevice.user_agent && (
                <div className="detail-section">
                  <h3>User Agent</h3>
                  <div className="user-agent">
                    {selectedDevice.user_agent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
