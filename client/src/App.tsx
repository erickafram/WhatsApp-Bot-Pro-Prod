import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { 
  MessageSquare, 
  Bot,
  Menu,
  Settings,
  BarChart3,
  Users,
  MessageCircle,
  Bookmark,
  UserCheck,
  User,
  ChevronUp,
  Edit,
  LogOut,
  X
} from 'lucide-react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import BotInstance from './components/BotInstance'
import HumanChat from './components/HumanChat'
import Messages from './components/Messages'
import Contacts from './components/Contacts'

import OperatorManagement from './components/OperatorManagement'
import OperatorDashboard from './components/OperatorDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import SavedDocumentsSimple from './components/SavedDocumentsSimple'
import './App.css'
import './styles/LandingPage.css'
import './styles/Auth.css'
import './styles/Contacts.css'
import './styles/no-spinner.css'

type PageType = 'landing' | 'login' | 'register' | 'dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Função global para lidar com logout automático
  const handleGlobalLogout = () => {
    console.log('🚪 Fazendo logout automático devido a token expirado')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setAuthToken(null)
    setCurrentPage('landing')
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
  }

  // Interceptador global para requisições fetch
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      // Se receber 401 e estiver no dashboard, fazer logout automático
      if (response.status === 401 && currentPage === 'dashboard') {
        console.error('❌ Token expirado detectado globalmente - fazendo logout')
        handleGlobalLogout()
      }

      return response
    }

    // Cleanup: restaurar fetch original
    return () => {
      window.fetch = originalFetch
    }
  }, [currentPage])

  // Verificar token válido no início da aplicação
  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')

      if (authToken && userData) {
        try {
          // Fazer uma requisição simples para verificar se o token ainda é válido
          const response = await fetch('/api/messages/projects', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            // Token válido, ir para dashboard
            setCurrentPage('dashboard')
          } else if (response.status === 401) {
            // Token inválido, limpar e ir para landing
            console.log('🚪 Token inválido detectado no início - limpando sessão')
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            setCurrentPage('landing')
          }
        } catch (error) {
          console.error('❌ Erro ao verificar token:', error)
          setCurrentPage('landing')
        }
      } else {
        setCurrentPage('landing')
      }

      setIsCheckingAuth(false)
    }

    checkAuthToken()
  }, [])

  const [socket, setSocket] = useState<any | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken')
  })
  const [activeMenu, setActiveMenu] = useState(() => {
    // Definir menu inicial baseado no papel do usuário
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'operator') {
          return 'dashboard' // Operadores começam no Dashboard
        } else if (user.role === 'manager' || user.role === 'admin') {
          return 'manager-dashboard' // Gestores começam no Dashboard do Gestor
        }
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
      }
    }
    return 'instance' // Fallback
  })
  const sidebarCollapsed = true // Sempre recolhido
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [humanChatUnreadCount, setHumanChatUnreadCount] = useState(0)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })




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
    
    // Quando entrar na dashboard, definir o menu correto baseado no papel do usuário
    if (currentPage === 'dashboard') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          if (user.role === 'operator') {
            setActiveMenu('dashboard') // Operadores vão para Dashboard do Operador
          } else if (user.role === 'manager' || user.role === 'admin') {
            setActiveMenu('manager-dashboard') // Gestores vão para Dashboard do Gestor
          }
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error)
        }
      }
    }
    
    // Conectar ao socket apenas se estiver autenticado
    console.log('🔍 Debug - authToken do state:', authToken ? authToken.substring(0, 20) + '...' : 'null');
    console.log('🔍 Debug - currentPage:', currentPage);
    console.log('🔍 Debug - Condição para conectar socket:', authToken && currentPage === 'dashboard');
    
    if (authToken && currentPage === 'dashboard') {
      console.log('🔍 Conectando socket com token:', authToken ? 'Token presente' : 'Sem token');
      const newSocket = io(window.location.origin, {
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
      
      // Log de eventos de conexão
      newSocket.on('connect', () => {
        console.log('✅ Socket conectado:', newSocket.id);
      });
      
      newSocket.on('connect_error', (error: any) => {
        console.error('❌ Erro de conexão do socket:', error);
      });
      
      newSocket.on('disconnect', (reason: any) => {
        console.log('❌ Socket desconectado:', reason);
      });
      
      // Listen for authentication errors
      newSocket.on('operator_message_error', (data: any) => {
        console.error('❌ Erro de autenticação no socket:', data);
        if (data.error && data.error.includes('não autenticado')) {
          console.log('🔄 Token pode ter expirado, tentando renovar...');
          handleGlobalLogout();
        }
      });
      
      setSocket(newSocket)
      
      return () => {
        newSocket.close()
      }
    } else if (socket && (!authToken || currentPage !== 'dashboard')) {
      // Desconectar se não há token ou não está no dashboard
      console.log('🔄 Desconectando socket (sem token ou fora do dashboard)');
      socket.close();
      setSocket(null);
    }
  }, [currentPage, authToken])







  // Carregar dados do usuário quando o modal for aberto
  useEffect(() => {
    if (showProfileModal) {
      const userData = getUserData()
      if (userData) {
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    }
  }, [showProfileModal])

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-footer')) {
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



  const allMenuItems = [
    // Ordem para operador (Dashboard primeiro, Chat segundo, depois resto)
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, allowedRoles: ['operator'] },
    { id: 'chat', label: 'Chat Humano', icon: MessageSquare, allowedRoles: ['admin', 'manager', 'operator'] },
    { id: 'documents', label: 'Documentos Salvos', icon: Bookmark, allowedRoles: ['admin', 'manager', 'operator'] },

    // Ordem para manager/admin
    { id: 'manager-dashboard', label: 'Dashboard', icon: BarChart3, allowedRoles: ['admin', 'manager'] },
    { id: 'instance', label: 'Instância Bot', icon: Bot, active: true, allowedRoles: ['admin', 'manager'] },
    { id: 'messages', label: 'Templates', icon: MessageCircle, allowedRoles: ['admin', 'manager'] },
    { id: 'contacts', label: 'Contatos', icon: Users, allowedRoles: ['admin', 'manager'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, allowedRoles: ['admin', 'manager'] },
    { id: 'operators', label: 'Operadores', icon: UserCheck, allowedRoles: ['admin', 'manager'] }
  ]

  // Filtrar menu baseado no papel do usuário
  const menuItems = allMenuItems.filter(item => {
    const userRole = getUserRole()
    return item.allowedRoles.includes(userRole)
  })

  const renderContent = () => {
    switch (activeMenu) {
      case 'manager-dashboard':
        return <ManagerDashboard 
          socket={socket} 
          onNavigate={(page, chatId) => {
            setActiveMenu(page)
            // If navigating to chat with specific chatId, we could store it for later use
            if (chatId) {
              sessionStorage.setItem('selectedChatId', chatId.toString())
            }
          }} 
        />
      case 'dashboard':
        return <OperatorDashboard 
          socket={socket} 
          onNavigate={(page, chatId) => {
            setActiveMenu(page)
            // If navigating to chat with specific chatId, we could store it for later use
            if (chatId) {
              sessionStorage.setItem('selectedChatId', chatId.toString())
            }
          }} 
        />
      case 'instance':
        return <BotInstance socket={socket} setSocket={setSocket} />
      case 'messages':
        return <Messages socket={socket} />
      case 'chat':
        return <HumanChat socket={socket} onUnreadCountChange={setHumanChatUnreadCount} />
      case 'operators':
        return isManagerOrAdmin() ? <OperatorManagement /> : (
          <div className="content-placeholder">
            <UserCheck size={64} className="placeholder-icon" />
            <h2>Acesso Negado</h2>
            <p>Apenas gestores podem gerenciar operadores</p>
          </div>
        )

      case 'analytics':
        return (
          <div className="content-placeholder">
            <BarChart3 size={64} className="placeholder-icon" />
            <h2>Analytics</h2>
            <p>Em breve: relatórios e estatísticas detalhadas</p>
          </div>
        )
      case 'contacts':
        return isManagerOrAdmin() ? <Contacts /> : (
          <div className="content-placeholder">
            <Users size={64} className="placeholder-icon" />
            <h2>Acesso Negado</h2>
            <p>Apenas gestores podem gerenciar contatos</p>
          </div>
        )
      case 'documents':
        return <SavedDocumentsSimple />
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
    
    // Sincronizar token state quando navegar para dashboard
    if (page === 'dashboard') {
      const token = localStorage.getItem('authToken')
      setAuthToken(token)
    }
    
    // Limpar tokens quando sair do dashboard
    if (page === 'landing') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userSession') // compatibilidade
      setAuthToken(null)
    }
  }

  // Função para logout
  const handleLogout = async () => {
    try {
      const authToken = localStorage.getItem('authToken')

      if (authToken) {
        // Fazer logout no servidor para desativar a sessão
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error)
    } finally {
      // Limpar todos os dados de autenticação localmente
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userSession') // compatibilidade
      setCurrentPage('landing')
    }
  }

  // Função para atualizar perfil do usuário
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    try {
      const authToken = localStorage.getItem('authToken')
      const updateData: any = {
        name: profileForm.name,
        email: profileForm.email
      }

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword
        updateData.newPassword = profileForm.newPassword
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem('user', JSON.stringify(updatedUser))
        alert('Perfil atualizado com sucesso!')
        setShowProfileModal(false)
        setProfileForm({
          name: '',
          email: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil')
    }
  }

  // Render current page
  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    )
  }

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
{!sidebarCollapsed && !isMobile && <span className="sidebar-logo-text">WhatsApp Bot</span>}
          </div>
      </div>

        <nav className="sidebar-nav">
          {/* Menu items principais */}
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
                <div className="sidebar-nav-icon-container">
                  <Icon size={20} />
                  {item.id === 'chat' && humanChatUnreadCount > 0 && (
                    <span className="sidebar-notification-badge">{humanChatUnreadCount}</span>
                  )}
                </div>
{!sidebarCollapsed && !isMobile && <span>{item.label}</span>}
              </button>
            )
          })}

          {/* Divisor */}
          <div className="sidebar-divider"></div>

          {/* Configurações */}
          <button
            className={`sidebar-nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('settings')
              if (isMobile) {
                closeMobileMenu()
              }
            }}
            title={sidebarCollapsed && !isMobile ? 'Configurações' : ''}
          >
            <Settings size={20} />
{!sidebarCollapsed && !isMobile && <span>Configurações</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* Menu do usuário */}
          <div className="user-menu-footer">
            <button 
              className="user-menu-trigger-footer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-footer">
                <User size={16} />
              </div>
{!sidebarCollapsed && !isMobile && (
                <div className="user-info-footer">
                  <span className="user-name-footer">{getUserData()?.name || 'Usuário'}</span>
                  <span className="user-role-footer">{getUserRole()}</span>
                </div>
              )}
              {!sidebarCollapsed && !isMobile && (
                <ChevronUp size={16} className={`chevron ${showUserMenu ? 'open' : ''}`} />
              )}
            </button>

            {showUserMenu && (
              <div className="user-dropdown-footer">
                <button 
                  className="user-dropdown-item"
                  onClick={() => {
                    setShowProfileModal(true)
                    setShowUserMenu(false)
                  }}
                >
                  <Edit size={16} />
                  {(!sidebarCollapsed || isMobile) && <span>Editar Perfil</span>}
                </button>
                <button 
                  className="user-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  {(!sidebarCollapsed || isMobile) && <span>Sair</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-container">


        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* Modal de Edição de Perfil */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Perfil</h2>
              <button 
                className="modal-close"
                onClick={() => setShowProfileModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-divider">
                <span>Alterar Senha (opcional)</span>
              </div>

              <div className="form-group">
                <label htmlFor="currentPassword">Senha Atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                  placeholder="Confirme a nova senha"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
