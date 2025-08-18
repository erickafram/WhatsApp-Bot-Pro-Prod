import { useState, useEffect } from 'react'
import { 
  MessageSquareText,
  MessageCircle,
  Users,
  UserCheck,
  Edit3,
  ArrowRightLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronDown
} from 'lucide-react'

interface ChatMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  isFromBot: boolean
  isFromHuman: boolean
}

interface HumanChat {
  id: string
  contactNumber: string
  contactName: string
  status: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved'
  messages: ChatMessage[]
  assignedOperator?: string
  operatorId?: number
  createdAt: Date
  lastActivity: Date
  transferReason: string
}

interface Operator {
  id: number
  name: string
  email: string
  is_active: boolean
}

interface HumanChatProps {
  socket: any | null
}

function HumanChat({ socket }: HumanChatProps) {
  // States for Human Chat System
  const [humanChats, setHumanChats] = useState<HumanChat[]>([])
  
  const [selectedChat, setSelectedChat] = useState<string | null>(() => {
    return localStorage.getItem('selectedChat') || null
  })
  
  const [newChatMessage, setNewChatMessage] = useState('')
  const [operatorName, setOperatorName] = useState(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        return user.name || 'Operador'
      }
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error)
    }
    return 'Operador'
  })
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null)
  const [transferOperator, setTransferOperator] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [operators, setOperators] = useState<Operator[]>([])

  // Função para carregar operadores disponíveis
  const loadOperators = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/operators', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const activeOperators = data.operators.filter((op: Operator) => op.is_active)
        setOperators(activeOperators)
        console.log(`✅ ${activeOperators.length} operadores ativos carregados`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar operadores:', error)
    }
  }

  // Função para carregar chats do banco de dados
  const loadChatsFromDatabase = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('🔍 Carregando chats humanos do banco de dados...')
      
      const response = await fetch('/api/messages/human-chats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Chats humanos carregados do banco:', data.chats)
        
        // Converter formato do banco para formato do frontend
        const convertedChats = data.chats.map((chat: any) => ({
          id: chat.id.toString(),
          contactNumber: chat.phone_number,
          contactName: chat.contact_name || 'Cliente',
          status: chat.status,
          messages: [], // Será carregado quando necessário
          assignedOperator: chat.assigned_name || chat.operator_name || undefined,
          operatorId: chat.assigned_to || chat.operator_id || undefined,
          createdAt: new Date(chat.created_at),
          lastActivity: new Date(chat.updated_at),
          transferReason: chat.transfer_reason || 'Solicitação do cliente'
        }))
        
        setHumanChats(convertedChats)
        console.log(`✅ ${convertedChats.length} chats carregados`)
      } else {
        console.error('❌ Erro ao carregar chats:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chats do banco:', error)
    }
  }

  // Função para assumir uma conversa
  const handleTakeChat = async (chatId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log(`🔄 Assumindo conversa ${chatId}...`)
      
      const response = await fetch(`/api/messages/human-chats/${chatId}/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Conversa assumida com sucesso:', data)
        
        // Recarregar chats para refletir a mudança
        await loadChatsFromDatabase()
        
        // Selecionar automaticamente o chat assumido
        setSelectedChat(chatId)
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(async () => {
          console.log('🔄 Forçando carregamento de mensagens para chat assumido')
          await loadChatMessages(chatId)
        }, 500)
      } else {
        const error = await response.json()
        console.error('❌ Erro ao assumir conversa:', error)
        alert(error.error || 'Erro ao assumir conversa')
      }
    } catch (error) {
      console.error('❌ Erro ao assumir conversa:', error)
      alert('Erro interno ao assumir conversa')
    }
  }

  // Função para transferir uma conversa
  const handleTransferChat = async (chatId: string, toUserId: number, transferReason: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log(`🔄 Transferindo conversa ${chatId} para usuário ${toUserId}...`)
      
      const response = await fetch(`/api/messages/human-chats/${chatId}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toUserId,
          transferReason
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Conversa transferida com sucesso:', data)
        
        // Recarregar chats para refletir a mudança
        await loadChatsFromDatabase()
        
        return true
      } else {
        const error = await response.json()
        console.error('❌ Erro ao transferir conversa:', error)
        alert(error.error || 'Erro ao transferir conversa')
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao transferir conversa:', error)
      alert('Erro interno ao transferir conversa')
      return false
    }
  }

  // Função para carregar mensagens de um chat específico
  const loadChatMessages = async (chatId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log(`🔍 Carregando mensagens do chat ${chatId}...`)
      
      // Encontrar o chat para obter o contactId
      const currentChat = humanChats.find(chat => chat.id === chatId)
      if (!currentChat) {
        console.error('❌ Chat não encontrado localmente:', chatId)
        return
      }

      // Usar API correta de mensagens por chat humano
      const response = await fetch(`/api/messages/human-chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Mensagens carregadas do chat:', data.messages)
        
        // Converter mensagens para formato do frontend
        const convertedMessages = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          from: msg.sender_type === 'contact' ? `${currentChat.contactNumber}@c.us` : msg.sender_type,
          to: msg.sender_type === 'contact' ? 'operator' : `${currentChat.contactNumber}@c.us`,
          body: msg.content,
          timestamp: new Date(msg.created_at),
          isFromBot: msg.sender_type === 'bot',
          isFromHuman: msg.sender_type === 'operator'
        }))
        
        // Atualizar o chat com as mensagens
        setHumanChats(chats => 
          chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages: convertedMessages }
              : chat
          )
        )
        
        console.log(`✅ ${convertedMessages.length} mensagens carregadas para chat ${chatId}`)
      } else {
        console.error('❌ Erro ao carregar mensagens do chat:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens do chat:', error)
    }
  }

  // Carregar chats e operadores na inicialização
  useEffect(() => {
    loadChatsFromDatabase()
    loadOperators()
  }, [])

  // Debug: verificar se socket está sendo passado
  console.log('🔍 HumanChat - Socket recebido:', socket ? 'SIM' : 'NÃO')
  console.log('💾 Chats carregados do banco:', humanChats.length)

  // Filtrar chats por status
  const filteredChats = humanChats.filter(chat => {
    if (statusFilter === 'all') return true
    return chat.status === statusFilter
  })

  // Contadores por status
  const statusCounts = {
    pending: humanChats.filter(chat => chat.status === 'pending').length,
    active: humanChats.filter(chat => chat.status === 'active').length,
    waiting_payment: humanChats.filter(chat => chat.status === 'waiting_payment').length,
    paid: humanChats.filter(chat => chat.status === 'paid').length,
    finished: humanChats.filter(chat => chat.status === 'finished').length,
    resolved: humanChats.filter(chat => chat.status === 'resolved').length,
  }

  // Auto-scroll para a última mensagem quando novas mensagens chegam
  const scrollToBottom = () => {
    const chatMessagesElement = document.querySelector('.chat-messages')
    if (chatMessagesElement) {
      setTimeout(() => {
        chatMessagesElement.scrollTo({
          top: chatMessagesElement.scrollHeight,
          behavior: 'smooth'
        })
      }, 50)
    }
  }

  useEffect(() => {
    if (selectedChat && humanChats.length > 0) {
      scrollToBottom()
    }
  }, [humanChats, selectedChat])

  // Scroll quando uma nova mensagem é enviada
  useEffect(() => {
    if (selectedChat) {
      const currentChat = humanChats.find(chat => chat.id === selectedChat)
      if (currentChat && currentChat.messages.length > 0) {
        scrollToBottom()
      }
    }
  }, [humanChats.find(chat => chat.id === selectedChat)?.messages?.length])

  // Carregar mensagens quando um chat é selecionado
  useEffect(() => {
    if (selectedChat) {
      const currentChat = humanChats.find(chat => chat.id === selectedChat)
      if (currentChat && currentChat.messages.length === 0) {
        console.log(`🔍 Carregando histórico para chat ${selectedChat}...`)
        loadChatMessages(selectedChat)
      }
    }
  }, [selectedChat, humanChats])

  // Auto-focus no campo de mensagem quando uma conversa é selecionada
  useEffect(() => {
    if (selectedChat) {
      const textareaElement = document.querySelector('.chat-input textarea') as HTMLTextAreaElement
      if (textareaElement) {
        setTimeout(() => {
          textareaElement.focus()
        }, 200)
      }
    }
  }, [selectedChat])



  // Salvar chat selecionado no localStorage
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', selectedChat)
    } else {
      localStorage.removeItem('selectedChat')
    }
  }, [selectedChat])

  useEffect(() => {
    if (!socket) return

    console.log('🔌 Configurando listeners do HumanChat...')
    console.log('🔌 Socket ID:', socket.id)

    // Teste: emitir um evento para verificar conexão
    socket.emit('test_connection', { from: 'HumanChat', socketId: socket.id })

    // Event listeners para chat humano
    console.log('📝 Registrando listener para human_chat_requested')
    
    socket.on('human_chat_requested', (data: {
      chatId: string
      customerName: string
      customerPhone: string
      lastMessage: string
      timestamp: Date
      humanChatId?: number
      managerId?: number
      contactId?: number
      recentMessages?: any[]
    }) => {
      console.log('🔔 Evento human_chat_requested recebido:', data)
      
      // Verificar se já existe um chat para este contato para evitar duplicatas
      const existingChatIndex = humanChats.findIndex(chat => 
        chat.contactNumber === data.customerPhone
      )
      
      if (existingChatIndex >= 0) {
        // Se já existe, apenas atualizar o status e histórico
        console.log('🔄 Atualizando chat existente para:', data.customerName)
        setHumanChats(chats => 
          chats.map((chat, index) => 
            index === existingChatIndex 
              ? { 
                  ...chat, 
                  status: 'pending',
                  lastActivity: new Date(data.timestamp),
                  messages: data.recentMessages ? data.recentMessages.map((msg: any) => ({
                    id: msg.id.toString(),
                    from: msg.sender_type === 'contact' ? data.chatId : 'bot',
                    to: msg.sender_type === 'contact' ? 'operator' : data.chatId,
                    body: msg.content,
                    timestamp: new Date(msg.timestamp),
                    isFromBot: msg.isFromBot,
                    isFromHuman: msg.isFromHuman
                  })) : chat.messages
                }
              : chat
          )
        )
      } else {
        // Só recarregar do banco se não existir localmente
        console.log('🔔 Recarregando chats do banco para novo contato...')
        loadChatsFromDatabase()
      }
      
      // Notificação sonora ou visual
      console.log('🔔 Nova solicitação de atendimento humano:', data.customerName)
    })

    // Listener para mensagens do operador salvas
    socket.on('operator_message_saved', (data: {
      chatId: string,
      message: string,
      messageId: number,
      timestamp: string,
      operatorName: string
    }) => {
      console.log('💾 Mensagem do operador salva:', data)
      
      // Encontrar o chat e adicionar a mensagem
      const phoneNumber = data.chatId.replace('@c.us', '')
      setHumanChats(chats => chats.map(chat => {
        if (chat.contactNumber === phoneNumber) {
          const newMessage = {
            id: data.messageId.toString(),
            from: 'operator',
            to: data.chatId,
            body: data.message,
            timestamp: new Date(data.timestamp),
            isFromBot: false,
            isFromHuman: true
          }
          
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastActivity: new Date(data.timestamp)
          }
        }
        return chat
      }))
    })

    socket.on('customer_message', (data: {
      chatId: string
      message: string
      timestamp: Date
      customerName: string
    }) => {
      console.log('📩 Mensagem do cliente recebida:', data)
      
      // Adicionar mensagem do cliente ao chat existente
      const customerPhone = data.chatId.replace('@c.us', '')
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        from: data.chatId,
        to: 'operator',
        body: data.message,
        timestamp: new Date(data.timestamp),
        isFromBot: false,
        isFromHuman: false
      }
      
      setHumanChats(chats => 
        chats.map(chat => {
          if (chat.contactNumber === customerPhone) {
            // Se o chat estava encerrado, reativar automaticamente
            const newStatus = chat.status === 'finished' ? 'active' : chat.status
            
            return { 
              ...chat, 
              status: newStatus,
              messages: [...chat.messages, newMessage],
              lastActivity: new Date()
            }
          }
          return chat
        })
      )
    })

    // Listener para transferências de chat
    socket.on('chat_transferred', (data: {
      chatId: string
      contactNumber: string
      fromOperator: string
      toOperator: string
      reason: string
      timestamp: Date
    }) => {
      console.log('🔄 Chat transferido:', data)
      // Aqui você pode implementar notificações ou outras ações
      // Por exemplo, mostrar uma notificação toast
    })

    return () => {
      socket.off('human_chat_requested')
      socket.off('customer_message')
      socket.off('operator_message_saved')
      socket.off('chat_transferred')
    }
  }, [socket])

  return (
    <div className="human-chat-container">
      <div className="chat-layout">
        {/* Chat List Sidebar */}
        <div className="chat-sidebar">
          {/* Header compacto com operador e ações */}
          <div className="chat-header-compact">
            <div className="operator-info-compact">
              <UserCheck size={16} />
              <span className="operator-name">{operatorName}</span>
              <span className="operator-status">Online</span>
            </div>
            <div className="header-actions-compact">
              <button 
                className="btn-edit-name-compact"
                onClick={() => {
                  const newName = prompt('Digite seu nome:', operatorName)
                  if (newName && newName.trim()) {
                    setOperatorName(newName.trim())
                    localStorage.setItem('operatorName', newName.trim())
                  }
                }}
                title="Editar nome"
              >
                <Edit3 size={12} />
              </button>
              <button 
                className="btn-clear-chats-compact"
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todos os chats?')) {
                    setHumanChats([])
                    setSelectedChat(null)
                    localStorage.removeItem('humanChats')
                    localStorage.removeItem('selectedChat')
                  }
                }}
                title="Limpar todos os chats"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Filtros de Status no topo */}
          <div className="status-filters-top">
            <div className="filter-row">
              <button 
                className={`filter-btn-compact ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Todos ({humanChats.length})
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                🟡 Pendentes ({statusCounts.pending})
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                🟢 Ativas ({statusCounts.active})
              </button>
            </div>
            <div className="filter-row">
              <button 
                className={`filter-btn-compact ${statusFilter === 'waiting_payment' ? 'active' : ''}`}
                onClick={() => setStatusFilter('waiting_payment')}
              >
                🟠 Aguardando ({statusCounts.waiting_payment})
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setStatusFilter('paid')}
              >
                🔵 Pagos ({statusCounts.paid})
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'finished' ? 'active' : ''}`}
                onClick={() => setStatusFilter('finished')}
              >
                🔴 Encerrados ({statusCounts.finished})
              </button>
            </div>
          </div>

          <div className="chat-list">
            {filteredChats.length === 0 ? (
              <div className="empty-chats">
                <MessageCircle size={48} />
                <h4>Nenhuma conversa</h4>
                <p>Quando alguém solicitar atendimento humano, aparecerá aqui</p>
              </div>
            ) : (
              filteredChats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item-compact ${selectedChat === chat.id ? 'selected' : ''} ${chat.status}`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="chat-avatar-compact">
                    <Users size={16} />
                  </div>
                  <div className="chat-info-compact">
                    <div className="chat-header-row">
                      <span className="chat-name-compact">{chat.contactName}</span>
                      <span className="chat-time-compact">
                        {new Date(chat.lastActivity).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="chat-content-row">
                      <span className="chat-preview-compact">
                        {chat.messages[chat.messages.length - 1]?.body.substring(0, 35) || 'Sem mensagens'}...
                      </span>
                      <div className={`status-indicator-compact ${chat.status}`}>
                        {chat.status === 'pending' && '🟡'}
                        {chat.status === 'active' && '🟢'}
                        {chat.status === 'waiting_payment' && '🟠'}
                        {chat.status === 'paid' && '🔵'}
                        {chat.status === 'finished' && '🔴'}
                        {chat.status === 'resolved' && '✅'}
                      </div>
                    </div>
                    
                    {chat.assignedOperator && (
                      <div className="operator-assignment">
                        <span>👤 {chat.assignedOperator}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="chat-main">
          {selectedChat ? (() => {
            const currentChat = humanChats.find(chat => chat.id === selectedChat)
            if (!currentChat) return null

            return (
              <>
                <div className="chat-main-header-compact">
                  <div className="contact-info-compact">
                    <div className="contact-avatar-compact">
                      <Users size={18} />
                    </div>
                    <div className="contact-details-compact">
                      <span className="contact-name-compact">{currentChat.contactName}</span>
                      <span className="contact-number-compact">{currentChat.contactNumber}</span>
                    </div>
                  </div>
                  <div className="chat-actions-compact">
                    {/* Botão para Assumir Conversa (se pendente e não atribuída) */}
                    {currentChat.status === 'pending' && !currentChat.assignedOperator && (
                      <button 
                        className="btn-take-chat"
                        onClick={() => handleTakeChat(currentChat.id)}
                        title="Assumir conversa"
                      >
                        <Users size={14} />
                        Assumir
                      </button>
                    )}

                    {/* Status Dropdown compacto */}
                    <div className="status-dropdown-compact">
                      <button 
                        className={`btn-status-compact ${currentChat.status}`}
                        onClick={() => setShowStatusDropdown(showStatusDropdown === selectedChat ? null : selectedChat)}
                      >
                        {currentChat.status === 'pending' && '🟡'}
                        {currentChat.status === 'active' && '🟢'}
                        {currentChat.status === 'waiting_payment' && '🟠'}
                        {currentChat.status === 'paid' && '🔵'}
                        {currentChat.status === 'finished' && '🔴'}
                        {currentChat.status === 'resolved' && '✅'}
                        
                        {currentChat.status === 'pending' && 'Pendente'}
                        {currentChat.status === 'active' && 'Ativo'}
                        {currentChat.status === 'waiting_payment' && 'Aguardando'}
                        {currentChat.status === 'paid' && 'Pago'}
                        {currentChat.status === 'finished' && 'Encerrado'}
                        {currentChat.status === 'resolved' && 'Resolvido'}
                        
                        <ChevronDown size={14} />
                      </button>
                      
                      {showStatusDropdown === selectedChat && (
                        <div className="status-dropdown-menu">
                          {['active', 'waiting_payment', 'paid', 'finished'].map(status => (
                            <button
                              key={status}
                              className={`status-option ${status}`}
                              onClick={() => {
                                setHumanChats(chats => 
                                  chats.map(chat => 
                                    chat.id === selectedChat 
                                      ? { ...chat, status: status as any }
                                      : chat
                                  )
                                )
                                
                                // Se encerrar, notificar o servidor
                                if (status === 'finished' && socket) {
                                  socket.emit('finish_human_chat', {
                                    contactNumber: currentChat.contactNumber
                                  })
                                }
                                
                                setShowStatusDropdown(null)
                              }}
                            >
                              {status === 'active' && <><MessageCircle size={16} /> Em Andamento</>}
                              {status === 'waiting_payment' && <><CreditCard size={16} /> Aguardando Pagamento</>}
                              {status === 'paid' && <><CheckCircle2 size={16} /> Pago</>}
                              {status === 'finished' && <><XCircle size={16} /> Encerrar</>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transferir Conversa compacto */}
                    <button 
                      className="btn-transfer-compact"
                      onClick={() => setShowTransferModal(selectedChat)}
                      disabled={currentChat.status === 'finished' || currentChat.status === 'resolved'}
                      title="Transferir conversa"
                    >
                      <ArrowRightLeft size={14} />
                    </button>
                  </div>
                </div>

                <div className="chat-messages">
                  {currentChat.messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.isFromBot ? 'bot' : message.isFromHuman ? 'human' : 'customer'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.body}</div>
                        <div className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="chat-input">
                  <div className="input-container">
                    <textarea
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder={`Responder para ${currentChat.contactName}...`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          // Enviar mensagem
                          if (newChatMessage.trim() && selectedChat) {
                            const message: ChatMessage = {
                              id: Date.now().toString(),
                              from: 'operator',
                              to: currentChat.contactNumber,
                              body: newChatMessage.trim(),
                              timestamp: new Date(),
                              isFromBot: false,
                              isFromHuman: true
                            }
                            
                            setHumanChats(chats => 
                              chats.map(chat => 
                                chat.id === selectedChat 
                                  ? { 
                                      ...chat, 
                                      messages: [...chat.messages, message],
                                      lastActivity: new Date(),
                                      status: 'active' as const
                                    }
                                  : chat
                              )
                            )
                            
                            // Enviar via socket
                            if (socket) {
                              socket.emit('send_operator_message', {
                                chatId: currentChat.contactNumber + '@c.us',
                                message: newChatMessage.trim(),
                                operatorName: operatorName
                              })
                            }
                            
                            setNewChatMessage('')
                            
                            // Scroll para baixo após enviar
                            setTimeout(() => scrollToBottom(), 100)
                          }
                        }
                      }}
                    />
                    <button 
                      className="btn-send"
                      onClick={() => {
                        if (newChatMessage.trim() && selectedChat) {
                          const message: ChatMessage = {
                            id: Date.now().toString(),
                            from: 'operator',
                            to: currentChat.contactNumber,
                            body: newChatMessage.trim(),
                            timestamp: new Date(),
                            isFromBot: false,
                            isFromHuman: true
                          }
                          
                          setHumanChats(chats => 
                            chats.map(chat => 
                              chat.id === selectedChat 
                                ? { 
                                    ...chat, 
                                    messages: [...chat.messages, message],
                                    lastActivity: new Date(),
                                    status: 'active' as const
                                  }
                                : chat
                            )
                          )
                          
                          // Enviar via socket - não precisa mais de managerId, o servidor autentica automaticamente
                          if (socket) {
                            const messageData = {
                              chatId: currentChat.contactNumber,
                              message: newChatMessage.trim(),
                              operatorName: operatorName
                            }
                            
                            console.log('🔍 Debug messageData antes de enviar:', messageData)
                            
                            socket.emit('send_operator_message', messageData)
                            
                            console.log(`📤 Mensagem enviada via socket autenticado`)
                          } else {
                            console.error('❌ Socket não está disponível')
                          }
                          
                          setNewChatMessage('')
                          
                          // Scroll para baixo após enviar
                          setTimeout(() => scrollToBottom(), 100)
                        }
                      }}
                      disabled={!newChatMessage.trim()}
                    >
                      <MessageCircle size={16} />
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            )
          })() : (
            <div className="no-chat-selected">
              <MessageSquareText size={64} />
              <h3>Selecione uma conversa</h3>
              <p>Escolha uma conversa na lista para começar a atender</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Transferência */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transferir Conversa</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTransferModal(null)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Operador de Destino:</label>
                {operators.length > 0 ? (
                  <select
                    value={transferOperator}
                    onChange={(e) => setTransferOperator(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#2d3748',
                      background: 'white',
                      width: '100%'
                    }}
                  >
                    <option value="">Selecione um operador...</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.name}>
                        {operator.name} ({operator.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={transferOperator}
                    onChange={(e) => setTransferOperator(e.target.value)}
                    placeholder="Nome do operador... (Nenhum operador ativo encontrado)"
                  />
                )}
              </div>
              
              <div className="form-group">
                <label>Motivo da Transferência:</label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Descreva o motivo da transferência..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowTransferModal(null)
                  setTransferOperator('')
                  setTransferReason('')
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm"
                onClick={async () => {
                  if (transferOperator.trim() && showTransferModal) {
                    // Encontrar o operador selecionado pelo nome
                    const selectedOperator = operators.find(op => op.name === transferOperator)
                    
                    if (selectedOperator) {
                      // Usar a nova API de transferência
                      const success = await handleTransferChat(
                        showTransferModal, 
                        selectedOperator.id, 
                        transferReason
                      )
                      
                      if (success) {
                        // Limpar modal
                        setShowTransferModal(null)
                        setTransferOperator('')
                        setTransferReason('')
                        setSelectedChat(null)
                      }
                    } else {
                      alert('Operador não encontrado')
                    }
                  }
                }}
                disabled={!transferOperator.trim()}
              >
                <ArrowRightLeft size={16} />
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HumanChat
