import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { 
  MessageSquare, 

  WifiOff, 
  RefreshCw,
  Bot,
  Menu,
  Settings,
  BarChart3,
  Users,
  MessageCircle,
  Smartphone,
  UserCheck,
  Bell,
  User,
  Clock,
  Wifi,
  ChevronDown
} from 'lucide-react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import BotInstance from './components/BotInstance'
import HumanChat from './components/HumanChat'
import Messages from './components/Messages'
import Devices from './components/Devices'
import OperatorManagement from './components/OperatorManagement'
import './App.css'
import './styles/LandingPage.css'
import './styles/Auth.css'

type PageType = 'landing' | 'login' | 'register' | 'dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // Verificar se o usuário já estava logado com token válido
    const authToken = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    return (authToken && userData) ? 'dashboard' : 'landing'
  })
  const [socket, setSocket] = useState<any | null>(null)
  const [activeMenu, setActiveMenu] = useState(() => {
    // Definir menu inicial baseado no papel do usuário
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'operator') {
          return 'chat' // Operadores começam no Chat Humano
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
      }
    }
    return 'instance' // Padrão para managers/admins
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [notifications, setNotifications] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [instancesData, setInstancesData] = useState<any>(null)
  const [notificationsData, setNotificationsData] = useState<any>(null)

  // Hook para detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Função para toggle do menu móvel
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Função para fechar menu móvel
  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Função melhorada para toggle do sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      toggleMobileMenu()
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  useEffect(() => {
    // Verificar autenticação periodicamente
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (currentPage === 'dashboard' && (!authToken || !userData)) {
        // Se está no dashboard mas não tem token válido, redirecionar para login
        setCurrentPage('landing')
      }
    }
    
    // Verificar imediatamente
    checkAuth()
    
    // Conectar ao socket apenas se estiver autenticado
    const authToken = localStorage.getItem('authToken')
    if (authToken && currentPage === 'dashboard') {
      const newSocket = io('http://localhost:3000', {
        forceNew: true,
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        auth: {
          token: authToken
        }
      })
      
      setSocket(newSocket)
      
      return () => {
        newSocket.close()
      }
    }
  }, [currentPage])

  // Atualizar relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(timer)
  }, [])

  // Carregar dados reais das instâncias e notificações
  useEffect(() => {
    if (currentPage === 'dashboard') {
      // Carregar dados iniciais
      fetchInstancesStatus()
      fetchNotifications()

      // Atualizar periodicamente (a cada 30 segundos)
      const statusInterval = setInterval(() => {
        fetchInstancesStatus()
        fetchNotifications()
      }, 30000)

      return () => clearInterval(statusInterval)
    }
  }, [currentPage])

  // Monitorar WebSocket para atualizações em tempo real
  useEffect(() => {
    if (socket) {
      // Escutar eventos do socket para atualizações em tempo real
      socket.on('instance_status_changed', (data: any) => {
        console.log('Status da instância alterado:', data)
        fetchInstancesStatus()
      })

      socket.on('new_pending_chat', (data: any) => {
        console.log('Nova conversa pendente:', data)
        fetchNotifications()
      })

      socket.on('chat_status_changed', (data: any) => {
        console.log('Status do chat alterado:', data)
        fetchNotifications()
      })

      return () => {
        socket.off('instance_status_changed')
        socket.off('new_pending_chat')
        socket.off('chat_status_changed')
      }
    }
  }, [socket])

  // Fechar menu do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Função para verificar se o usuário é manager ou admin
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        return user.role
      }
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error)
    }
    return null
  }

  const isManagerOrAdmin = () => {
    const role = getUserRole()
    return role === 'manager' || role === 'admin'
  }

  // Função para obter dados do usuário
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        return JSON.parse(userData)
      }
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error)
    }
    return null
  }

  // Função para formatar a hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Função para obter saudação baseada na hora
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Função para buscar status real das instâncias
  const fetchInstancesStatus = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/whatsapp/instances/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInstancesData(data)
        setConnectionStatus(data.overallStatus)
      }
    } catch (error) {
      console.error('Erro ao buscar status das instâncias:', error)
      setConnectionStatus('disconnected')
    }
  }

  // Função para buscar notificações reais
  const fetchNotifications = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/whatsapp/chats/pending-count', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotificationsData(data)
        setNotifications(data.total)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      setNotifications(0)
    }
  }

  const allMenuItems = [
    { id: 'chat', label: 'Chat Humano', icon: MessageSquare, allowedRoles: ['admin', 'manager', 'operator'] },
    { id: 'instance', label: 'Instância Bot', icon: Bot, active: true, allowedRoles: ['admin', 'manager'] },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, allowedRoles: ['admin', 'manager'] },
    { id: 'contacts', label: 'Contatos', icon: Users, allowedRoles: ['admin', 'manager'] },
    { id: 'devices', label: 'Dispositivos', icon: Smartphone, allowedRoles: ['admin', 'manager'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, allowedRoles: ['admin', 'manager'] },
    { id: 'operators', label: 'Operadores', icon: UserCheck, allowedRoles: ['admin', 'manager'] },
    { id: 'settings', label: 'Configurações', icon: Settings, allowedRoles: ['admin', 'manager'] }
  ]

  // Filtrar menu baseado no papel do usuário
  const menuItems = allMenuItems.filter(item => {
    const userRole = getUserRole()
    return item.allowedRoles.includes(userRole)
  })

  const renderContent = () => {
    switch (activeMenu) {
      case 'instance':
        return <BotInstance socket={socket} setSocket={setSocket} />
      case 'messages':
        return <Messages socket={socket} />
      case 'chat':
        return <HumanChat socket={socket} />
      case 'operators':
        return isManagerOrAdmin() ? <OperatorManagement /> : (
          <div className="content-placeholder">
            <UserCheck size={64} className="placeholder-icon" />
            <h2>Acesso Negado</h2>
            <p>Apenas gestores podem gerenciar operadores</p>
          </div>
        )
      case 'devices':
        return <Devices />
      case 'analytics':
        return (
          <div className="content-placeholder">
            <BarChart3 size={64} className="placeholder-icon" />
            <h2>Analytics</h2>
            <p>Em breve: relatórios e estatísticas detalhadas</p>
          </div>
        )
      case 'contacts':
        return (
          <div className="content-placeholder">
            <Users size={64} className="placeholder-icon" />
            <h2>Contatos</h2>
            <p>Em breve: gerenciamento de contatos</p>
          </div>
        )
      case 'settings':
        return isManagerOrAdmin() ? (
          <div className="content-placeholder">
            <Settings size={64} className="placeholder-icon" />
            <h2>Configurações</h2>
            <p>Em breve: configurações do sistema</p>
          </div>
        ) : (
          <div className="content-placeholder">
            <Settings size={64} className="placeholder-icon" />
            <h2>Acesso Negado</h2>
            <p>Apenas gestores podem acessar configurações</p>
          </div>
        )
      default:
        return null
    }
  }

  // Handle navigation between pages
  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
    
    // Limpar tokens quando sair do dashboard
    if (page === 'landing') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userSession') // compatibilidade
    }
  }

  // Função para logout
  const handleLogout = () => {
    // Limpar todos os dados de autenticação
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userSession') // compatibilidade
    setCurrentPage('landing')
  }

  // Render current page
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />
  }

  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} />
  }

  if (currentPage === 'register') {
    return <Register onNavigate={handleNavigate} />
  }

  // Dashboard (existing app content)
  return (
    <div className="app">
      {/* Overlay para móvel */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        />
      )}

      {/* Toggle móvel */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <MessageSquare className="sidebar-logo-icon" />
            {(!sidebarCollapsed || isMobile) && <span className="sidebar-logo-text">WhatsApp Bot</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <Menu size={20} />
          </button>
      </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu(item.id)
                  if (isMobile) {
                    closeMobileMenu()
                  }
                }}
                title={sidebarCollapsed && !isMobile ? item.label : ''}
              >
                <Icon size={20} />
                {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
        </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' && <Wifi size={16} />}
            {connectionStatus === 'connecting' && <RefreshCw size={16} className="spinning" />}
            {connectionStatus === 'disconnected' && <WifiOff size={16} />}
            {(!sidebarCollapsed || isMobile) && (
              <span className="connection-text">
                {connectionStatus === 'connected' && 'Sistema Ativo'}
                {connectionStatus === 'connecting' && 'Conectando...'}
                {connectionStatus === 'disconnected' && 'Desconectado'}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-container">
        <header className="header-improved">
          <div className="header-left">
            <div className="page-info">
              <h1 className="page-title">{menuItems.find(item => item.id === activeMenu)?.label}</h1>
              <span className="page-subtitle">{getGreeting()}, {getUserData()?.name || 'Usuário'}</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="time-display">
              <Clock size={16} />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-controls">
              {/* Status da Conexão */}
              <div className={`connection-status-header ${connectionStatus}`}>
                {connectionStatus === 'connected' && <Wifi size={16} />}
                {connectionStatus === 'connecting' && <RefreshCw size={16} className="spinning" />}
                {connectionStatus === 'disconnected' && <WifiOff size={16} />}
                <span className="connection-text">
                  {connectionStatus === 'connected' && `${instancesData?.connectedInstances || 0}/${instancesData?.totalInstances || 0} Conectadas`}
                  {connectionStatus === 'connecting' && 'Conectando...'}
                  {connectionStatus === 'disconnected' && 'Desconectado'}
                </span>
              </div>
              
              {/* Notificações */}
              <div 
                className="notification-bell"
                title={notificationsData ? 
                  `Conversas pendentes: ${notificationsData.pending}\nSem operador: ${notificationsData.unassigned}\nMensagens não lidas: ${notificationsData.unreadMessages}` 
                  : 'Carregando notificações...'}
              >
                <Bell size={18} />
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </div>
              
              {/* Menu do Usuário */}
              <div className="user-menu-container">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    <User size={16} />
                  </div>
                  <div className="user-info">
                    <span className="user-name">{getUserData()?.name || 'Usuário'}</span>
                    <span className="user-role">{getUserRole()}</span>
                  </div>
                  <ChevronDown size={14} />
                </button>
                
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-avatar-large">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="user-name-large">{getUserData()?.name}</div>
                        <div className="user-email">{getUserData()?.email}</div>
                        <div className="user-role-badge">{getUserRole()}</div>
                      </div>
                    </div>
                    
                    <div className="user-menu-divider"></div>
                    
                    <div className="user-menu-actions">
                      <button className="user-menu-item" onClick={() => setActiveMenu('settings')}>
                        <Settings size={16} />
                        Configurações
                      </button>
                      <button 
                        className="user-menu-item logout"
                        onClick={handleLogout}
                      >
                        <RefreshCw size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
