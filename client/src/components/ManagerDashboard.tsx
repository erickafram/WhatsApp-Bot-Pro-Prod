import { useState, useEffect } from 'react'
import {
  MessageSquare,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Bot,
  Activity,
  ArrowUp,
  ArrowDown,
  Bell,
  X,
  MessageCircle
} from 'lucide-react'

interface ManagerStats {
  totalChats: number
  activeChats: number
  pendingChats: number
  resolvedToday: number
  totalOperators: number
  onlineOperators: number
  messagesPerDay: number
  avgResponseTime: number
  customerSatisfaction: number
  botInteractions: number
  humanInteractions: number
}

interface Alert {
  id: string
  type: 'new_chat' | 'operator_offline' | 'high_wait_time' | 'system' | 'new_message'
  title: string
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  chatId?: number
}

interface RecentActivity {
  id: string
  type: 'chat_created' | 'chat_resolved' | 'operator_login' | 'message_sent'
  description: string
  timestamp: string
  operatorName?: string
  customerName?: string
}

interface ManagerDashboardProps {
  socket: any
  onNavigate?: (page: string, chatId?: number) => void
}

function ManagerDashboard({ socket, onNavigate }: ManagerDashboardProps) {
  const [stats, setStats] = useState<ManagerStats>({
    totalChats: 0,
    activeChats: 0,
    pendingChats: 0,
    resolvedToday: 0,
    totalOperators: 0,
    onlineOperators: 0,
    messagesPerDay: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0,
    botInteractions: 0,
    humanInteractions: 0
  })

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [showAlerts, setShowAlerts] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData()
    loadAlerts()
    loadRecentActivity()
  }, [])

  // Socket listeners para atualizações em tempo real
  useEffect(() => {
    if (!socket) return

    console.log('🔌 Configurando listeners do socket para ManagerDashboard')

    // Join manager room for real-time updates
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const managerId = user.id
        
        console.log(`👥 ManagerDashboard entrando na sala do manager ${managerId}`)
        socket.emit('join_manager_room', managerId)
      }
    } catch (error) {
      console.error('Erro ao entrar na sala do manager:', error)
    }

    socket.on('human_chat_requested', handleNewPendingChat)
    socket.on('chat_resolved', handleChatResolved)
    socket.on('customer_message', handleNewMessage)
    socket.on('operator_status_change', handleOperatorStatusChange)
    socket.on('dashboard_update', handleDashboardUpdate)
    socket.on('manager_notification', handleManagerNotification)

    // 🚨 LISTENERS PARA ALERTAS INSTANTÂNEOS
    socket.on('dashboard_instant_alert', (data: {
      type: string
      title: string
      message: string
      priority: 'low' | 'medium' | 'high'
      chatId?: number
      customerName?: string
      customerPhone?: string
      timestamp: Date
    }) => {
      console.log('🚨 Alerta instantâneo recebido no ManagerDashboard:', data)
      
      // Criar alerta visual
      const alert: Alert = {
        id: `instant_${data.type}_${Date.now()}`,
        type: data.type as any,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        priority: data.priority,
        read: false,
        chatId: data.chatId
      }
      
      // Adicionar aos alertas existentes
      setAlerts(prev => [alert, ...prev])
      
      // Notificação sonora
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOJ=')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (error) {
        // Ignorar erro do som
      }
      
      // Mostrar notificação do browser
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/vite.svg',
          tag: `manager-alert-${data.chatId || Date.now()}`,
          requireInteraction: true
        })
      }
      
      // Fazer a página chamar atenção
      if (document.title.indexOf('🔔') === -1) {
        document.title = '🔔 Novo Alerta! - ' + document.title
        setTimeout(() => {
          document.title = document.title.replace('🔔 Novo Alerta! - ', '')
        }, 8000)
      }
    })

    return () => {
      socket.off('human_chat_requested', handleNewPendingChat)
      socket.off('chat_resolved', handleChatResolved)
      socket.off('customer_message', handleNewMessage)
      socket.off('operator_status_change', handleOperatorStatusChange)
      socket.off('dashboard_update', handleDashboardUpdate)
      socket.off('manager_notification', handleManagerNotification)
      socket.off('dashboard_instant_alert')
    }
  }, [socket])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('/api/managers/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('/api/managers/alerts', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      } else {
        // Mock data para desenvolvimento
        setAlerts([
          {
            id: '1',
            type: 'new_chat',
            title: 'Nova conversa pendente',
            message: 'Erick Vinicius iniciou uma conversa',
            timestamp: new Date().toISOString(),
            priority: 'high',
            read: false,
            chatId: 34
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('/api/managers/recent-activity', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data)
      } else {
        // Mock data para desenvolvimento
        setRecentActivity([
          {
            id: '1',
            type: 'chat_created',
            description: 'Nova conversa criada com Erick Vinicius',
            timestamp: new Date().toISOString(),
            customerName: 'Erick Vinicius'
          },
          {
            id: '2',
            type: 'operator_login',
            description: 'amanda campos fez login',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            operatorName: 'amanda campos'
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error)
    }
  }

  // Socket event handlers
  const handleNewPendingChat = (data: any) => {
    // Atualizar estatísticas
    setStats(prev => ({
      ...prev,
      pendingChats: prev.pendingChats + 1,
      totalChats: prev.totalChats + 1
    }))

    // Adicionar alerta
    const alert: Alert = {
      id: `pending_${data.chatId}_${Date.now()}`,
      type: 'new_chat',
      title: 'Nova conversa pendente',
      message: `${data.customerName} iniciou uma conversa e precisa de atendimento`,
      timestamp: new Date().toISOString(),
      priority: 'high',
      read: false,
      chatId: data.chatId
    }
    
    setAlerts(prev => [alert, ...prev])

    // Adicionar à atividade recente
    const activity: RecentActivity = {
      id: `activity_${Date.now()}`,
      type: 'chat_created',
      description: `Nova conversa criada com ${data.customerName}`,
      timestamp: new Date().toISOString(),
      customerName: data.customerName
    }

    setRecentActivity(prev => [activity, ...prev.slice(0, 9)])
  }

  const handleChatResolved = (data: any) => {
    setStats(prev => ({
      ...prev,
      pendingChats: Math.max(0, prev.pendingChats - 1),
      resolvedToday: prev.resolvedToday + 1,
      activeChats: Math.max(0, prev.activeChats - 1)
    }))

    // Adicionar à atividade recente
    const activity: RecentActivity = {
      id: `activity_${Date.now()}`,
      type: 'chat_resolved',
      description: `Conversa com ${data.customerName} foi finalizada`,
      timestamp: new Date().toISOString(),
      customerName: data.customerName,
      operatorName: data.operatorName
    }

    setRecentActivity(prev => [activity, ...prev.slice(0, 9)])
  }

  const handleNewMessage = (data: any) => {
    const alert: Alert = {
      id: `message_${data.chatId}_${Date.now()}`,
      type: 'new_message',
      title: 'Nova mensagem',
      message: `${data.customerName}: ${data.message.substring(0, 50)}...`,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      read: false,
      chatId: data.chatId
    }
    
    setAlerts(prev => [alert, ...prev])

    setStats(prev => ({
      ...prev,
      messagesPerDay: prev.messagesPerDay + 1
    }))
  }

  const handleOperatorStatusChange = (data: any) => {
    if (data.status === 'online') {
      setStats(prev => ({
        ...prev,
        onlineOperators: prev.onlineOperators + 1
      }))

      const activity: RecentActivity = {
        id: `activity_${Date.now()}`,
        type: 'operator_login',
        description: `${data.operatorName} entrou online`,
        timestamp: new Date().toISOString(),
        operatorName: data.operatorName
      }

      setRecentActivity(prev => [activity, ...prev.slice(0, 9)])
    } else {
      setStats(prev => ({
        ...prev,
        onlineOperators: Math.max(0, prev.onlineOperators - 1)
      }))
    }
  }

  const handleDashboardUpdate = (data: any) => {
    setStats(prev => ({ ...prev, ...data.stats }))
  }

  const handleManagerNotification = (data: any) => {
    const alert: Alert = {
      id: `notification_${Date.now()}`,
      type: data.type || 'system',
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      priority: data.priority || 'medium',
      read: false,
      chatId: data.chatId
    }
    
    setAlerts(prev => [alert, ...prev])
  }

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })))
  }

  const navigateToChat = (chatId?: number) => {
    if (onNavigate && chatId) {
      onNavigate('chat', chatId)
    }
  }

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="manager-dashboard loading">
        <div className="loading-spinner">
          <Activity className="spinning" />
          <p>Carregando dados da dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="manager-dashboard">
      {/* Header com alertas */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard do Gestor</h1>
          <p>Visão geral das operações e atividades em tempo real</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="alerts-toggle"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell size={20} />
            {unreadAlertsCount > 0 && (
              <span className="alerts-badge">{unreadAlertsCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Painel de alertas */}
      {showAlerts && (
        <div className="alerts-panel">
          <div className="alerts-header">
            <h3>Notificações ({unreadAlertsCount} não lidas)</h3>
            <div className="alerts-actions">
              <button onClick={clearAllAlerts} className="btn-clear">
                Marcar todas como lidas
              </button>
              <button onClick={() => setShowAlerts(false)} className="btn-close">
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <CheckCircle2 size={32} />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              alerts.slice(0, 10).map(alert => (
                <div 
                  key={alert.id} 
                  className={`alert-item ${alert.priority} ${alert.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    markAlertAsRead(alert.id)
                    if (alert.chatId) {
                      navigateToChat(alert.chatId)
                    }
                  }}
                >
                  <div className="alert-icon">
                    {alert.type === 'new_chat' && <MessageSquare size={16} />}
                    {alert.type === 'new_message' && <MessageCircle size={16} />}
                    {alert.type === 'operator_offline' && <UserCheck size={16} />}
                    {alert.type === 'high_wait_time' && <Clock size={16} />}
                    {alert.type === 'system' && <AlertCircle size={16} />}
                  </div>
                  
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{formatTime(alert.timestamp)}</div>
                  </div>
                  
                  {!alert.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalChats}</div>
            <div className="stat-label">Total de Conversas</div>
          </div>
          <div className="stat-trend positive">
            <ArrowUp size={16} />
            +12%
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingChats}</div>
            <div className="stat-label">Conversas Pendentes</div>
          </div>
          {stats.pendingChats > 0 && (
            <div className="stat-alert">
              <AlertCircle size={16} />
            </div>
          )}
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.resolvedToday}</div>
            <div className="stat-label">Resolvidas Hoje</div>
          </div>
          <div className="stat-trend positive">
            <ArrowUp size={16} />
            +8%
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.onlineOperators}/{stats.totalOperators}</div>
            <div className="stat-label">Operadores Online</div>
          </div>
          <div className="stat-status online">●</div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <MessageCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.messagesPerDay}</div>
            <div className="stat-label">Mensagens Hoje</div>
          </div>
          <div className="stat-trend positive">
            <ArrowUp size={16} />
            +15%
          </div>
        </div>

        <div className="stat-card neutral">
          <div className="stat-icon">
            <Bot size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.botInteractions}</div>
            <div className="stat-label">Interações Bot</div>
          </div>
          <div className="stat-trend neutral">
            <ArrowDown size={16} />
            -3%
          </div>
        </div>
      </div>

      {/* Gráficos e atividades */}
      <div className="dashboard-content">
        <div className="content-left">
          <div className="performance-overview">
            <h3>Visão Geral de Performance</h3>
            
            <div className="performance-metrics">
              <div className="metric">
                <div className="metric-header">
                  <span>Tempo Médio de Resposta</span>
                  <TrendingUp size={16} className="trend-up" />
                </div>
                <div className="metric-value">{stats.avgResponseTime}min</div>
                <div className="metric-change positive">-15% vs ontem</div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span>Satisfação do Cliente</span>
                  <TrendingUp size={16} className="trend-up" />
                </div>
                <div className="metric-value">{stats.customerSatisfaction}%</div>
                <div className="metric-change positive">+5% vs ontem</div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span>Taxa de Resolução</span>
                  <TrendingUp size={16} className="trend-up" />
                </div>
                <div className="metric-value">87%</div>
                <div className="metric-change positive">+3% vs ontem</div>
              </div>
            </div>
          </div>


        </div>

        <div className="content-right">
          <div className="recent-activity">
            <h3>Atividade Recente</h3>
            
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <div className="no-activity">
                  <Activity size={32} />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'chat_created' && <MessageSquare size={16} />}
                      {activity.type === 'chat_resolved' && <CheckCircle2 size={16} />}
                      {activity.type === 'operator_login' && <UserCheck size={16} />}
                      {activity.type === 'message_sent' && <MessageCircle size={16} />}
                    </div>
                    
                    <div className="activity-content">
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-time">
                        {formatTime(activity.timestamp)} - {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
