import { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
  Activity
} from 'lucide-react'
import '../styles/OperatorManagement.css'

interface Operator {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  is_active: boolean
  manager_id: number
  created_at: string
  updated_at: string
}

interface OperatorStats {
  total_operators: number
  active_operators: number
  inactive_operators: number
  operator_performance: Array<{
    id: number
    name: string
    total_chats: number
    active_chats: number
    finished_chats: number
  }>
}

function OperatorManagement() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [stats, setStats] = useState<OperatorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [showDropdown, setShowDropdown] = useState<number | null>(null)

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    avatar: '',
    is_active: true
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  // Carregar operadores
  const loadOperators = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('/api/operators', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOperators(data.operators)
        console.log(`✅ ${data.total} operadores carregados`)
      } else {
        console.error('❌ Erro ao carregar operadores:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar operadores:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('/api/operators/stats/overview', {
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
      console.error('❌ Erro ao carregar estatísticas:', error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadOperators()
    loadStats()
  }, [])

  // Filtrar operadores
  const filteredOperators = operators.filter(operator => {
    const matchesSearch = operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operator.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && operator.is_active) ||
                         (statusFilter === 'inactive' && !operator.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Abrir modal para novo operador
  const openNewOperatorModal = () => {
    setEditingOperator(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      avatar: '',
      is_active: true
    })
    setShowModal(true)
  }

  // Abrir modal para editar operador
  const openEditOperatorModal = (operator: Operator) => {
    setEditingOperator(operator)
    setFormData({
      name: operator.name,
      email: operator.email,
      password: '',
      phone: operator.phone || '',
      avatar: operator.avatar || '',
      is_active: operator.is_active
    })
    setShowModal(true)
  }

  // Salvar operador
  const saveOperator = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      const isEditing = !!editingOperator

      // Validações
      if (!formData.name || !formData.email) {
        alert('Nome e email são obrigatórios')
        return
      }

      if (!isEditing && !formData.password) {
        alert('Senha é obrigatória para novos operadores')
        return
      }

      const url = isEditing ? `/api/operators/${editingOperator.id}` : '/api/operators'
      const method = isEditing ? 'PUT' : 'POST'
      
      const payload = isEditing 
        ? { 
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone, 
            avatar: formData.avatar, 
            is_active: formData.is_active 
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Operador ${isEditing ? 'atualizado' : 'criado'} com sucesso:`, data.operator.name)
        
        setShowModal(false)
        loadOperators()
        loadStats()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao salvar operador')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar operador:', error)
      alert('Erro interno. Tente novamente.')
    }
  }

  // Excluir operador
  const deleteOperator = async (operator: Operator) => {
    if (!confirm(`Tem certeza que deseja excluir o operador "${operator.name}"?`)) {
      return
    }

    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/operators/${operator.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log(`✅ Operador excluído com sucesso: ${operator.name}`)
        loadOperators()
        loadStats()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao excluir operador')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir operador:', error)
      alert('Erro interno. Tente novamente.')
    }
  }

  // Alterar senha
  const changePassword = async () => {
    if (!editingOperator) return

    if (!passwordData.newPassword) {
      alert('Nova senha é obrigatória')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/operators/${editingOperator.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword })
      })

      if (response.ok) {
        console.log(`✅ Senha alterada com sucesso para: ${editingOperator.name}`)
        setShowPasswordModal(false)
        setPasswordData({ newPassword: '', confirmPassword: '' })
        alert('Senha alterada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error)
      alert('Erro interno. Tente novamente.')
    }
  }

  // Formatações
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const getOperatorPerformance = (operatorId: number) => {
    return stats?.operator_performance.find(perf => perf.id === operatorId)
  }

  return (
    <div className="operator-management">
      {/* Header com estatísticas */}
      <div className="page-header">
        <div className="header-title">
          <Users size={28} />
          <div>
            <h2>Gerenciar Operadores</h2>
            <p>Adicione e gerencie operadores da sua equipe</p>
          </div>
        </div>
        
        <button 
          className="btn-primary-compact"
          onClick={openNewOperatorModal}
        >
          <UserPlus size={16} />
          Novo Operador
        </button>
      </div>

      {/* Cards de estatísticas */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon total">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.total_operators}</h3>
              <p>Total de Operadores</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.active_operators}</h3>
              <p>Operadores Ativos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon inactive">
              <XCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.inactive_operators}</h3>
              <p>Operadores Inativos</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e busca */}
      <div className="content-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar operadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <Filter size={16} />
            Todos ({operators.length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            <CheckCircle size={16} />
            Ativos ({operators.filter(op => op.is_active).length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            <XCircle size={16} />
            Inativos ({operators.filter(op => !op.is_active).length})
          </button>
        </div>
      </div>

      {/* Lista de operadores */}
      <div className="operators-list">
        {loading ? (
          <div className="loading-state">
            <Activity size={48} />
            <p>Carregando operadores...</p>
          </div>
        ) : filteredOperators.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Nenhum operador encontrado</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Clique em "Novo Operador" para adicionar o primeiro operador'
              }
            </p>
          </div>
        ) : (
          <div className="operators-grid">
            {filteredOperators.map(operator => {
              const performance = getOperatorPerformance(operator.id)
              
              return (
                <div key={operator.id} className="operator-card">
                  <div className="operator-header">
                    <div className="operator-avatar">
                      {operator.avatar ? (
                        <img src={operator.avatar} alt={operator.name} />
                      ) : (
                        <Users size={20} />
                      )}
                    </div>
                    
                    <div className="operator-info">
                      <h4>{operator.name}</h4>
                      <p>{operator.email}</p>
                    </div>
                    
                    <div className="operator-actions">
                      <div className={`status-badge ${operator.is_active ? 'active' : 'inactive'}`}>
                        {operator.is_active ? (
                          <>
                            <CheckCircle size={14} />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Inativo
                          </>
                        )}
                      </div>
                      
                      <div className="dropdown-container">
                        <button
                          className="btn-dropdown"
                          onClick={() => setShowDropdown(showDropdown === operator.id ? null : operator.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {showDropdown === operator.id && (
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                openEditOperatorModal(operator)
                                setShowDropdown(null)
                              }}
                            >
                              <Edit3 size={14} />
                              Editar
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setEditingOperator(operator)
                                setShowPasswordModal(true)
                                setShowDropdown(null)
                              }}
                            >
                              <Key size={14} />
                              Alterar Senha
                            </button>
                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                deleteOperator(operator)
                                setShowDropdown(null)
                              }}
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="operator-details">
                    {operator.phone && (
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{operator.phone}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Criado em {formatDate(operator.created_at)}</span>
                    </div>
                  </div>
                  
                  {performance && (
                    <div className="operator-performance">
                      <h5>Desempenho</h5>
                      <div className="performance-stats">
                        <div className="perf-item">
                          <span className="perf-number">{performance.total_chats}</span>
                          <span className="perf-label">Total de Chats</span>
                        </div>
                        <div className="perf-item">
                          <span className="perf-number active">{performance.active_chats}</span>
                          <span className="perf-label">Ativos</span>
                        </div>
                        <div className="perf-item">
                          <span className="perf-number finished">{performance.finished_chats}</span>
                          <span className="perf-label">Finalizados</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Operador */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingOperator ? 'Editar Operador' : 'Novo Operador'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo do operador"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                {!editingOperator && (
                  <div className="form-group">
                    <label>Senha *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Avatar (URL)</label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span>Operador ativo</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={saveOperator}
              >
                {editingOperator ? 'Atualizar' : 'Criar'} Operador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alterar Senha */}
      {showPasswordModal && editingOperator && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Alterar Senha - {editingOperator.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nova Senha *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div className="form-group">
                <label>Confirmar Nova Senha *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={changePassword}
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperatorManagement
