import { useState, useEffect } from 'react'
import {
  MessageSquareText,
  MessageCircle,
  Users,
  Edit3,
  ArrowRightLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Send,
  MoreVertical,
  Search
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
  status: 'pending' | 'active' | 'waiting_payment' | 'paid' | 'finished' | 'resolved' | 'transfer_pending'
  messages: ChatMessage[]
  assignedOperator?: string
  operatorId?: number
  createdAt: Date
  lastActivity: Date
  transferReason: string
  transferFrom?: number
  transferTo?: number
  transferFromName?: string
  transferToName?: string
  hasNewMessage?: boolean
  unreadCount?: number
}

interface Operator {
  id: number
  name: string
  email: string
  is_active: boolean
}

interface HumanChatProps {
  socket: any | null
  onUnreadCountChange?: (count: number) => void
}

function HumanChat({ socket, onUnreadCountChange }: HumanChatProps) {
  // States for Human Chat System
  const [humanChats, setHumanChats] = useState<HumanChat[]>([])
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  
  const [newChatMessage, setNewChatMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
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

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  // Função para mostrar notificação
  const showNotification = (title: string, message: string, chatId?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/vite.svg', // Usar o ícone da aplicação
        tag: chatId || 'chat-notification',
        requireInteraction: true
      })

      notification.onclick = () => {
        window.focus()
        if (chatId) {
          const chat = humanChats.find(c => c.id === chatId)
          if (chat) {
            setSelectedChat(chat.id)
          }
        }
        notification.close()
      }

      // Auto-fechar após 5 segundos
      setTimeout(() => notification.close(), 5000)
    }
  }

  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null)
  const [transferOperator, setTransferOperator] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [operators, setOperators] = useState<Operator[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true'
  })
  const [showTransferAcceptModal, setShowTransferAcceptModal] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileChatList, setShowMobileChatList] = useState(true)

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

  // Função para obter texto amigável do status
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'active': 'Ativo',
      'waiting_payment': 'Aguardando Pagamento',
      'paid': 'Pago',
      'finished': 'Encerrado',
      'resolved': 'Resolvido',
      'transfer_pending': 'Transferência Pendente'
    }
    return statusMap[status] || status
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
        const convertedChats = data.chats.map((chat: any) => {
          console.log('🔄 Convertendo chat do banco:', chat)
          return {
            id: chat.id.toString(),
            contactNumber: chat.phone_number,
            contactName: chat.contact_name || 'Cliente',
            status: chat.status,
            messages: [], // Será carregado quando necessário
            assignedOperator: chat.assigned_name || chat.operator_name || undefined,
            operatorId: chat.assigned_to || chat.operator_id || undefined,
            createdAt: new Date(chat.created_at),
            lastActivity: new Date(chat.updated_at),
            transferReason: chat.transfer_reason || 'Solicitação do cliente',
            transferFrom: chat.transfer_from || undefined,
            transferTo: chat.transfer_to || undefined,
            transferFromName: chat.transfer_from_name || undefined,
            transferToName: chat.transfer_to_name || undefined
          }
        })

        // Preservar mensagens existentes e status atualizados recentemente
        setHumanChats(prevChats => {
          return convertedChats.map((newChat: HumanChat) => {
            const existingChat = prevChats.find(chat => chat.id === newChat.id)
            if (existingChat) {
              // Preservar mensagens e outros dados locais
              return {
                ...newChat,
                messages: existingChat.messages || [],
                hasNewMessage: existingChat.hasNewMessage,
                unreadCount: existingChat.unreadCount
              }
            }
            return newChat
          })
        })
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
        console.log('✅ Transferência enviada:', data)
        alert('Transferência enviada! Aguardando aceite do operador.')
        
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

  // Função para aceitar transferência
  const handleAcceptTransfer = async (chatId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log(`✅ Aceitando transferência da conversa ${chatId}...`)
      
      const response = await fetch(`/api/messages/human-chats/${chatId}/accept-transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Transferência aceita:', data)
        
        // Adicionar mensagem de sistema informando que o operador assumiu
        const userData = localStorage.getItem('user')
        const currentUser = userData ? JSON.parse(userData) : null
        
        if (socket && currentUser) {
          const currentChat = humanChats.find(chat => chat.id === chatId)
          if (currentChat) {
            socket.emit('send_system_message', {
              chatId: currentChat.contactNumber + '@c.us',
              message: `🔄 *${currentUser.name}* assumiu o atendimento desta conversa.`,
              operatorName: currentUser.name
            })
          }
        }
        
        // Recarregar chats para refletir a mudança
        await loadChatsFromDatabase()
        
        setShowTransferAcceptModal(null)
        return true
      } else {
        const error = await response.json()
        console.error('❌ Erro ao aceitar transferência:', error)
        alert(error.error || 'Erro ao aceitar transferência')
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao aceitar transferência:', error)
      alert('Erro interno ao aceitar transferência')
      return false
    }
  }

  // Função para rejeitar transferência
  const handleRejectTransfer = async (chatId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log(`❌ Rejeitando transferência da conversa ${chatId}...`)
      
      const response = await fetch(`/api/messages/human-chats/${chatId}/reject-transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Transferência rejeitada:', data)
        
        // Recarregar chats para refletir a mudança
        await loadChatsFromDatabase()
        
        setShowTransferAcceptModal(null)
        return true
      } else {
        const error = await response.json()
        console.error('❌ Erro ao rejeitar transferência:', error)
        alert(error.error || 'Erro ao rejeitar transferência')
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao rejeitar transferência:', error)
      alert('Erro interno ao rejeitar transferência')
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
      console.log(`🔍 URL da requisição: /api/messages/human-chats/${chatId}/messages`)
      
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

      console.log(`🔍 Status da resposta: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Dados recebidos da API:', data)
        console.log('✅ Mensagens carregadas do chat:', data.messages)
        console.log('✅ Número de mensagens:', data.messages?.length || 0)
        
        if (!data.messages || !Array.isArray(data.messages)) {
          console.error('❌ Formato de resposta inválido - messages não é array')
          return
        }
        
        // Converter mensagens para formato do frontend
        const convertedMessages = data.messages.map((msg: any) => {
          console.log('🔄 Convertendo mensagem:', msg)
          return {
            id: msg.id.toString(),
            from: msg.sender_type === 'contact' ? `${currentChat.contactNumber}@c.us` : msg.sender_type,
            to: msg.sender_type === 'contact' ? 'operator' : `${currentChat.contactNumber}@c.us`,
            body: msg.content,
            timestamp: new Date(msg.created_at),
            isFromBot: msg.sender_type === 'bot',
            isFromHuman: msg.sender_type === 'operator'
          }
        })
        
        console.log('✅ Mensagens convertidas:', convertedMessages)
        
        // Atualizar o chat com as mensagens
        setHumanChats(chats => {
          const updatedChats = chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages: convertedMessages }
              : chat
          )
          console.log('✅ Estado atualizado - chat encontrado:', updatedChats.find(c => c.id === chatId))
          return updatedChats
        })
        
        console.log(`✅ ${convertedMessages.length} mensagens carregadas para chat ${chatId}`)
      } else {
        console.error('❌ Erro ao carregar mensagens do chat:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens do chat:', error)
    }
  }

  // Detectar mudanças de viewport para mobile
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobileView(isMobile)
      
      // Se mudou para desktop, sempre mostrar lista de chats
      if (!isMobile) {
        setShowMobileChatList(true)
      }
    }

    // Verificar no carregamento
    checkMobileView()

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkMobileView)

    return () => {
      window.removeEventListener('resize', checkMobileView)
    }
  }, [])

  // Carregar chats e operadores na inicialização
  useEffect(() => {
    // Limpar seleção antiga para forçar recarregamento
    localStorage.removeItem('selectedChat')
    loadChatsFromDatabase()
    loadOperators()
    
    // Solicitar permissão para notificações
    requestNotificationPermission()
  }, [])

  // Debug: verificar se socket está sendo passado
  console.log('🔍 HumanChat - Socket recebido:', socket ? 'SIM' : 'NÃO')
  console.log('💾 Chats carregados do banco:', humanChats.length)

  // Filtrar e ordenar chats por status, busca e última atividade
  const filteredChats = humanChats
    .filter(chat => {
      // Filtro por status - "Todos" exclui conversas encerradas
      const statusMatch = statusFilter === 'all' 
        ? !['finished', 'resolved'].includes(chat.status) 
        : chat.status === statusFilter

      // Filtro por busca
      const searchMatch = !searchTerm ||
        chat.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.contactNumber.includes(searchTerm) ||
        chat.messages.some(msg => msg.body.toLowerCase().includes(searchTerm.toLowerCase()))

      return statusMatch && searchMatch
    })
    .sort((a, b) => {
      // Primeiro: chats com mensagens não lidas vão para o topo
      if (a.unreadCount && !b.unreadCount) return -1
      if (!a.unreadCount && b.unreadCount) return 1

      // Segundo: ordenar por última atividade (mais recente primeiro)
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
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

  // Contador total de mensagens não lidas
  const totalUnreadMessages = humanChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)

  // Contador de chats com mensagens não lidas
  const chatsWithUnreadMessages = humanChats.filter(chat => (chat.unreadCount || 0) > 0).length

  // Função para marcar conversa como lida
  const markChatAsRead = (chatId: string) => {
    setHumanChats(chats => chats.map(chat =>
      chat.id === chatId
        ? { ...chat, hasNewMessage: false, unreadCount: 0 }
        : chat
    ))
  }

  // Marcar chat como lido automaticamente quando selecionado
  useEffect(() => {
    if (selectedChat) {
      // Pequeno delay para garantir que a UI foi atualizada
      const timer = setTimeout(() => {
        markChatAsRead(selectedChat)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [selectedChat])

  // Calcular total de mensagens não lidas
  useEffect(() => {
    const total = humanChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
    if (onUnreadCountChange) {
      onUnreadCountChange(total)
    }
  }, [humanChats, onUnreadCountChange])

  // Auto-scroll para a última mensagem quando novas mensagens chegam
  const scrollToBottom = () => {
    const messagesContentElement = document.querySelector('.messages-content')
    if (messagesContentElement) {
      setTimeout(() => {
        messagesContentElement.scrollTo({
          top: messagesContentElement.scrollHeight,
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
      console.log(`🔍 Debug useEffect - selectedChat: ${selectedChat}`)
      console.log(`🔍 Debug useEffect - currentChat:`, currentChat)
      console.log(`🔍 Debug useEffect - messages length:`, currentChat?.messages?.length || 0)
      
      if (currentChat) {
        console.log(`🔍 Carregando histórico para chat ${selectedChat}...`)
        loadChatMessages(selectedChat)
      }
    }
  }, [selectedChat])

  // Auto-focus no campo de mensagem quando uma conversa é selecionada
  useEffect(() => {
    if (selectedChat) {
      const textareaElement = document.querySelector('.chat-input-fixed textarea') as HTMLTextAreaElement
      if (textareaElement) {
        setTimeout(() => {
          textareaElement.focus()
        }, 200)
      }
    }
  }, [selectedChat])

  // Função unificada para enviar mensagem
  const sendMessage = () => {
    if (!newChatMessage.trim() || !selectedChat) return
    
    const currentChat = humanChats.find(chat => chat.id === selectedChat)
    if (!currentChat) return
    
    // Verificar se o operador assumiu a conversa
    const userData = localStorage.getItem('user')
    const currentUser = userData ? JSON.parse(userData) : null
    
    if (currentChat.status === 'pending' && (!currentChat.assignedOperator || currentUser?.id !== currentChat.operatorId)) {
      alert('Você precisa assumir esta conversa antes de responder!')
      return
    }
    
    // Atualizar apenas o status para ativo (não adicionar mensagem aqui)
    setHumanChats(chats => 
      chats.map(chat => 
        chat.id === selectedChat 
          ? { 
              ...chat, 
              lastActivity: new Date(),
              status: 'active' as const
            }
          : chat
      )
    )
    
    // Enviar via socket - a mensagem será adicionada via operator_message_saved
    if (socket) {
      const messageData = {
        chatId: currentChat.contactNumber + '@c.us',
        message: newChatMessage.trim(),
        operatorName: operatorName
      };
      console.log('📤 Enviando mensagem do operador via socket:', messageData);
      socket.emit('send_operator_message', messageData);
    }
    
    setNewChatMessage('')
    
    // Scroll para baixo após enviar (com delay para aguardar mensagem do servidor)
    setTimeout(() => scrollToBottom(), 300)
  }



  // Salvar chat selecionado no localStorage
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', selectedChat)
    } else {
      localStorage.removeItem('selectedChat')
    }
  }, [selectedChat])

  // Salvar estado da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    console.log('🔌 Configurando listeners do socket para HumanChat')

    // Join manager room for real-time updates
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const managerId = user.role === 'operator' ? user.manager_id : user.id
        
        console.log(`👥 Entrando na sala do manager ${managerId} para receber mensagens em tempo real`)
        socket.emit('join_manager_room', managerId)
      }
    } catch (error) {
      console.error('Erro ao entrar na sala do manager:', error)
    }

    // Listener para solicitações de chat humano
    socket.on('human_chat_requested', (data: {
      chatId: string
      customerName: string
      customerPhone: string
      timestamp: Date
      messages: any[]
    }) => {
      
      
      // Verificar se o chat já existe localmente
      const existingChat = humanChats.find(chat => chat.contactNumber === data.customerPhone)
      
      if (existingChat) {
        // Atualizar mensagens do chat existente se houver novas
        setHumanChats(chats =>
          chats.map(chat =>
            chat.contactNumber === data.customerPhone
              ? {
                  ...chat,
                  status: 'pending' as const,
                  lastActivity: new Date(data.timestamp),
                  hasNewMessage: true,
                  // Só incrementar se não for o chat atualmente selecionado
                  unreadCount: selectedChat !== chat.id ? (chat.unreadCount || 0) + 1 : (chat.unreadCount || 0),
                  messages: data.messages?.length > 0 ? data.messages.map((msg: any) => ({
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
      
      // Notificações instantâneas e alertas visuais
      console.log('🔔 Nova solicitação de atendimento humano:', data.customerName)
      
      // Som de notificação (se disponível)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOL0t2IbBDmS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2wdBDuZ2/LDcSQEL4TO8diJOQcZarnr45xKDgtOqOJ=')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (error) {
        // Ignorar erro do som
      }
      
      // Alerta visual instantâneo - Notificação do browser
      if (!existingChat) {
        // Nova conversa
        showNotification(
          '🔔 Nova Conversa!',
          `${data.customerName} solicitou atendimento`,
          data.chatId
        )
        
        // Fazer a página piscar ou chamar atenção
        if (document.title.indexOf('🔔') === -1) {
          document.title = '🔔 Nova Conversa! - ' + document.title
          
          // Remover o indicador após 10 segundos
          setTimeout(() => {
            document.title = document.title.replace('🔔 Nova Conversa! - ', '')
          }, 10000)
        }
      } else {
        // Conversa existente com nova mensagem
        showNotification(
          '💬 Nova Mensagem',
          `${data.customerName}: nova atividade`,
          existingChat.id
        )
      }
      
      // Alerta de callback para o dashboard (se existir)
      if (onUnreadCountChange) {
        const totalUnread = humanChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0) + 1
        onUnreadCountChange(totalUnread)
      }
    })

    // Listener para mensagens do operador salvas
    socket.on('operator_message_saved', (data: {
      chatId: string,
      message: string,
      messageId: number,
      timestamp: string,
      operatorName: string
    }) => {
      console.log('💾 Mensagem do operador salva via socket:', data)
      
      // Adicionar erro handlers para debug
      if (!data.chatId || !data.message) {
        console.error('❌ Dados inválidos na mensagem do operador:', data);
        return;
      }
      
      // Encontrar o chat e adicionar a mensagem (verificar se não existe)
      const phoneNumber = data.chatId.replace('@c.us', '')
      setHumanChats(chats => chats.map(chat => {
        if (chat.contactNumber === phoneNumber) {
          // Verificar se a mensagem já existe
          const messageExists = chat.messages.some(msg => 
            msg.id === data.messageId.toString() || 
            (msg.body === data.message && Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000)
          )
          
          if (messageExists) {
            console.log('📝 Mensagem já existe, ignorando duplicata')
            return chat
          }
          
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
      console.log('📩 Mensagem do cliente recebida via socket:', data)
      console.log('📩 Chats atuais:', humanChats.map(c => ({id: c.id, contactNumber: c.contactNumber})))
      
      // Mostrar notificação para nova mensagem do cliente
      showNotification(
        '💬 Nova Mensagem',
        `${data.customerName}: ${data.message.substring(0, 50)}...`,
        data.chatId
      )
      
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
            // Verificar se a mensagem já existe para evitar duplicatas
            const messageExists = chat.messages.some(msg =>
              msg.body === data.message &&
              Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000
            )

            if (messageExists) {
              console.log('📝 Mensagem duplicada ignorada')
              return chat
            }

            // Se o chat estava encerrado, reativar automaticamente
            const updatedStatus = chat.status === 'resolved' || chat.status === 'finished' ? 'active' : chat.status

            // Só incrementar unreadCount se o chat não estiver selecionado atualmente
            const shouldIncrementUnread = selectedChat !== chat.id

            return {
              ...chat,
              status: updatedStatus as any,
              messages: [...chat.messages, newMessage],
              lastActivity: new Date(data.timestamp),
              hasNewMessage: true,
              unreadCount: shouldIncrementUnread ? (chat.unreadCount || 0) + 1 : (chat.unreadCount || 0)
            }
          }
          return chat
        })
      )
    })

    socket.on('chat_transferred', (data: {
      chatId: string
      fromOperator: string
      toOperator: string
      reason: string
    }) => {
      console.log('🔄 Chat transferido:', data)
      // Aqui você pode implementar notificações ou outras ações
      // Por exemplo, mostrar uma notificação toast
    })

    // Listener para atualizações da dashboard
    socket.on('dashboard_chat_update', (data: {
      type: 'new_chat' | 'new_message' | 'transfer_created' | 'transfer_accepted' | 'status_changed' | 'chat_reopened'
      chatId: number
      customerName: string
      customerPhone: string
      status: string
      timestamp: Date
      [key: string]: any
    }) => {
      console.log('📊 Atualização da dashboard:', data)
      
      // Recarregar lista de chats para refletir mudanças
      if (data.type === 'new_chat' || data.type === 'transfer_created' || data.type === 'transfer_accepted' || data.type === 'chat_reopened') {
        console.log('🔄 Recarregando chats devido a:', data.type)
        loadChatsFromDatabase()
      }
      
      // Atualizar chat existente se for nova mensagem
      if (data.type === 'new_message') {
        setHumanChats(chats => chats.map(chat => 
          chat.id === data.chatId.toString()
            ? {
                ...chat,
                lastActivity: new Date(data.timestamp),
                hasNewMessage: true,
                unreadCount: (chat.unreadCount || 0) + 1
              }
            : chat
        ))
      }

      // Atualizar status em tempo real
      if (data.type === 'status_changed') {
        console.log(`🔄 Status do chat ${data.chatId} alterado para: ${data.status}`)
        setHumanChats(chats => chats.map(chat => 
          chat.id === data.chatId.toString()
            ? {
                ...chat,
                status: data.status as any,
                lastActivity: new Date(data.timestamp)
              }
            : chat
        ))
        
        // Mostrar notificação de mudança de status
        const statusText = {
          'pending': 'Pendente',
          'active': 'Ativo',
          'waiting_payment': 'Aguardando Pagamento',
          'paid': 'Pago',
          'finished': 'Encerrado',
          'resolved': 'Resolvido'
        }[data.status] || data.status
        
        showNotification(
          '🔄 Status Alterado',
          `${data.customerName}: ${statusText}`,
          data.chatId.toString()
        )
      }
      
      // Mostrar notificação específica para chat reaberto
      if (data.type === 'chat_reopened') {
        console.log(`🔄 Chat ${data.chatId} foi reaberto por ${data.customerName}`)
        // Aqui você pode adicionar uma notificação toast se desejar
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
      console.log('🚀 Status de chat humano alterado em tempo real:', data)
      
      // Atualizar o chat no estado local
      setHumanChats(chats => chats.map(chat => 
        chat.id === data.chatId.toString()
          ? {
              ...chat,
              status: data.status as any,
              lastActivity: new Date(data.timestamp),
              assignedOperator: data.operatorName || chat.assignedOperator,
              operatorId: data.operatorId || chat.operatorId
            }
          : chat
      ))
      
      // Log detalhado da mudança
      console.log(`✅ Chat ${data.chatId} - Status: ${data.previousStatus} → ${data.status}`)
    })

    // Listener para erros de mensagens do operador
    socket.on('operator_message_error', (error: any) => {
      console.error('❌ Erro ao enviar mensagem do operador:', error);
      alert(`Erro ao enviar mensagem: ${error.error}`);
    });

    socket.on('message_send_error', (error: any) => {
      console.error('❌ Erro no envio da mensagem:', error);
      alert(`Erro no envio: ${error.error}`);
    });

    socket.on('message_sent_confirmation', (data: any) => {
      console.log('✅ Confirmação de envio de mensagem:', data);
    });

    return () => {
      socket.off('human_chat_requested')
      socket.off('customer_message')
      socket.off('operator_message_saved')
      socket.off('chat_transferred')
      socket.off('dashboard_chat_update')
      socket.off('human_chat_status_changed')
      socket.off('operator_message_error')
      socket.off('message_send_error')
      socket.off('message_sent_confirmation')
    }
  }, [socket, humanChats, loadChatsFromDatabase])

  return (
    <div className="human-chat-container">
      {/* Mobile Navigation Header */}
      {isMobileView && (
        <div className="mobile-chat-header">
          {!showMobileChatList && selectedChat ? (
            <button 
              className="mobile-back-btn"
              onClick={() => setShowMobileChatList(true)}
              title="Voltar para lista de chats"
            >
              ← Voltar
            </button>
          ) : (
            <div className="mobile-chat-title">
              <MessageSquareText size={20} />
              Atendimento Humano
            </div>
          )}
        </div>
      )}
      
      <div className={`chat-layout ${isMobileView ? 'mobile' : ''}`}>
        {/* Chat List Sidebar */}
        <div className={`chat-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileView && !showMobileChatList ? 'mobile-hidden' : ''}`}>
          {/* Header compacto com operador e ações */}
          <div className="chat-header-compact">
            <div className="operator-info-compact">
              <div className="operator-avatar">
                {operatorName.charAt(0).toUpperCase()}
              </div>
              <div className="operator-details">
                <div className="operator-name">{operatorName}</div>
                <div className="operator-status">
                  Online
                  {totalUnreadMessages > 0 && (
                    <span className="unread-summary">
                      • {totalUnreadMessages} não lidas em {chatsWithUnreadMessages} chat{chatsWithUnreadMessages !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="header-actions-compact">
              <button
                className="header-action-btn"
                onClick={() => {
                  const newName = prompt('Digite seu nome:', operatorName)
                  if (newName && newName.trim()) {
                    setOperatorName(newName.trim())
                    localStorage.setItem('operatorName', newName.trim())
                  }
                }}
                title="Editar perfil"
              >
                <Edit3 size={20} />
              </button>
              <button
                className="header-action-btn"
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todos os chats?')) {
                    setHumanChats([])
                    setSelectedChat(null)
                    localStorage.removeItem('humanChats')
                    localStorage.removeItem('selectedChat')
                  }
                }}
                title="Limpar chats"
              >
                <MessageCircle size={20} />
              </button>
              <button
                className="header-action-btn"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title="Menu"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="search-bar">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar ou começar uma nova conversa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros de Status no topo */}
          <div className="status-filters-top">
            <div className="filter-row">
              <button 
                className={`filter-btn-compact ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
                data-icon="📋"
                title="Todos"
              >
                {!isSidebarCollapsed && `Todos (${humanChats.filter(chat => !['finished', 'resolved'].includes(chat.status)).length})`}
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
                data-icon="🟡"
                title="Pendentes"
              >
                {!isSidebarCollapsed && `🟡 Pendentes (${statusCounts.pending})`}
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
                data-icon="🟢"
                title="Ativas"
              >
                {!isSidebarCollapsed && `🟢 Ativas (${statusCounts.active})`}
              </button>
            </div>
            <div className="filter-row">
              <button 
                className={`filter-btn-compact ${statusFilter === 'waiting_payment' ? 'active' : ''}`}
                onClick={() => setStatusFilter('waiting_payment')}
                data-icon="🟠"
                title="Aguardando"
              >
                {!isSidebarCollapsed && `🟠 Aguardando (${statusCounts.waiting_payment})`}
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setStatusFilter('paid')}
                data-icon="🔵"
                title="Pagos"
              >
                {!isSidebarCollapsed && `🔵 Pagos (${statusCounts.paid})`}
              </button>
              <button 
                className={`filter-btn-compact ${statusFilter === 'finished' ? 'active' : ''}`}
                onClick={() => setStatusFilter('finished')}
                data-icon="🔴"
                title="Encerrados"
              >
                {!isSidebarCollapsed && `🔴 Encerrados (${statusCounts.finished})`}
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
                  className={`chat-item-compact ${selectedChat === chat.id ? 'selected' : ''} ${chat.status} ${chat.hasNewMessage ? 'has-new-message' : ''}`}
                  onClick={() => {
                    if (chat.status === 'transfer_pending') {
                      // Se é uma transferência pendente, abrir modal de aceite
                      const userData = localStorage.getItem('user')
                      const currentUser = userData ? JSON.parse(userData) : null
                      if (currentUser && chat.transferTo === currentUser.id) {
                        setShowTransferAcceptModal(chat.id)
                      }
                    } else {
                      setSelectedChat(chat.id)
                      markChatAsRead(chat.id)
                      
                      // Em mobile, esconder a lista de chats quando um chat é selecionado
                      if (isMobileView) {
                        setShowMobileChatList(false)
                      }
                    }
                  }}
                >
                  <div className="chat-avatar-compact">
                    <Users size={14} />
                    {/* Status indicator circle */}
                    <div className={`status-circle status-${chat.status}`} title={getStatusText(chat.status)}></div>
                  </div>
                  <div className="chat-info-compact">
                    <div className="chat-header-row">
                      <span className="chat-name-compact">{chat.contactName}</span>
                    </div>
                    <div className="chat-content-row">
                      <span className="chat-preview-compact">
                        {chat.status === 'transfer_pending'
                          ? `Transferência de ${chat.transferFromName || 'operador'}`
                          : (chat.messages[chat.messages.length - 1]?.body.substring(0, 30) || 'Sem mensagens') + '...'
                        }
                      </span>
                      {chat.hasNewMessage && !chat.unreadCount && (
                        <div className="new-message-indicator"></div>
                      )}
                      <div className="status-indicator-compact">
                        <span className="chat-time-compact">
                          {new Date(chat.lastActivity).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {chat.hasNewMessage && chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="unread-badge">{chat.unreadCount}</span>
                        )}
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
        <div className={`chat-main ${isMobileView && showMobileChatList ? 'mobile-hidden' : ''}`}>
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
                      <span className="contact-status-compact">
                        {currentChat.status === 'active' && '🟢 Online'}
                        {currentChat.status === 'pending' && '🟡 Pendente'}
                        {currentChat.status === 'waiting_payment' && '🟠 Aguardando Pagamento'}
                        {currentChat.status === 'paid' && '🔵 Pago'}
                        {currentChat.status === 'finished' && '🔴 Finalizado'}
                        {currentChat.status === 'resolved' && '✅ Resolvido'}
                      </span>
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
                        
                        <ChevronDown size={12} />
                      </button>
                      
                      {showStatusDropdown === selectedChat && (
                        <div className="status-dropdown-menu">
                          {['active', 'waiting_payment', 'paid', 'finished'].map(status => (
                            <button
                              key={status}
                              className={`status-option ${status}`}
                              onClick={async () => {
                                try {
                                  // Atualizar no servidor primeiro
                                  const response = await fetch(`/api/messages/human-chats/${selectedChat}/status`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                                    },
                                    body: JSON.stringify({ status })
                                  })

                                  if (response.ok) {
                                    const responseData = await response.json()
                                    console.log('✅ Status atualizado no servidor:', responseData)

                                    // Atualizar o estado local com os dados confirmados do servidor
                                    setHumanChats(chats =>
                                      chats.map(chat =>
                                        chat.id === selectedChat
                                          ? { ...chat, status: status as any, lastActivity: new Date() }
                                          : chat
                                      )
                                    )

                                    // Se encerrar, notificar o servidor via socket
                                    if (status === 'finished' && socket) {
                                      socket.emit('finish_human_chat', {
                                        contactNumber: currentChat.contactNumber
                                      })
                                    }

                                    console.log(`✅ Status do chat ${selectedChat} atualizado para: ${status}`)
                                  } else {
                                    const errorData = await response.json()
                                    console.error('❌ Erro ao atualizar status no servidor:', errorData)
                                    alert(`Erro ao atualizar status: ${errorData.error || 'Erro desconhecido'}`)
                                  }
                                } catch (error) {
                                  console.error('Erro ao atualizar status:', error)
                                  alert('Erro ao atualizar status. Tente novamente.')
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
                      <ArrowRightLeft size={12} />
                      Transferir
                    </button>
                  </div>
                </div>

                <div className="chat-messages">
                  <div className="messages-content">
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

                  <div className="chat-input-fixed">
                    <div className="input-container">
                      <textarea
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder={
                          currentChat.status === 'pending' && !currentChat.assignedOperator 
                            ? `Assuma a conversa para responder...`
                            : `Responder para ${currentChat.contactName}...`
                        }
                        disabled={currentChat.status === 'pending' && !currentChat.assignedOperator}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <button
                        className="btn-send"
                        onClick={sendMessage}
                        disabled={
                          !newChatMessage.trim() ||
                          (currentChat.status === 'pending' && !currentChat.assignedOperator)
                        }
                        title="Enviar mensagem"
                      >
                        <Send size={18} />
                      </button>
                    </div>
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
                  <div style={{
                    padding: '0.75rem',
                    border: '1px solid #fed7d7',
                    borderRadius: '8px',
                    backgroundColor: '#fef5e7',
                    color: '#c53030',
                    fontSize: '0.875rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      ⚠️ Nenhum operador cadastrado disponível para transferência
                    </div>
                    <small style={{ color: '#975a16' }}>
                      Entre em contato com o administrador para cadastrar operadores
                    </small>
                  </div>
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
                  if (transferOperator.trim() && showTransferModal && operators.length > 0) {
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
                  } else if (operators.length === 0) {
                    alert('Não há operadores disponíveis para transferência')
                  }
                }}
                disabled={!transferOperator.trim() || operators.length === 0}
                style={{
                  opacity: (!transferOperator.trim() || operators.length === 0) ? 0.5 : 1,
                  cursor: (!transferOperator.trim() || operators.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                <ArrowRightLeft size={16} />
                {operators.length === 0 ? 'Sem Operadores' : 'Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aceite de Transferência */}
      {showTransferAcceptModal && (
        <div className="modal-overlay" onClick={() => setShowTransferAcceptModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aceitar Transferência</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTransferAcceptModal(null)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {(() => {
                const transferChat = humanChats.find(chat => chat.id === showTransferAcceptModal)
                if (!transferChat) return null
                
                return (
                  <div>
                    <div className="transfer-info">
                      <h4>📞 {transferChat.contactName}</h4>
                      <p><strong>De:</strong> {transferChat.transferFromName || 'Operador'}</p>
                      {transferChat.transferReason && (
                        <div className="transfer-reason">
                          <p><strong>Motivo da Transferência:</strong></p>
                          <div className="reason-box">
                            {transferChat.transferReason}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="transfer-actions">
                      <button
                        className="btn-accept-transfer"
                        onClick={() => handleAcceptTransfer(showTransferAcceptModal)}
                      >
                        <CheckCircle2 size={16} />
                        Aceitar
                      </button>
                      
                      <button
                        className="btn-reject-transfer"
                        onClick={() => handleRejectTransfer(showTransferAcceptModal)}
                      >
                        <XCircle size={16} />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HumanChat
