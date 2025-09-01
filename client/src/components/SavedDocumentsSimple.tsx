import React, { useState, useEffect, useMemo } from 'react'
import { FileText, Search, User, Tag, Download, Eye, Filter, Star, File, Clock } from 'lucide-react'
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

const SavedDocumentsSimple: React.FC = () => {
  // Estados básicos
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Função para carregar documentos
  const loadDocuments = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('Token de autenticação não encontrado')
        return
      }

      console.log('🔍 Carregando documentos salvos...')

      const response = await fetch('/api/documents/list?limit=50&page=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📄 Resposta da API:', data)

        if (data.success && Array.isArray(data.data)) {
          // Processar documentos garantindo que tags seja sempre um array
          const processedDocs = data.data.map((doc: any) => ({
            ...doc,
            tags: Array.isArray(doc.tags) ? doc.tags : []
          }))
          
          console.log('📄 Documentos processados:', processedDocs)
          setDocuments(processedDocs)
        } else {
          console.error('Formato de resposta inválido:', data)
          setDocuments([])
        }
      } else {
        console.error('Erro na resposta:', response.status, response.statusText)
        setDocuments([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Carregar documentos na inicialização
  useEffect(() => {
    loadDocuments()
  }, [])

  // Filtrar documentos
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Filtro de busca por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.document_name?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.contact_name?.toLowerCase().includes(term) ||
        doc.operator_name?.toLowerCase().includes(term)
      )
    }

    // Filtro de status (importante/normal)
    if (statusFilter !== 'all') {
      if (statusFilter === 'important') {
        filtered = filtered.filter(doc => doc.is_important)
      } else if (statusFilter === 'normal') {
        filtered = filtered.filter(doc => !doc.is_important)
      }
    }

    // Filtro de data
    if (dateFilter !== 'all') {
      const today = new Date()
      const docDate = new Date()

      filtered = filtered.filter(doc => {
        docDate.setTime(new Date(doc.created_at).getTime())

        switch (dateFilter) {
          case 'today':
            return docDate.toDateString() === today.toDateString()
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return docDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return docDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }, [documents, searchTerm, statusFilter, dateFilter])

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

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="saved-documents-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando documentos salvos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="saved-documents-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <FileText size={24} className="header-icon" />
            <div>
              <h1>Documentos Catalogados</h1>
              <p>{filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos</option>
                <option value="important">⭐ Importantes</option>
                <option value="normal">Normais</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Período:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todo período</option>
                <option value="today">Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Últimos 30 dias</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setDateFilter('all')
                }}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de documentos */}
      <div className="documents-list">
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>Nenhum documento encontrado</h3>
            <p>Não há documentos catalogados{searchTerm ? ' com o termo pesquisado' : ''}</p>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="document-card-modern">
                {/* Header with file icon and title */}
                <div className="document-card-header">
                  <div className="document-file-icon">
                    <File size={24} />
                  </div>
                  <div className="document-title-section">
                    <div className="document-title-row">
                      <h3 className="document-title">{doc.document_name}</h3>
                      {doc.is_important && (
                        <div className="important-badge">
                          <Star size={12} />
                          <span>Importante</span>
                        </div>
                      )}
                    </div>
                    <div className="document-category">
                      <span className="category-icon">{getCategoryIcon(doc.category)}</span>
                      <span className="category-text">{getCategoryName(doc.category)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="document-description-section">
                  <p className="document-description">{doc.description}</p>
                </div>

                {/* Metadata */}
                <div className="document-meta-section">
                  <div className="meta-row">
                    <div className="meta-item">
                      <User size={12} />
                      <span>{doc.operator_name || 'Operador Desconhecido'}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={12} />
                      <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {doc.file_size && (
                    <div className="file-size-info">
                      <File size={12} />
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="document-tags-section">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag-chip">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="tag-more">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="document-actions-section">
                  <button
                    className="action-button view-button"
                    onClick={() => window.open(doc.document_url, '_blank')}
                    title="Visualizar documento"
                  >
                    <Eye size={14} />
                    <span>Visualizar</span>
                  </button>
                  <button
                    className="action-button download-button"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = doc.document_url
                      link.download = doc.document_name
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    title="Baixar documento"
                  >
                    <Download size={14} />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedDocumentsSimple
