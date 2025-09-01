import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  MessageSquare, 
  Phone, 
  Calendar, 
  User, 
  Activity,
  Filter,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import '../styles/Contacts.css'

interface Contact {
  id: number
  phone_number: string
  name: string
  avatar?: string
  tags?: string[]
  notes?: string
  is_blocked: boolean
  created_at: string
  updated_at: string
  statistics: {
    total_messages: number
    messages_sent: number
    messages_received: number
    last_message: {
      content?: string
      date?: string
      type?: string
    }
    chats: {
      total: number
      active: number
      last_status?: string
    }
  }
}

interface ContactsSummary {
  total_contacts: number
  active_chats: number
  total_messages: number
  recent_activity_24h: number
  timestamp: string
}

interface ContactsResponse {
  success: boolean
  data: {
    contacts: Contact[]
    summary: ContactsSummary
  }
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [summary, setSummary] = useState<ContactsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'recent'>('all')

  // Obter dados do usuário
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

  // Carregar contatos
  const loadContacts = async () => {
    try {
      setLoading(true)
      const userData = getUserData()
      const authToken = localStorage.getItem('authToken')

      if (!userData || !authToken) {
        console.error('Dados de autenticação não encontrados')
        return
      }

      console.log('🔍 Carregando contatos para o usuário:', userData.id)

      const response = await fetch(`/api/messages/contacts/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Resposta da API de contatos:', response.status, response.statusText)

      if (response.ok) {
        const data: ContactsResponse = await response.json()
        console.log('✅ Dados de contatos recebidos:', data)
        setContacts(data.data.contacts)
        setSummary(data.data.summary)
      } else {
        const errorText = await response.text()
        console.error('❌ Erro ao carregar contatos:', response.statusText, errorText)
        
        // Se não há contatos, ainda mostrar a interface
        if (response.status === 404 || response.status === 403) {
          setContacts([])
          setSummary({
            total_contacts: 0,
            active_chats: 0,
            total_messages: 0,
            recent_activity_24h: 0,
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contatos:', error)
      // Definir valores padrão em caso de erro
      setContacts([])
      setSummary({
        total_contacts: 0,
        active_chats: 0,
        total_messages: 0,
        recent_activity_24h: 0,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar contatos ao montar o componente
  useEffect(() => {
    loadContacts()
  }, [])

  // Filtrar contatos baseado na busca e filtro ativo
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm)

    switch (filterActive) {
      case 'active':
        return matchesSearch && contact.statistics.chats.active > 0
      case 'recent':
        return matchesSearch && contact.statistics.last_message.date && 
               new Date(contact.statistics.last_message.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      default:
        return matchesSearch
    }
  })

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  // Obter status do contato
  const getContactStatus = (contact: Contact) => {
    if (contact.statistics.chats.active > 0) return 'Ativo'
    if (contact.statistics.last_message.date) {
      const lastMessageDate = new Date(contact.statistics.last_message.date)
      const daysSinceLastMessage = Math.ceil((Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastMessage <= 1) return 'Recente'
      if (daysSinceLastMessage <= 7) return 'Inativo'
    }
    return 'Sem atividade'
  }

  // Ver detalhes do contato
  const viewContactDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setShowContactDetails(true)
  }

  if (loading) {
    return (
      <div className="contacts-container">
        <div className="contacts-loading">
          <RefreshCw className="loading-spinner" size={32} />
          <p>Carregando contatos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="contacts-header">
        <div className="contacts-title">
          <Users size={24} />
          <h1>Gerenciamento de Contatos</h1>
        </div>
        <button 
          className="refresh-button"
          onClick={loadContacts}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {summary && (
        <div className="contacts-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <h3>{summary.total_contacts}</h3>
              <p>Total de Contatos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={20} />
            </div>
            <div className="stat-content">
              <h3>{summary.active_chats}</h3>
              <p>Conversas Ativas</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <MessageCircle size={20} />
            </div>
            <div className="stat-content">
              <h3>{summary.total_messages}</h3>
              <p>Total de Mensagens</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <h3>{summary.recent_activity_24h}</h3>
              <p>Atividade 24h</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="contacts-controls">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            <Filter size={16} />
            Todos
          </button>
          <button 
            className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            <Activity size={16} />
            Ativos
          </button>
          <button 
            className={`filter-btn ${filterActive === 'recent' ? 'active' : ''}`}
            onClick={() => setFilterActive('recent')}
          >
            <Clock size={16} />
            Recentes
          </button>
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Nenhum contato encontrado</h3>
            <p>
              {searchTerm 
                ? 'Tente ajustar os termos de busca ou filtros.' 
                : 'Ainda não há contatos que interagiram com o bot.'}
            </p>
          </div>
        ) : (
          <div className="contacts-grid">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <div className="contact-avatar">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} />
                  ) : (
                    <User size={24} />
                  )}
                  <div className={`contact-status ${getContactStatus(contact).toLowerCase().replace(' ', '-')}`}></div>
                </div>
                
                <div className="contact-info">
                  <h3>{contact.name}</h3>
                  <p className="contact-phone">
                    <Phone size={14} />
                    {contact.phone_number}
                  </p>
                  <p className="contact-status-text">{getContactStatus(contact)}</p>
                </div>
                
                <div className="contact-stats">
                  <div className="contact-stat">
                    <MessageSquare size={12} />
                    <span>{contact.statistics.total_messages}</span>
                  </div>
                  <div className="contact-stat">
                    <Activity size={12} />
                    <span>{contact.statistics.chats.total}</span>
                  </div>
                </div>
                
                <div className="contact-last-activity">
                  <Calendar size={12} />
                  <span>{formatDate(contact.statistics.last_message.date)}</span>
                </div>
                
                <div className="contact-actions">
                  <button 
                    className="action-btn"
                    onClick={() => viewContactDetails(contact)}
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    title="Mais opções"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Contato */}
      {showContactDetails && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowContactDetails(false)}>
          <div className="modal-content contact-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Contato</h2>
              <button 
                className="modal-close"
                onClick={() => setShowContactDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="contact-details">
              <div className="contact-profile">
                <div className="contact-avatar-large">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <div className="contact-profile-info">
                  <h3>{selectedContact.name}</h3>
                  <p>{selectedContact.phone_number}</p>
                  <span className={`status-badge ${getContactStatus(selectedContact).toLowerCase().replace(' ', '-')}`}>
                    {getContactStatus(selectedContact)}
                  </span>
                </div>
              </div>
              
              <div className="contact-metrics">
                <div className="metric">
                  <h4>Mensagens Totais</h4>
                  <p>{selectedContact.statistics.total_messages}</p>
                </div>
                <div className="metric">
                  <h4>Mensagens Enviadas</h4>
                  <p>{selectedContact.statistics.messages_sent}</p>
                </div>
                <div className="metric">
                  <h4>Mensagens Recebidas</h4>
                  <p>{selectedContact.statistics.messages_received}</p>
                </div>
                <div className="metric">
                  <h4>Conversas Totais</h4>
                  <p>{selectedContact.statistics.chats.total}</p>
                </div>
                <div className="metric">
                  <h4>Conversas Ativas</h4>
                  <p>{selectedContact.statistics.chats.active}</p>
                </div>
                <div className="metric">
                  <h4>Primeiro Contato</h4>
                  <p>{formatDate(selectedContact.created_at)}</p>
                </div>
              </div>
              
              {selectedContact.statistics.last_message.content && (
                <div className="last-message">
                  <h4>Última Mensagem</h4>
                  <div className="message-preview">
                    <p>{selectedContact.statistics.last_message.content}</p>
                    <span>{formatDate(selectedContact.statistics.last_message.date)}</span>
                  </div>
                </div>
              )}
              
              {selectedContact.notes && (
                <div className="contact-notes">
                  <h4>Observações</h4>
                  <p>{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
