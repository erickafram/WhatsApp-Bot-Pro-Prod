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
  Smartphone
} from 'lucide-react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import BotInstance from './components/BotInstance'
import HumanChat from './components/HumanChat'
import Messages from './components/Messages'
import './App.css'
import './styles/LandingPage.css'
import './styles/Auth.css'

type PageType = 'landing' | 'login' | 'register' | 'dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // Verificar se o usuário já estava logado
    const savedSession = localStorage.getItem('userSession')
    return savedSession ? 'dashboard' : 'landing'
  })
  const [socket, setSocket] = useState<any | null>(null)
  const [activeMenu, setActiveMenu] = useState('instance')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

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
    // Conectar ao socket
    const newSocket = io()
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const menuItems = [
    { id: 'instance', label: 'Instância Bot', icon: Bot, active: true },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'chat', label: 'Chat Humano', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'devices', label: 'Dispositivos', icon: Smartphone },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'instance':
        return <BotInstance socket={socket} setSocket={setSocket} />
      case 'messages':
        return <Messages socket={socket} />
      case 'chat':
        return <HumanChat socket={socket} />
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
      case 'devices':
        return (
          <div className="content-placeholder">
            <Smartphone size={64} className="placeholder-icon" />
            <h2>Dispositivos</h2>
            <p>Em breve: gerenciamento de dispositivos conectados</p>
          </div>
        )
      case 'settings':
        return (
          <div className="content-placeholder">
            <Settings size={64} className="placeholder-icon" />
            <h2>Configurações</h2>
            <p>Em breve: configurações do sistema</p>
          </div>
        )
      default:
        return null
    }
  }

  // Handle navigation between pages
  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
    
    // Salvar sessão quando entrar no dashboard
    if (page === 'dashboard') {
      localStorage.setItem('userSession', 'active')
    }
    
    // Limpar sessão quando sair do dashboard
    if (page === 'landing') {
      localStorage.removeItem('userSession')
    }
  }

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem('userSession')
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
          <div className="connection-status disconnected">
            <WifiOff size={16} />
            {(!sidebarCollapsed || isMobile) && (
              <span className="connection-text">
                Sistema
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-container">
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <h1>{menuItems.find(item => item.id === activeMenu)?.label}</h1>
            </div>
            <div className="header-actions">
              <div className="status-indicator disconnected">
                <WifiOff size={20} />
                <span className="status-text">Sistema Ativo</span>
              </div>
              <button 
                className="btn-logout"
                onClick={handleLogout}
                title="Voltar ao início"
              >
                <RefreshCw size={16} />
                Sair
              </button>
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
