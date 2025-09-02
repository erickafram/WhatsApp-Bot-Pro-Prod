import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Square, 
  RefreshCw,
  Clock,
  Bot,
  MessageSquare,
  Crown,
  Lock
} from 'lucide-react'
import QRCodePopup from './QRCodePopup'
import SubscriptionUpgrade from './SubscriptionUpgrade'
import TermsOfResponsibility from './TermsOfResponsibility'
import './BotInstanceDark.css'

interface ConnectionStatus {
  connected: boolean
  message: string
}

interface BotInstanceProps {
  socket: any | null
  setSocket: (socket: any) => void
}

function BotInstance({ socket, setSocket }: BotInstanceProps) {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false, message: 'Verificando status...' })
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [uptime, setUptime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showQRPopup, setShowQRPopup] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userRole, setUserRole] = useState<string>('manager')
  const [userSubscription, setUserSubscription] = useState({
    status: 'free',
    plan: null,
    endDate: null
  })
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [instanceStats, setInstanceStats] = useState({
    activeCount: 0,
    totalCount: 0,
    limit: 1,
    canCreateMore: false
  })

  // Get user role and subscription from localStorage and API
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role || 'manager')
      
      // Fetch full user data including subscription
      fetchUserSubscription()
    }
  }, [])

  // Fetch user subscription status
  const fetchUserSubscription = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUserSubscription({
          status: userData.user.subscription_status || 'free',
          plan: userData.user.subscription_plan,
          endDate: userData.user.subscription_end_date
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados de assinatura:', error)
    }
  }

  // Fetch instance statistics
  const fetchInstanceStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/whatsapp/instances', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.stats) {
          setInstanceStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de instâncias:', error)
    }
  }

  // Fetch stats on component mount
  useEffect(() => {
    fetchInstanceStats()
  }, [])

  const clearQRStates = () => {
    setShowQRPopup(false)
    setIsConnecting(false)
    setQrCode(null)
  }

  useEffect(() => {
    // Conectar ao socket se não existir
    if (!socket) {
      console.log('🔌 Criando novo socket no BotInstance')
      const newSocket = io(window.location.origin, {
        forceNew: true,
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })
      setSocket(newSocket)
      
      // Event listeners
      newSocket.on('status', (data: ConnectionStatus) => {
        console.log('📡 Status recebido via socket:', data)
        setStatus(data)
        setIsLoading(false)
        
        // Se conectou com sucesso, fechar popup e limpar estados
        if (data.connected) {
          clearQRStates()
        }
      })

      newSocket.on('qr', (qrData: string | null) => {
        console.log('📱 QR Code recebido via socket:', qrData ? 'QR Code disponível' : 'QR Code removido')
        setQrCode(qrData)
        if (qrData) {
          setShowQRPopup(true)
          setIsConnecting(false)
        } else {
          // QR Code removido, fechar popup
          clearQRStates()
        }
      })

      newSocket.on('message_received', () => {
        setMessageCount(prev => prev + 1)
      })

      return () => {
        newSocket.close()
      }
    } else {
      // Se o socket já existe, apenas configurar os listeners específicos da instância
      console.log('🔌 Usando socket existente no BotInstance:', socket.id)
      
      socket.on('status', (data: ConnectionStatus) => {
        console.log('📡 Status recebido via socket (socket existente):', data)
        setStatus(data)
        setIsLoading(false)
        
        // Se conectou com sucesso, fechar popup e limpar estados
        if (data.connected) {
          clearQRStates()
        }
      })

      socket.on('qr', (qrData: string | null) => {
        console.log('📱 QR Code recebido via socket (socket existente):', qrData ? 'QR Code disponível' : 'QR Code removido')
        setQrCode(qrData)
        if (qrData) {
          setShowQRPopup(true)
          setIsConnecting(false)
        } else {
          // QR Code removido, fechar popup
          clearQRStates()
        }
      })

      socket.on('message_received', () => {
        setMessageCount(prev => prev + 1)
      })
    }
  }, [socket, setSocket])

  // Verificar status inicial quando o componente é montado
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const authToken = localStorage.getItem('authToken')
        const userData = localStorage.getItem('user')
        
        if (!authToken || !userData) {
          setStatus({ connected: false, message: 'Usuário não autenticado' })
          setIsLoading(false)
          return
        }
        
        const user = JSON.parse(userData)
        
        // Verificar se há instâncias ativas para este gestor
        const response = await fetch('/api/whatsapp/instances', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        
        if (response.ok) {
          const instancesData = await response.json()
          const activeInstance = instancesData.instances.find((inst: any) => inst.status === 'connected')
          
          if (activeInstance) {
            console.log('📡 Instância ativa encontrada:', activeInstance)
            setStatus({
              connected: true,
              message: 'WhatsApp conectado com sucesso!'
            })
            
            // Entrar na sala do gestor para receber eventos
            if (socket) {
              socket.emit('join_manager_room', user.id)
              console.log(`👥 Reconectando na sala do gestor ${user.id}`)
            }
          } else {
            console.log('📡 Nenhuma instância ativa encontrada')
            setStatus({
              connected: false,
              message: 'Pronto para conectar'
            })
          }
        } else {
          console.error('Erro ao verificar instâncias')
          setStatus({
            connected: false,
            message: 'Erro ao verificar status'
          })
        }
      } catch (error) {
        console.error('Erro ao verificar status inicial:', error)
        setStatus({
          connected: false,
          message: 'Erro ao verificar status'
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkInitialStatus()
  }, [socket])

  useEffect(() => {
    // Atualizar uptime a cada segundo
    const interval = setInterval(() => {
      if (status.connected) {
        setUptime(prev => prev + 1000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status.connected])

  // Fechar popup automaticamente quando conectar
  useEffect(() => {
    if (status.connected && showQRPopup) {
      console.log('✅ Conexão estabelecida, fechando popup QR')
      clearQRStates()
    }
  }, [status.connected, showQRPopup])

  const startInstance = async () => {
    // Verificar se o usuário tem assinatura ativa
    if (!canCreateInstance()) {
      setShowSubscriptionModal(true)
      return
    }

    // Mostrar termos de responsabilidade primeiro
    setShowTermsModal(true)
  }

  const proceedWithInstanceStart = async () => {
    setShowTermsModal(false)
    setIsLoading(true)
    setIsConnecting(true)
    setMessageCount(0)
    setUptime(0)
    setQrCode(null)
    setShowQRPopup(true)
    
    try {
      // Obter dados do usuário logado
      const userData = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')
      
      if (!userData || !authToken) {
        setStatus({ connected: false, message: 'Usuário não autenticado' })
        setIsLoading(false)
        return
      }
      
      const user = JSON.parse(userData)
      
      // Criar instância no banco de dados primeiro
      const response = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          instance_name: `Instância ${user.name}`,
          webhook_url: null
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setStatus({ connected: false, message: errorData.error || 'Erro ao criar instância' })
        setIsLoading(false)
        return
      }
      
      const instanceData = await response.json()
      
      // Agora iniciar a instância via socket com os IDs corretos
      const socketData = {
        managerId: user.id,
        instanceId: instanceData.instance.id
      }
      
      console.log('🔄 Enviando dados para socket:', socketData)
      console.log('📄 Resposta da API:', instanceData)
      
      // Entrar na sala do gestor para receber eventos específicos
      socket?.emit('join_manager_room', user.id)
      console.log(`👥 Entrando na sala do gestor ${user.id}`)
      
      socket?.emit('start_instance', socketData)
      
      // Atualizar estatísticas após criar instância
      await fetchInstanceStats()
      
    } catch (error) {
      console.error('Erro ao iniciar instância:', error)
      setStatus({ connected: false, message: 'Erro ao conectar com servidor' })
      setIsLoading(false)
    }
  }

  const stopInstance = async () => {
    setIsLoading(true)
    
    try {
      // Obter dados do usuário logado
      const userData = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')
      
      if (!userData || !authToken) {
        setStatus({ connected: false, message: 'Usuário não autenticado' })
        setIsLoading(false)
        return
      }
      
      const user = JSON.parse(userData)
      
      // Buscar instância ativa do usuário
      const response = await fetch('/api/whatsapp/instances', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const instancesData = await response.json()
        const activeInstance = instancesData.instances.find((inst: any) => inst.status === 'connected')
        
        if (activeInstance) {
          socket?.emit('stop_instance', {
            managerId: user.id,
            instanceId: activeInstance.id
          })
        } else {
          setStatus({ connected: false, message: 'Nenhuma instância ativa encontrada' })
          setIsLoading(false)
        }
      } else {
        setStatus({ connected: false, message: 'Erro ao buscar instâncias' })
        setIsLoading(false)
      }
      
      // Atualizar estatísticas após parar instância
      await fetchInstanceStats()
      
    } catch (error) {
      console.error('Erro ao parar instância:', error)
      setStatus({ connected: false, message: 'Erro ao conectar com servidor' })
      setIsLoading(false)
    }
  }

  const refreshStatus = async () => {
    setIsLoading(true)
    try {
      const authToken = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (!authToken || !userData) {
        setStatus({ connected: false, message: 'Usuário não autenticado' })
        setIsLoading(false)
        return
      }
      
      const user = JSON.parse(userData)
      
      // Verificar instâncias específicas do gestor
      const response = await fetch('/api/whatsapp/instances', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const instancesData = await response.json()
        const activeInstance = instancesData.instances.find((inst: any) => inst.status === 'connected')
        
        if (activeInstance) {
          console.log('🔄 Status atualizado - Conectado:', activeInstance)
          setStatus({
            connected: true,
            message: 'WhatsApp conectado com sucesso!'
          })
          
          // Reconectar na sala do gestor
          if (socket) {
            socket.emit('join_manager_room', user.id)
          }
          
          // Resetar uptime se necessário
          setUptime(0)
        } else {
          console.log('🔄 Status atualizado - Desconectado')
          setStatus({
            connected: false,
            message: 'Pronto para conectar'
          })
        }
      } else {
        setStatus({
          connected: false,
          message: 'Erro ao verificar status'
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setStatus({
        connected: false,
        message: 'Erro ao verificar status'
      })
    } finally {
      setIsLoading(false)
    }
    
    // Atualizar estatísticas após refresh
    await fetchInstanceStats()
  }

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  // Verificar se o usuário pode criar instância
  const canCreateInstance = (): boolean => {
    // Admin sempre pode
    if (userRole === 'admin') return true
    
    // Verificar se tem assinatura ativa
    return userSubscription.status === 'active'
  }

  // Verificar se a assinatura está próxima do vencimento
  const isSubscriptionExpiringSoon = (): boolean => {
    if (!userSubscription.endDate) return false
    
    const endDate = new Date(userSubscription.endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  // Lidar com upgrade de assinatura
  const handleSubscriptionUpgrade = async (planId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      // Simular processo de pagamento (aqui você integraria com gateway de pagamento)
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          plan: planId
        })
      })

      if (response.ok) {
        // Atualizar dados de assinatura
        await fetchUserSubscription()
        setShowSubscriptionModal(false)
        
        // Mostrar mensagem de sucesso
        alert('Assinatura ativada com sucesso! Agora você pode criar instâncias do WhatsApp.')
      } else {
        alert('Erro ao processar assinatura. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error)
      alert('Erro ao processar assinatura. Tente novamente.')
    }
  }

  return (
    <div className="bot-instance-simple">
      {/* Header */}
      <div className="instance-header-simple">
        <div className="header-left">
          <Bot size={28} />
          <div>
            <h1>Instância Bot</h1>
            <span className={`status-badge ${status.connected ? 'active' : 'inactive'}`}>
              {status.connected ? 'Sistema Ativo' : 'Sistema Inativo'}
            </span>
          </div>
        </div>
        <button className="btn-logout-simple">
          Sair
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-simple">
        <div className="stat-card">
          <div className="stat-icon">
            {status.connected ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <h3>Status da Conexão</h3>
            <p>{status.message}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3>Mensagens Hoje</h3>
            <p>{messageCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div>
            <h3>Tempo Online</h3>
            <p>{formatUptime(uptime)}</p>
          </div>
        </div>
      </div>

      {/* Subscription Status Info */}
      <div className="instance-info-card">
        {userRole === 'admin' ? (
          <div className="info-card admin">
            <div className="info-icon">👑</div>
            <div className="info-content">
              <h3>Conta Administrador</h3>
              <p>Você pode criar <strong>instâncias ilimitadas</strong> do WhatsApp Bot.</p>
              <div className="instance-count">
                Instâncias ativas: <strong>{instanceStats.activeCount}</strong> | 
                Total: <strong>{instanceStats.totalCount}</strong>
              </div>
            </div>
          </div>
        ) : userSubscription.status === 'active' ? (
          <div className="info-card premium">
            <div className="info-icon">
              <Crown size={24} color="#f59e0b" />
            </div>
            <div className="info-content">
              <h3>Assinatura Ativa</h3>
              <p>Plano: <strong>{userSubscription.plan || 'Premium'}</strong></p>
              {userSubscription.endDate && (
                <div className="subscription-expiry">
                  Válida até: <strong>{new Date(userSubscription.endDate).toLocaleDateString('pt-BR')}</strong>
                  {isSubscriptionExpiringSoon() && (
                    <span className="expiry-warning"> ⚠️ Vence em breve!</span>
                  )}
                </div>
              )}
              <div className="instance-count">
                Instâncias ativas: <strong>{instanceStats.activeCount}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="info-card free">
            <div className="info-icon">
              <Lock size={24} color="#ef4444" />
            </div>
            <div className="info-content">
              <h3>Conta Gratuita</h3>
              <p>Para usar o WhatsApp Bot, você precisa de uma <strong>assinatura ativa</strong>.</p>
              <div className="subscription-benefits">
                ✅ Instâncias ilimitadas do WhatsApp<br/>
                ✅ Suporte técnico especializado<br/>
                ✅ Recursos premium exclusivos
              </div>
              <button 
                className="btn-upgrade-now"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <Crown size={16} />
                Assinar Agora
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instance List */}
      <div className="instance-list-simple">
        <h2>Instâncias Conectadas</h2>
        <div className="instances">
          <div className={`instance-item ${status.connected ? 'connected' : 'disconnected'}`}>
            <div className="instance-info">
              <div className="instance-status">
                <div className={`status-dot ${status.connected ? 'online' : 'offline'}`}></div>
                <span>Instância Principal</span>
              </div>
              <div className="instance-details">
                {status.connected ? (
                  <span className="online-text">✅ WhatsApp Conectado</span>
                ) : (
                  <span className="offline-text">❌ Desconectado</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-simple">
        <button 
          className={`btn-simple ${canCreateInstance() ? 'btn-primary' : 'btn-locked'}`}
          onClick={canCreateInstance() ? startInstance : () => setShowSubscriptionModal(true)}
          disabled={isLoading || (canCreateInstance() && status.connected)}
        >
          {!canCreateInstance() ? (
            <>
              <Lock size={16} />
              Precisa Assinar
            </>
          ) : (
            <>
              <Play size={16} />
              {isConnecting ? 'Aguarde...' : 'Iniciar Instância'}
            </>
          )}
        </button>
        <button 
          className="btn-simple btn-secondary" 
          onClick={stopInstance}
          disabled={isLoading || !status.connected}
        >
          <Square size={16} />
          Parar Instância
        </button>
        <button 
          className="btn-simple btn-info" 
          onClick={refreshStatus} 
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* QR Code Popup */}
      <QRCodePopup 
        qrCode={qrCode}
        isVisible={showQRPopup}
        onClose={clearQRStates}
        isLoading={isConnecting && !qrCode}
      />

      {/* Subscription Upgrade Modal */}
      <SubscriptionUpgrade 
        isVisible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgrade={handleSubscriptionUpgrade}
      />

      {/* Terms of Responsibility Modal */}
      <TermsOfResponsibility 
        isVisible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={proceedWithInstanceStart}
      />
    </div>
  )
}

export default BotInstance
