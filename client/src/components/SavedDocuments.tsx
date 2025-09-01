import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  Star,
  Calendar,
  Tag,
  User,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen
} from 'lucide-react'
import '../styles/SavedDocuments.css'

interface SavedDocument {
  id: number
  manager_id: number
  message_id: number
  contact_id: number
  chat_id?: number
  operator_id: number
  document_name: string
  document_url: string
  original_message_content?: string
  description: string
  category: 'pagamento' | 'documento_pessoal' | 'comprovante' | 'contrato' | 'outros'
  file_size?: number
  mime_type?: string
  tags: string[]
  is_important: boolean
  created_at: string
  updated_at: string
  contact_name?: string
  phone_number?: string
  operator_name?: string
}

interface GroupedDocuments {
  [key: string]: SavedDocument[]
}

interface UsageStats {
  currentMonth: number
  limit: number
  percentage: number
  remainingDays: number
  canSave: boolean
  isAdmin: boolean
  warning?: string
}

function SavedDocuments() {
  // Estados básicos
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [operatorFilter, setOperatorFilter] = useState('all')
  const [importantFilter, setImportantFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Estados de dados
  const [operators, setOperators] = useState<Array<{id: number, name: string}>>([])
  const [groupBy, setGroupBy] = useState<'category' | 'operator' | 'date'>('category')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Carregar documentos salvos
  const loadDocuments = async (resetPagination = false) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const currentPage = resetPagination ? 1 : page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(operatorFilter !== 'all' && { operator_id: operatorFilter }),
        ...(importantFilter === 'true' && { is_important: 'true' }),
        ...(importantFilter === 'false' && { is_important: 'false' }),
        ...(dateFilter !== 'all' && getDateFilterParams(dateFilter))
      })

      const response = await fetch(`/api/documents/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        console.log('📄 Documentos carregados do servidor:', data.data)
        
        // Verificar e corrigir documentos com tags inválidas
        const processedDocuments = data.data ? data.data.map((doc: any) => {
          if (!doc.tags || !Array.isArray(doc.tags)) {
            console.warn('⚠️ Documento com tags inválidas:', doc.id, doc.tags)
            doc.tags = []
          }
          return doc
        }) : []
        
        if (resetPagination) {
          setDocuments(processedDocuments)
          setPage(1)
        } else {
          setDocuments(prev => [...prev, ...processedDocuments])
        }
        
        setHasMore(data.pagination.hasMore)
        
        if (resetPagination) {
          setPage(2)
        } else {
          setPage(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar operadores
  const loadOperators = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (!authToken || !userData) return

      const user = JSON.parse(userData)
      
      // Apenas gestores e administradores podem carregar a lista de operadores
      if (!['manager', 'admin'].includes(user.role)) {
        console.log('👤 Usuário operador - não carregando lista de operadores')
        return
      }

      const response = await fetch('/api/operators', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOperators(data.operators.filter((op: any) => op.is_active))
      } else {
        console.error('❌ Erro ao carregar operadores:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar operadores:', error)
    }
  }

  // Carregar estatísticas de uso mensal
  const loadUsageStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/documents/usage/monthly', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsageStats(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de uso:', error)
    }
  }

  // Função para obter parâmetros de filtro de data
  const getDateFilterParams = (filter: string) => {
    const today = new Date()
    const params: any = {}

    switch (filter) {
      case 'today':
        params.date_from = today.toISOString().split('T')[0]
        params.date_to = today.toISOString().split('T')[0]
        break
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        params.date_from = weekAgo.toISOString().split('T')[0]
        break
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        params.date_from = monthAgo.toISOString().split('T')[0]
        break
    }

    return params
  }

  // Aplicar filtros
  const applyFilters = () => {
    setPage(1)
    setDocuments([])
    loadDocuments(true)
  }

  // Carregar mais documentos
  const loadMore = () => {
    if (!loading && hasMore) {
      loadDocuments()
    }
  }

  // Agrupar documentos
  const groupDocuments = (): GroupedDocuments => {
    const grouped: GroupedDocuments = {}

    // Verificar se documents está inicializado e é um array
    if (!documents || !Array.isArray(documents)) {
      return grouped
    }

    documents.forEach(doc => {
      if (!doc) return // Verificar se o documento existe
      
      let key = ''
      
      switch (groupBy) {
        case 'category':
          key = getCategoryName(doc.category)
          break
        case 'operator':
          key = doc.operator_name || 'Operador Desconhecido'
          break
        case 'date':
          const date = new Date(doc.created_at)
          key = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          break
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(doc)
    })

    // Ordenar documentos dentro de cada grupo
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })

    return grouped
  }

  // Toggle grupo expandido
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // Expandir todos os grupos
  const expandAllGroups = () => {
    const allKeys = Object.keys(groupDocuments())
    setExpandedGroups(new Set(allKeys))
  }

  // Recolher todos os grupos
  const collapseAllGroups = () => {
    setExpandedGroups(new Set())
  }

  // Agrupar documentos de forma segura
  const groupedData = React.useMemo(() => {
    return groupDocuments()
  }, [documents, groupBy])
  
  // Calcular estado dos grupos de forma segura
  const groupState = React.useMemo(() => {
    const groupKeys = Object.keys(groupedData)
    return {
      groupKeys,
      allGroupsExpanded: groupKeys.length > 0 && groupKeys.every(key => expandedGroups.has(key)),
      allGroupsCollapsed: expandedGroups.size === 0
    }
  }, [groupedData, expandedGroups])

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função para obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pagamento': return '💳'
      case 'documento_pessoal': return '👤'
      case 'comprovante': return '📄'
      case 'contrato': return '📋'
      default: return '📂'
    }
  }

  // Função para obter nome da categoria
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'pagamento': return 'Pagamento'
      case 'documento_pessoal': return 'Documento Pessoal'
      case 'comprovante': return 'Comprovante'
      case 'contrato': return 'Contrato'
      default: return 'Outros'
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadDocuments(true)
        await loadOperators()
        await loadUsageStats()
      } catch (error) {
        console.error('❌ Erro ao inicializar dados dos documentos salvos:', error)
      }
    }
    
    initializeData()
  }, [])

  useEffect(() => {
    if (documents && Array.isArray(documents) && documents.length > 0) {
      // Expandir primeiro grupo por padrão
      const grouped = groupDocuments()
      const firstGroupKey = Object.keys(grouped)[0]
      if (firstGroupKey && expandedGroups.size === 0) {
        setExpandedGroups(new Set([firstGroupKey]))
      }
    }
  }, [documents, groupBy])

  // groupedDocs removido - usando groupedData do useMemo

  return (
    <div className="saved-documents-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <div className="page-icon">
              <Bookmark size={32} />
            </div>
            <div>
              <h1>Documentos Catalogados</h1>
              <p>Gerencie todos os documentos salvos pelo seu time</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-number">{documents.length}</span>
              <span className="stat-label">documentos</span>
            </div>
            <div className="stat-pill important">
              <span className="stat-number">{documents.filter(d => d.is_important).length}</span>
              <span className="stat-label">importantes</span>
            </div>
            {usageStats && (
              <div className={`stat-pill monthly ${usageStats.percentage >= 80 ? 'warning' : ''}`}>
                <span className="stat-number">{usageStats.currentMonth}</span>
                <span className="stat-label">este mês</span>
                {!usageStats.isAdmin && (
                  <div className="usage-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${Math.min(usageStats.percentage, 100)}%`,
                        backgroundColor: usageStats.percentage >= 90 ? '#ef4444' : 
                                       usageStats.percentage >= 80 ? '#f59e0b' : '#22c55e'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de Limite */}
      {usageStats && !usageStats.isAdmin && usageStats.percentage >= 80 && (
        <div className={`usage-warning ${usageStats.percentage >= 100 ? 'limit-reached' : 'approaching-limit'}`}>
          <div className="warning-content">
            <div className="warning-icon">
              {usageStats.percentage >= 100 ? '🚫' : '⚠️'}
            </div>
            <div className="warning-text">
              {usageStats.percentage >= 100 ? (
                <>
                  <strong>Limite mensal atingido!</strong>
                  <p>Você utilizou {usageStats.currentMonth} de {usageStats.limit} documentos permitidos este mês.</p>
                </>
              ) : (
                <>
                  <strong>Limite próximo!</strong>
                  <p>Você utilizou {usageStats.currentMonth} de {usageStats.limit} documentos ({usageStats.percentage}%) este mês.</p>
                </>
              )}
            </div>
            <button 
              className="upgrade-btn"
              onClick={() => setShowUpgradeModal(true)}
            >
              Obter Plano Superior
            </button>
          </div>
          <div className="warning-progress">
            <div 
              className="warning-progress-bar"
              style={{ 
                width: `${Math.min(usageStats.percentage, 100)}%`,
                backgroundColor: usageStats.percentage >= 100 ? '#ef4444' : '#f59e0b'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="filters-container">
        <div className="search-section">
          <div className="search-input-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          
          <div className="view-controls">
            <label className="view-label">Agrupar por:</label>
            <select 
              className="group-select"
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value as any)}
            >
              <option value="category">Categoria</option>
              <option value="operator">Operador</option>
              <option value="date">Data</option>
            </select>
          </div>

          <div 
            className="expand-controls"
            data-all-expanded={groupState.allGroupsExpanded}
            data-all-collapsed={groupState.allGroupsCollapsed}
            data-groups-count={groupState.groupKeys.length}
          >
            <button 
              className="expand-btn expand-all"
              onClick={expandAllGroups}
              title="Expandir todos os grupos"
              disabled={groupState.allGroupsExpanded}
            >
              <ChevronDown size={18} />
            </button>
            <button 
              className="expand-btn collapse-all"
              onClick={collapseAllGroups}
              title="Recolher todos os grupos"
              disabled={groupState.allGroupsCollapsed}
            >
              <ChevronUp size={18} />
            </button>
          </div>

          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtros
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Categoria:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Todas</option>
                <option value="pagamento">💳 Pagamento</option>
                <option value="documento_pessoal">👤 Documento Pessoal</option>
                <option value="comprovante">📄 Comprovante</option>
                <option value="contrato">📋 Contrato</option>
                <option value="outros">📂 Outros</option>
              </select>
            </div>

            {(() => {
              const userData = localStorage.getItem('user')
              const userRole = userData ? JSON.parse(userData).role : 'operator'
              
              // Só mostrar filtro de operador para gestores e administradores
              return ['manager', 'admin'].includes(userRole) && (
                <div className="filter-group">
                  <label>Operador:</label>
                  <select value={operatorFilter} onChange={(e) => setOperatorFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    {operators && Array.isArray(operators) && operators.map(op => (
                      <option key={op.id} value={op.id.toString()}>{op.name}</option>
                    ))}
                  </select>
                </div>
              )
            })()}

            <div className="filter-group">
              <label>Importância:</label>
              <select value={importantFilter} onChange={(e) => setImportantFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="true">⭐ Importantes</option>
                <option value="false">Normais</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Período:</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">Todo período</option>
                <option value="today">Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Últimos 30 dias</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="apply-filters-btn" onClick={applyFilters}>
                Aplicar Filtros
              </button>
              <button 
                className="clear-filters-btn" 
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setOperatorFilter('all')
                  setImportantFilter('all')
                  setDateFilter('all')
                  applyFilters()
                }}
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Documentos Agrupados */}
      <div className="documents-list">
        {loading && documents.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={48} />
            <h3>Nenhum documento encontrado</h3>
            <p>Não há documentos catalogados com os filtros selecionados</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedData).map(([groupKey, groupDocs]) => (
              <div key={groupKey} className="document-group">
                <div 
                  className="group-header"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <div className="group-info">
                    {expandedGroups.has(groupKey) ? (
                      <FolderOpen size={20} className="group-icon" />
                    ) : (
                      <Folder size={20} className="group-icon" />
                    )}
                    <span className="group-title">{groupKey}</span>
                    <span className="group-count">({groupDocs.length})</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`chevron ${expandedGroups.has(groupKey) ? 'rotated' : ''}`}
                  />
                </div>

                {expandedGroups.has(groupKey) && (
                  <div className="group-content">
                    {groupDocs.map((doc) => (
                      <div key={doc.id} className="document-item">
                        <div className="document-icon">
                          <FileText size={16} />
                        </div>
                        
                        <div className="document-details">
                          <div className="document-title">
                            {doc.document_name}
                            {doc.is_important && <Star size={12} className="important-icon" />}
                          </div>
                          
                          <div className="document-description">
                            {doc.description}
                          </div>
                          
                          <div className="document-meta">
                            <span className="meta-item">
                              <User size={10} />
                              {doc.operator_name}
                            </span>
                            <span className="meta-item">
                              <Calendar size={10} />
                              {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {doc.file_size && (
                              <span className="meta-item">
                                {formatFileSize(doc.file_size)}
                              </span>
                            )}
                          </div>

                          <div className="document-tags">
                            <span className="category-tag">
                              {getCategoryIcon(doc.category)} {getCategoryName(doc.category)}
                            </span>
                            {doc.tags && Array.isArray(doc.tags) && doc.tags.map((tag, index) => (
                              <span key={index} className="tag">
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="document-actions">
                          <button 
                            className="action-btn view view-button"
                            onClick={() => window.open(doc.document_url, '_blank')}
                            title="Visualizar documento"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              background: 'rgba(96, 165, 250, 0.1)',
                              color: '#60a5fa',
                              border: '1px solid rgba(96, 165, 250, 0.3)',
                              borderRadius: '6px'
                            }}
                          >
                            <Eye size={14} style={{ display: 'block', margin: 0 }} />
                          </button>
                          <a 
                            href={doc.document_url} 
                            download={doc.document_name}
                            className="action-btn download download-button"
                            title="Baixar documento"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '6px',
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={14} style={{ display: 'block', margin: 0 }} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Carregar mais */}
            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Carregar mais documentos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para Upgrade de Plano */}
      {showUpgradeModal && (
        <div className="upgrade-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚀 Plano Superior</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="current-usage">
                <h4>Uso Atual</h4>
                <div className="usage-summary">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{ 
                        width: `${Math.min(usageStats?.percentage || 0, 100)}%`,
                        backgroundColor: (usageStats?.percentage || 0) >= 90 ? '#ef4444' : 
                                       (usageStats?.percentage || 0) >= 80 ? '#f59e0b' : '#22c55e'
                      }}
                    ></div>
                  </div>
                  <p>{usageStats?.currentMonth || 0} de {usageStats?.limit || 200} documentos este mês</p>
                </div>
              </div>

              <div className="upgrade-benefits">
                <h4>Benefícios do Plano Superior</h4>
                <ul>
                  <li>✅ <strong>Documentos ilimitados</strong> por mês</li>
                  <li>✅ <strong>Armazenamento ampliado</strong> de arquivos</li>
                  <li>✅ <strong>Suporte prioritário</strong> especializado</li>
                  <li>✅ <strong>Recursos avançados</strong> de organização</li>
                  <li>✅ <strong>Backup automático</strong> dos documentos</li>
                </ul>
              </div>

              <div className="contact-info">
                <h4>Como Contratar</h4>
                <p>Para obter um plano superior com documentos ilimitados, entre em contato com nosso administrador:</p>
                
                <div className="contact-methods">
                  <button className="contact-btn email">
                    📧 admin@empresa.com
                  </button>
                  <button className="contact-btn whatsapp">
                    📱 WhatsApp: (11) 99999-9999
                  </button>
                </div>
                
                <p className="note">
                  💡 <strong>Dica:</strong> Mencione que você precisa do plano com documentos ilimitados e nossa equipe te ajudará a escolher a melhor opção.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="close-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedDocuments