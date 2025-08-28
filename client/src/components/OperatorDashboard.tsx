import { useState, useEffect } from 'react'
import '../styles/OperatorDashboard.css'
import {
  Bell,
  MessageCircle,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  MessageSquare,
  Timer,
  UserCheck
} from 'lucide-react'

interface PendingChat {
  id: number
  customerName: string
  lastMessage: string
  waitingTime: number // in minutes
  priority: 'low' | 'medium' | 'high'
}

interface TransferredChat {
  id: number
  customerName: string
  phoneNumber: string
  transferFromName: string
  transferReason: string
  waitingTime: number
  priority: 'low' | 'medium' | 'high'
  transferredAt: string
}

interface Alert {
  id: string
  type: 'new_message' | 'pending_chat' | 'timeout' | 'escalation'
  title: string
  message: string
  timestamp: string
  priority: 'high' | 'medium' | 'low'
  read: boolean
}

interface DashboardStats {
  pendingChats: number
  activeChats: number
  resolvedToday: number
  averageResponseTime: number
  newMessagesCount: number
  customerSatisfaction: number
}

interface OperatorDashboardProps {
  socket?: any
  onNavigate?: (page: string, chatId?: number) => void
}

function OperatorDashboard({ socket, onNavigate }: OperatorDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    pendingChats: 0,
    activeChats: 0,
    resolvedToday: 0,
    averageResponseTime: 0,
    newMessagesCount: 0,
    customerSatisfaction: 0
  })

  const [pendingChats, setPendingChats] = useState<PendingChat[]>([])
  const [transferredChats, setTransferredChats] = useState<TransferredChat[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Heartbeat para manter operador online
  useEffect(() => {
    const heartbeat = setInterval(async () => {
      try {
        const authToken = localStorage.getItem('authToken')
        if (authToken) {
          // Fazer uma requisição simples para manter a sessão ativa
          await fetch('/api/operators/heartbeat', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })
        }
      } catch (error) {
        console.error('Erro no heartbeat:', error)
      }
    }, 120000) // A cada 2 minutos

    return () => clearInterval(heartbeat)
  }, [])

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
    loadPendingChats()
    loadAlerts()
    fetchTransferredChats()
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      // Join manager room for real-time updates
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          const managerId = user.role === 'operator' ? user.manager_id : user.id
          
          console.log(`👥 Dashboard entrando na sala do manager ${managerId} para receber atualizações`)
          socket.emit('join_manager_room', managerId)
        }
      } catch (error) {
        console.error('Erro ao entrar na sala do manager:', error)
      }

      socket.on('new_pending_chat', handleNewPendingChat)
      socket.on('chat_resolved', handleChatResolved)
      socket.on('new_customer_message', handleNewMessage)
      socket.on('dashboard_update', handleDashboardUpdate)
      
      // 🚨 LISTENER ESPECÍFICO PARA NOVAS CONVERSAS INSTANTÂNEAS
      socket.on('human_chat_requested', (data: {
        chatId: string
        customerName: string
        customerPhone: string
        lastMessage: string
        timestamp: Date
        managerId: number
        humanChatId: number
        contactId: number
      }) => {
        console.log('🔔 Nova conversa recebida no OperatorDashboard:', data)
        
        // Adicionar à lista de conversas pendentes
        const newChat: PendingChat = {
          id: data.humanChatId,
          customerName: data.customerName,
          lastMessage: 'Solicitou atendimento humano',
          waitingTime: 0,
          priority: 'high'
        }
        setPendingChats(prev => [newChat, ...prev])
        
        // Atualizar estatísticas
        setStats(prev => ({
          ...prev,
          pendingChats: prev.pendingChats + 1
        }))
        
        // Adicionar alerta
        const newAlert: Alert = {
          id: `alert_${Date.now()}`,
          type: 'pending_chat',
          title: '🔔 Nova Conversa',
          message: `${data.customerName} solicitou atendimento`,
          timestamp: new Date().toISOString(),
          priority: 'high',
          read: false
        }
        setAlerts(prev => [newAlert, ...prev])
      })
      
      // Listener para atualizações dinâmicas da dashboard
      socket.on('dashboard_chat_update', (data: {
        type: 'new_chat' | 'new_message' | 'transfer_created' | 'transfer_accepted' | 'status_changed' | 'chat_reopened'
        chatId: number
        customerName: string
        customerPhone: string
        status: string
        timestamp: Date
        [key: string]: any
      }) => {
        console.log('📊 Dashboard recebeu atualização:', data)
        
        // Atualizar estatísticas baseado no tipo de evento
        if (data.type === 'new_chat') {
          setStats(prev => ({
            ...prev,
            pendingChats: prev.pendingChats + 1
          }))
          
          // Adicionar à lista de conversas pendentes se não existir
          const newChat = {
            id: data.chatId,
            customerName: data.customerName,
            lastMessage: 'Solicitou atendimento humano',
            waitingTime: 0,
            priority: 'high' as const
          }
          
          setPendingChats(prev => {
            const exists = prev.some(chat => chat.id === data.chatId)
            return exists ? prev : [newChat, ...prev]
          })
        }
        
        if (data.type === 'transfer_created') {
          // Adicionar à lista de transferências se for para este operador
          const userData = localStorage.getItem('user')
          if (userData) {
            const user = JSON.parse(userData)
            if (data.transferTo && data.operatorId === user.id) {
              const newTransfer = {
                id: data.chatId,
                customerName: data.customerName,
                phoneNumber: data.customerPhone,
                transferFromName: data.transferFrom,
                transferReason: data.transferReason,
                waitingTime: 0,
                priority: 'high' as const,
                transferredAt: new Date(data.timestamp).toISOString()
              }
              
              setTransferredChats(prev => {
                const exists = prev.some(chat => chat.id === data.chatId)
                return exists ? prev : [newTransfer, ...prev]
              })
            }
          }
        }
        
        if (data.type === 'transfer_accepted') {
          // Remover da lista de transferências e atualizar stats
          setTransferredChats(prev => prev.filter(chat => chat.id !== data.chatId))
          setStats(prev => ({
            ...prev,
            activeChats: prev.activeChats + 1,
            pendingChats: Math.max(0, prev.pendingChats - 1)
          }))
        }
        
        if (data.type === 'new_message') {
          setStats(prev => ({
            ...prev,
            newMessagesCount: prev.newMessagesCount + 1
          }))
        }
        
        if (data.type === 'chat_reopened') {
          // Adicionar de volta às conversas pendentes
          const reopenedChat = {
            id: data.chatId,
            customerName: data.customerName,
            lastMessage: 'Conversa reaberta pelo cliente',
            waitingTime: 0,
            priority: 'high' as const
          }
          
          setPendingChats(prev => {
            const exists = prev.some(chat => chat.id === data.chatId)
            return exists ? prev : [reopenedChat, ...prev]
          })
          
          setStats(prev => ({
            ...prev,
            pendingChats: prev.pendingChats + 1
          }))
        }
      })

      // Listener específico para mudanças de status de chat humano
      socket.on('human_chat_status_changed', (data: {
        type: 'status_changed'
        chatId: number
        customerName: string
        customerPhone: string
        status: string
        previousStatus: string
        timestamp: Date
        operatorName: string
        operatorId?: number
        managerId: number
      }) => {
        console.log('🚀 OperatorDashboard - Status de chat alterado:', data)
        
        // Recarregar estatísticas para refletir mudanças
        loadDashboardData()
        
        // Se o operador atual fez a mudança, pode mostrar feedback visual
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          if (data.operatorId === user.id) {
            console.log(`✅ Você alterou o status do chat ${data.chatId} para: ${data.status}`)
          }
        }
      })

      return () => {
              socket.off('new_pending_chat', handleNewPendingChat)
      socket.off('chat_resolved', handleChatResolved)
      socket.off('new_customer_message', handleNewMessage)
      socket.off('dashboard_update', handleDashboardUpdate)
      socket.off('dashboard_chat_update')
      socket.off('human_chat_requested')
      socket.off('human_chat_status_changed')
      }
    }
  }, [socket])

  const loadDashboardData = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/operators/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    }
  }

  const loadPendingChats = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/operators/chats/pending', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPendingChats(data.chats || [])
      }
    } catch (error) {
      console.error('Erro ao carregar conversas pendentes:', error)
      // Mock data for development
      setPendingChats([
        {
          id: 1,
          customerName: 'João Silva',
          lastMessage: 'Preciso de ajuda com minha passagem',
          waitingTime: 5,
          priority: 'high'
        },
        {
          id: 2,
          customerName: 'Maria Santos',
          lastMessage: 'Quero cancelar minha viagem',
          waitingTime: 12,
          priority: 'medium'
        },
        {
          id: 3,
          customerName: 'Pedro Costa',
          lastMessage: 'Horários para São Paulo',
          waitingTime: 3,
          priority: 'low'
        }
      ])
    }
  }

  const loadAlerts = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/operators/alerts', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
      // Mock alerts for development
      setAlerts([
        {
          id: '1',
          type: 'pending_chat',
          title: 'Nova conversa pendente',
          message: 'João Silva está aguardando há 5 minutos',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          priority: 'high',
          read: false
        },
        {
          id: '2',
          type: 'timeout',
          title: 'Tempo limite excedido',
          message: 'Maria Santos aguarda há mais de 10 minutos',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          priority: 'high',
          read: false
        },
        {
          id: '3',
          type: 'new_message',
          title: 'Nova mensagem',
          message: 'Pedro Costa enviou uma nova mensagem',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          priority: 'medium',
          read: true
        }
      ])
    }
  }

  const handleNewPendingChat = (data: any) => {
    const newChat: PendingChat = {
      id: data.chatId,
      customerName: data.customerName,
      lastMessage: data.lastMessage,
      waitingTime: 0,
      priority: 'high'
    }
    
    setPendingChats(prev => [newChat, ...prev])
    
    // Add alert
    const alert: Alert = {
      id: `pending_${data.chatId}_${Date.now()}`,
      type: 'pending_chat',
      title: 'Nova conversa pendente',
      message: `${data.customerName} precisa de atendimento`,
      timestamp: new Date().toISOString(),
      priority: 'high',
      read: false
    }
    
    setAlerts(prev => [alert, ...prev])
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingChats: prev.pendingChats + 1
    }))
  }

  const handleChatResolved = (data: any) => {
    setPendingChats(prev => prev.filter(chat => chat.id !== data.chatId))
    setStats(prev => ({
      ...prev,
      pendingChats: Math.max(0, prev.pendingChats - 1),
      resolvedToday: prev.resolvedToday + 1
    }))
  }

  const handleNewMessage = (data: any) => {
    const alert: Alert = {
      id: `message_${data.chatId}_${Date.now()}`,
      type: 'new_message',
      title: 'Nova mensagem',
      message: `${data.customerName}: ${data.message.substring(0, 50)}...`,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      read: false
    }
    
    setAlerts(prev => [alert, ...prev])
    setStats(prev => ({
      ...prev,
      newMessagesCount: prev.newMessagesCount + 1
    }))
  }

  const handleDashboardUpdate = (data: any) => {
    setStats(data.stats)
  }

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })))
  }

  const attendChat = async (chatId: number) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        alert('Token de autenticação não encontrado')
        return
      }

      console.log(`🎯 Atendendo conversa ${chatId}`)

      const response = await fetch(`/api/operators/chats/${chatId}/attend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Conversa atribuída com sucesso:', data)
        
        // Remove the chat from pending list
        setPendingChats(prev => prev.filter(chat => chat.id !== chatId))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pendingChats: Math.max(0, prev.pendingChats - 1),
          activeChats: prev.activeChats + 1
        }))
        
        // Navigate to chat page with the specific chat
        if (onNavigate) {
          onNavigate('chat', chatId)
        }
        
        // Show success message
        alert('Conversa atribuída com sucesso! Redirecionando para o chat...')
        
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao atender conversa:', errorData)
        alert(`Erro ao atender conversa: ${errorData.error}`)
      }

    } catch (error) {
      console.error('❌ Erro ao atender conversa:', error)
      alert('Erro ao atender conversa. Tente novamente.')
    }
  }

  const acceptTransfer = async (chatId: number) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        alert('Token de autenticação não encontrado')
        return
      }

      console.log(`✅ Aceitando transferência da conversa ${chatId}`)

      const response = await fetch(`/api/operators/chats/${chatId}/accept-transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Transferência aceita com sucesso:', data)
        
        // Remove the chat from transferred list
        setTransferredChats(prev => prev.filter(chat => chat.id !== chatId))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeChats: prev.activeChats + 1
        }))
        
        // Navigate to chat page with the specific chat
        if (onNavigate) {
          onNavigate('chat', chatId)
        }
        
        // Show success message
        alert('Transferência aceita com sucesso! Redirecionando para o chat...')
        
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao aceitar transferência:', errorData)
        alert(`Erro ao aceitar transferência: ${errorData.error}`)
      }

    } catch (error) {
      console.error('❌ Erro ao aceitar transferência:', error)
      alert('Erro ao aceitar transferência. Tente novamente.')
    }
  }

  const formatWaitingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'new_message': return <MessageCircle size={16} />
      case 'pending_chat': return <Clock size={16} />
      case 'timeout': return <AlertTriangle size={16} />
      case 'escalation': return <TrendingUp size={16} />
      default: return <Bell size={16} />
    }
  }

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length

  const fetchTransferredChats = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/operators/chats/transferred', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransferredChats(data.transferredChats || [])
      }
    } catch (error) {
      console.error('Erro ao buscar conversas transferidas:', error)
      // Mock data for development
      setTransferredChats([
        {
          id: 101,
          customerName: 'Ana Costa',
          phoneNumber: '5563999887766',
          transferFromName: 'Carlos Silva',
          transferReason: 'Cliente solicitou supervisor',
          waitingTime: 8,
          priority: 'high',
          transferredAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          customerName: 'Roberto Lima',
          phoneNumber: '5563988776655',
          transferFromName: 'Maria Santos',
          transferReason: 'Problema técnico complexo',
          waitingTime: 15,
          priority: 'medium',
          transferredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ])
    }
  }

  return (
    <div className="operator-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <Activity size={28} />
          <div>
            <h1>Dashboard do Operador</h1>
            <p>Painel de controle e alertas em tempo real</p>
          </div>
        </div>
        <div className="header-right">
          <div className="current-time">
            <Clock size={16} />
            <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card urgent">
          <div className="stat-icon">
            <MessageCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Conversas Pendentes</h3>
            <div className="stat-value">{stats.pendingChats}</div>
            <div className="stat-change">Requer atenção imediata</div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Conversas Ativas</h3>
            <div className="stat-value">{stats.activeChats}</div>
            <div className="stat-change">Em atendimento</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Resolvidas Hoje</h3>
            <div className="stat-value">{stats.resolvedToday}</div>
            <div className="stat-change">+{Math.round((stats.resolvedToday / 8) * 100) / 100}/hora</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Timer size={24} />
          </div>
          <div className="stat-content">
            <h3>Tempo Médio</h3>
            <div className="stat-value">{stats.averageResponseTime}min</div>
            <div className="stat-change">Resposta média</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Alerts Panel */}
        <div className="alerts-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Bell size={20} />
              <span>Alertas</span>
              {unreadAlertsCount > 0 && (
                <div className="alert-badge">{unreadAlertsCount}</div>
              )}
            </div>
            <div className="panel-actions">
              <button 
                className="btn-link"
                onClick={() => setShowAllAlerts(!showAllAlerts)}
              >
                {showAllAlerts ? 'Mostrar Menos' : 'Ver Todos'}
              </button>
              {unreadAlertsCount > 0 && (
                <button 
                  className="btn-link"
                  onClick={clearAllAlerts}
                >
                  Marcar Todas Como Lidas
                </button>
              )}
            </div>
          </div>

          <div className="alerts-list">
            {(showAllAlerts ? alerts : alerts.slice(0, 5)).map((alert) => (
              <div 
                key={alert.id}
                className={`alert-item ${alert.read ? 'read' : 'unread'} priority-${alert.priority}`}
                onClick={() => markAlertAsRead(alert.id)}
              >
                <div className="alert-icon">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {new Date(alert.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
                {!alert.read && <div className="alert-dot"></div>}
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="empty-state">
                <CheckCircle size={48} />
                <p>Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Chats */}
        <div className="pending-chats-panel">
          <div className="panel-header">
            <div className="panel-title">
              <MessageSquare size={20} />
              <span>Conversas Pendentes</span>
              {pendingChats.length > 0 && (
                <div className="alert-badge">{pendingChats.length}</div>
              )}
            </div>
          </div>

          <div className="pending-chats-list">
            {pendingChats.map((chat) => (
              <div key={chat.id} className="pending-chat-item">
                <div className="chat-priority" style={{ backgroundColor: getPriorityColor(chat.priority) }}></div>
                <div className="chat-content">
                  <div className="chat-header">
                    <span className="customer-name">{chat.customerName}</span>
                    <span className="waiting-time">
                      <Clock size={14} />
                      {formatWaitingTime(chat.waitingTime)}
                    </span>
                  </div>
                  <div className="chat-message">{chat.lastMessage}</div>
                </div>
                <div className="chat-actions">
                  <button className="btn-primary btn-sm" onClick={() => attendChat(chat.id)}>
                    <UserCheck size={14} />
                    Atender
                  </button>
                </div>
              </div>
            ))}

            {pendingChats.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>Nenhuma conversa pendente</p>
                <span>Todas as conversas estão sendo atendidas</span>
              </div>
            )}
          </div>
        </div>

        {/* Transferred Chats */}
        <div className="pending-chats-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Users size={20} />
              <span>Conversas Transferidas</span>
              {transferredChats.length > 0 && (
                <div className="alert-badge">{transferredChats.length}</div>
              )}
            </div>
          </div>

          <div className="pending-chats-list">
            {transferredChats.map((chat) => (
              <div key={chat.id} className="pending-chat-item">
                <div className="chat-priority" style={{ backgroundColor: getPriorityColor(chat.priority) }}></div>
                <div className="chat-content">
                  <div className="chat-header">
                    <span className="customer-name">{chat.customerName}</span>
                    <span className="waiting-time">
                      <Clock size={14} />
                      {formatWaitingTime(chat.waitingTime)}
                    </span>
                  </div>
                  <div className="chat-message">
                    <strong>De:</strong> {chat.transferFromName} • {chat.transferReason}
                  </div>
                  <div className="chat-phone">
                    📱 {chat.phoneNumber}
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="btn-success btn-sm" onClick={() => acceptTransfer(chat.id)}>
                    <UserCheck size={14} />
                    Aceitar
                  </button>
                </div>
              </div>
            ))}

            {transferredChats.length === 0 && (
              <div className="empty-state">
                <Users size={48} />
                <p>Nenhuma conversa transferida</p>
                <span>Não há transferências pendentes para você</span>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}

export default OperatorDashboard 