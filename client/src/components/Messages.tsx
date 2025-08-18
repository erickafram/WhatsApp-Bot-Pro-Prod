import { useState, useEffect } from 'react'
import { 
  MessageSquareText,
  MessageCircle,
  Plus,
  X,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Zap,
  Tag,
  MessageSquare,
  Sparkles,
  Check,
  UserCheck,
  PlayCircle,
  Eye,
  EyeOff,
  MousePointer,
  Move,
  Save,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Route,
  Diamond,
  CheckCircle,
  Type,
  Bot,
  List
} from 'lucide-react'

interface AutoMessage {
  id: string
  trigger: string[]
  response: string
  active: boolean
}

interface MessageProject {
  id: string
  name: string
  description: string
  messages: AutoMessage[]
  createdAt: string
  isActive: boolean
  isDefault?: boolean
}

interface FlowNode {
  id: string
  type: 'start' | 'message' | 'condition' | 'options' | 'human' | 'end'
  position: { x: number; y: number }
  data: {
    title: string
    description?: string
    triggers?: string[]
    response?: string
    conditions?: { field: string; operator: string; value: string }[]
    options?: { id: string; label: string; value: string }[]
    active?: boolean
  }
  connections: string[]
}

interface FlowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

interface FlowState {
  nodes: FlowNode[]
  connections: FlowConnection[]
  selectedNode: string | null
  draggedNode: string | null
  isDragging: boolean
  zoom: number
  panOffset: { x: number; y: number }
}

interface MessagesProps {
  socket: any | null
}

function Messages({ }: MessagesProps) {
  // States for Message Projects
  const [messageProjects, setMessageProjects] = useState<MessageProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null)

  // Legacy state - will be migrated to projects
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([
    {
      id: '1',
      trigger: ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite'],
      response: 'Olá! {name} Sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Outras perguntas',
      active: true
    },
    {
      id: '2',
      trigger: ['1'],
      response: 'Nosso serviço oferece consultas médicas 24 horas por dia, 7 dias por semana, diretamente pelo WhatsApp.\n\nNão há carência, o que significa que você pode começar a usar nossos serviços imediatamente após a adesão.\n\nOferecemos atendimento médico ilimitado, receitas\n\nAlém disso, temos uma ampla gama de benefícios, incluindo acesso a cursos gratuitos\n\nLink para cadastro: https://site.com',
      active: true
    },
    {
      id: '3',
      trigger: ['2'],
      response: '*Plano Individual:* R$22,50 por mês.\n\n*Plano Família:* R$39,90 por mês, inclui você mais 3 dependentes.\n\n*Plano TOP Individual:* R$42,50 por mês, com benefícios adicionais como\n\n*Plano TOP Família:* R$79,90 por mês, inclui você mais 3 dependentes\n\nLink para cadastro: https://site.com',
      active: true
    },
    {
      id: '4',
      trigger: ['3'],
      response: 'Sorteio de em prêmios todo ano.\n\nAtendimento médico ilimitado 24h por dia.\n\nReceitas de medicamentos\n\nLink para cadastro: https://site.com',
      active: true
    },
    {
      id: '5',
      trigger: ['4'],
      response: 'Você pode aderir aos nossos planos diretamente pelo nosso site ou pelo WhatsApp.\n\nApós a adesão, você terá acesso imediato\n\nLink para cadastro: https://site.com',
      active: true
    },
    {
      id: '6',
      trigger: ['5'],
      response: 'Se você tiver outras dúvidas ou precisar de mais informações, por favor, fale aqui nesse whatsapp ou visite nosso site: https://site.com',
      active: true
    }
  ])
  const [editingMessage, setEditingMessage] = useState<AutoMessage | null>(null)
  const [showAddMessage, setShowAddMessage] = useState(false)
  const [showFlowView, setShowFlowView] = useState(false)
  const [newAutoMessage, setNewAutoMessage] = useState<Partial<AutoMessage>>({
    trigger: [],
    response: '',
    active: true
  })

  // Advanced Flow Editor State
  const [flowState, setFlowState] = useState<FlowState>({
    nodes: [],
    connections: [],
    selectedNode: null,
    draggedNode: null,
    isDragging: false,
    zoom: 1,
    panOffset: { x: 0, y: 0 }
  })
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeFlowTool, setActiveFlowTool] = useState<'select' | 'connect' | 'pan'>('select')
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    draggedNodeId: string | null
    dragOffset: { x: number; y: number }
    startPosition: { x: number; y: number }
  }>({
    isDragging: false,
    draggedNodeId: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  })

  // Função para carregar projetos do banco de dados
  const loadProjectsFromDatabase = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('🔍 Carregando projetos do banco de dados...')
      
      // Buscar projetos do banco
      const response = await fetch('/api/messages/projects', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Projetos carregados do banco:', data.projects)
        
        // Se não há projetos, criar projeto padrão de ônibus
        if (data.projects.length === 0) {
          console.log('🚌 Nenhum projeto encontrado, criando projeto padrão de ônibus...')
          await createDefaultBusProject()
          return // Recarregará após criar
        }
        
        // Converter formato do banco para formato do frontend
        const convertedProjects = data.projects.map((project: any) => ({
          id: project.id.toString(),
          name: project.name,
          description: project.description || '',
          messages: [], // Será carregado depois
          isActive: project.is_active,
          isDefault: project.is_default,
          createdAt: new Date(project.created_at)
        }))
        
        setMessageProjects(convertedProjects)
        
        // Encontrar projeto padrão
        const defaultProject = data.projects.find((p: any) => p.is_default)
        if (defaultProject) {
          setDefaultProjectId(defaultProject.id.toString())
          console.log('🌟 Projeto padrão encontrado:', defaultProject.name)
          
          // Carregar mensagens do projeto padrão
          await loadProjectMessages(defaultProject.id)
        }
      } else {
        console.error('❌ Erro ao carregar projetos:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar projetos do banco:', error)
    }
  }

  // Load projects from database on mount
  useEffect(() => {
    loadProjectsFromDatabase()
  }, [])

  // Função para criar projeto padrão de ônibus automaticamente
  const createDefaultBusProject = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      console.log('🚌 Criando projeto padrão de Vendas de Passagem de Ônibus...')
      
      // Criar projeto
      const projectResponse = await fetch('/api/messages/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Vendas de Passagem de Ônibus',
          description: 'Fluxo otimizado para vendas de passagens com sistema inteligente de verificação de cidades',
          is_active: true,
          is_default: true
        })
      })

      if (projectResponse.ok) {
        const projectData = await projectResponse.json()
        const projectId = projectData.project.id
        console.log('✅ Projeto de ônibus criado:', projectData.project)

        // Mensagens específicas da Viação Palmas
        const busMessages = [
          {
            trigger_words: ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite', 'bom dia', 'boa tarde', 'boa noite'],
            response_text: '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊',
            order_index: 1
          },
          {
            trigger_words: ['1', 'comprar', 'passagem', 'bilhete'],
            response_text: '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️',
            order_index: 2
          },
          {
            trigger_words: ['2', 'horários', 'horario', 'hora'],
            response_text: '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫',
            order_index: 3
          },
          {
            trigger_words: ['3', 'operador', 'atendente', 'humano', 'pessoa'],
            response_text: '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨',
            order_index: 4
          },
          {
            trigger_words: ['CIDADE_DISPONIVEL'],
            response_text: '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌',
            order_index: 5
          },
          {
            trigger_words: ['CIDADE_NAO_DISPONIVEL'],
            response_text: '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊',
            order_index: 6
          }
        ]

        // Criar todas as mensagens
        for (const message of busMessages) {
          const messageResponse = await fetch(`/api/messages/projects/${projectId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              trigger_words: message.trigger_words,
              response_text: message.response_text,
              is_active: true,
              order_index: message.order_index
            })
          })

          if (messageResponse.ok) {
            const messageData = await messageResponse.json()
            console.log(`✅ Mensagem ${message.order_index} criada:`, messageData.message)
          }
        }

        console.log('🎉 Projeto de ônibus completo criado com sucesso!')
        
        // Recarregar projetos para atualizar a interface
        await loadProjectsFromDatabase()
        
      } else {
        console.error('❌ Erro ao criar projeto de ônibus:', projectResponse.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao criar projeto padrão de ônibus:', error)
    }
  }

  // Função para carregar mensagens de um projeto específico
  const loadProjectMessages = async (projectId: number) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      console.log(`🔍 Carregando mensagens do projeto ${projectId}...`)
      
      const response = await fetch(`/api/messages/projects/${projectId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Mensagens carregadas do banco:', data.messages)
        
        // Converter formato do banco para formato do frontend
        const convertedMessages = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          trigger: msg.trigger_words,
          response: msg.response_text,
          active: msg.is_active
        }))
        
        // Atualizar as mensagens automáticas
        setAutoMessages(convertedMessages)
        
        // Atualizar também o projeto com as mensagens
        setMessageProjects(prev => prev.map(project => 
          project.id === projectId.toString() 
            ? { ...project, messages: convertedMessages }
            : project
        ))
        
        console.log(`✅ ${convertedMessages.length} mensagens carregadas para o projeto ${projectId}`)
      } else {
        console.error('❌ Erro ao carregar mensagens:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens do banco:', error)
    }
  }

  // Auto Messages Management Functions
  const addAutoMessage = async () => {
    if (newAutoMessage.trigger && newAutoMessage.response && defaultProjectId) {
      try {
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          console.error('❌ Token de autenticação não encontrado')
          return
        }

        console.log('💾 Adicionando mensagem no banco...')
        
        const response = await fetch(`/api/messages/projects/${defaultProjectId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trigger_words: Array.isArray(newAutoMessage.trigger) ? newAutoMessage.trigger : [newAutoMessage.trigger],
            response_text: newAutoMessage.response,
            is_active: newAutoMessage.active || true,
            order_index: autoMessages.length
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Mensagem criada no banco:', data.message)
          
          // Recarregar mensagens do projeto
          await loadProjectMessages(parseInt(defaultProjectId))
          
      setNewAutoMessage({ trigger: [], response: '', active: true })
      setShowAddMessage(false)
        } else {
          console.error('❌ Erro ao criar mensagem:', response.statusText)
          alert('Erro ao criar mensagem. Tente novamente.')
        }
      } catch (error) {
        console.error('❌ Erro ao criar mensagem no banco:', error)
        alert('Erro ao criar mensagem. Tente novamente.')
      }
    }
  }

  const updateAutoMessage = (updatedMessage: AutoMessage) => {
    const currentMessages = getCurrentMessages()
    updateCurrentMessages(currentMessages.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ))
    setEditingMessage(null)
  }

  const deleteAutoMessage = (id: string) => {
    const currentMessages = getCurrentMessages()
    updateCurrentMessages(currentMessages.filter(msg => msg.id !== id))
  }

  const toggleMessageActive = (id: string) => {
    const currentMessages = getCurrentMessages()
    updateCurrentMessages(currentMessages.map(msg => 
      msg.id === id ? { ...msg, active: !msg.active } : msg
    ))
  }

  const addHumanIntervention = () => {
    const humanMessage: AutoMessage = {
      id: 'human-' + Date.now().toString(),
      trigger: ['falar com humano', 'atendente', 'suporte humano', 'pessoa real', 'operador'],
      response: '🙋‍♀️ Entendi que você gostaria de falar com um atendente humano.\n\nVou transferir você para nossa equipe de suporte. Em alguns instantes um de nossos especialistas entrará em contato.\n\n⏰ Horário de atendimento: Segunda a Sexta, 8h às 18h\n\nObrigado pela paciência! 😊',
      active: true
    }
    const currentMessages = getCurrentMessages()
    updateCurrentMessages([...currentMessages, humanMessage])
  }

  // Project Management Functions
  const createProject = async () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      try {
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          console.error('❌ Token de autenticação não encontrado')
          return
        }

        console.log('💾 Criando projeto no banco:', newProject.name)
        
        const response = await fetch('/api/messages/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
            is_active: true,
            is_default: false
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Projeto criado no banco:', data.project)
          
          // Converter formato do banco para formato do frontend
          const convertedProject: MessageProject = {
            id: data.project.id.toString(),
            name: data.project.name,
            description: data.project.description || '',
        messages: [],
            createdAt: new Date(data.project.created_at).toISOString(),
            isActive: data.project.is_active,
            isDefault: data.project.is_default
      }
          
          setMessageProjects([...messageProjects, convertedProject])
      setNewProject({ name: '', description: '' })
      setShowProjectForm(false)
        } else {
          console.error('❌ Erro ao criar projeto:', response.statusText)
          alert('Erro ao criar projeto. Tente novamente.')
        }
      } catch (error) {
        console.error('❌ Erro ao criar projeto no banco:', error)
        alert('Erro ao criar projeto. Tente novamente.')
      }
    }
  }

  const deleteProject = (projectId: string) => {
    setMessageProjects(messageProjects.filter(p => p.id !== projectId))
    if (selectedProject === projectId) {
      setSelectedProject(null)
    }
  }

  const toggleProjectActive = (projectId: string) => {
    setMessageProjects(messageProjects.map(p => 
      p.id === projectId ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const setProjectAsDefault = async (projectId: string | null) => {
    if (!projectId) return
    
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('🌟 Definindo projeto como padrão no banco:', projectId)
      
      const response = await fetch(`/api/messages/projects/${projectId}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Projeto definido como padrão no banco:', data.project)
        
        // Atualizar estado local
    setDefaultProjectId(projectId)
    setMessageProjects(messageProjects.map(p => 
      ({ ...p, isDefault: p.id === projectId })
    ))
        
        // Carregar mensagens do novo projeto padrão
        await loadProjectMessages(parseInt(projectId))
      } else {
        console.error('❌ Erro ao definir projeto como padrão:', response.statusText)
        alert('Erro ao definir projeto como padrão. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro ao definir projeto como padrão no banco:', error)
      alert('Erro ao definir projeto como padrão. Tente novamente.')
    }
  }

  // Criar projeto específico para vendas de passagem de ônibus (OTIMIZADO)
  const createBusTicketProject = () => {
    const busTicketMessages: AutoMessage[] = [
      {
        id: 'bus-welcome',
        trigger: ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite', 'bom dia', 'boa tarde', 'boa noite'],
        response: `🚌 Olá! {name} Bem-vindo à *Viação Palmas*! 

Como posso ajudá-lo hoje?

*1* - 🎫 Comprar Passagem
*2* - 🕐 Ver Horários  
*3* - 👨‍💼 Falar com Operador

Digite o número da opção desejada! 😊`,
        active: true
      },
      {
        id: 'bus-buy-ticket',
        trigger: ['1', 'comprar', 'passagem', 'bilhete'],
        response: `🎫 *COMPRAR PASSAGEM*

Nossa origem é sempre: *Palmas - TO* 🏙️

Para qual cidade você gostaria de viajar?

*Cidades disponíveis:*
• São Luís - MA
• Imperatriz - MA  
• Brasília - DF
• Goiânia - GO
• Araguaína - TO
• Gurupi - TO
• Porto Nacional - TO
• Paraíso do Tocantins - TO
• Colinas do Tocantins - TO
• Barreiras - BA
• Luís Eduardo Magalhães - BA
• Teresina - PI
• Parnaíba - PI

Digite o nome da cidade de destino! ✈️`,
        active: true
      },
      {
        id: 'bus-schedules',
        trigger: ['2', 'horários', 'horario', 'hora'],
        response: `🕐 *HORÁRIOS DE SAÍDA*

*Saídas de Palmas - TO:*

🌅 *Manhã*
• 06:00 - Destinos: Brasília, Goiânia
• 07:30 - Destinos: São Luís, Imperatriz  
• 08:00 - Destinos: Araguaína, Gurupi

🌞 *Tarde*  
• 14:00 - Destinos: Teresina, Parnaíba
• 15:30 - Destinos: Barreiras, L.E. Magalhães
• 16:00 - Destinos: Porto Nacional, Paraíso

🌙 *Noite*
• 20:00 - Destinos: Brasília, Goiânia
• 21:30 - Destinos: São Luís, Imperatriz
• 22:00 - Destinos: Colinas do Tocantins

Para comprar sua passagem, digite *1*! 🎫`,
        active: true
      },
      {
        id: 'bus-operator',
        trigger: ['3', 'operador', 'atendente', 'humano', 'pessoa'],
        response: `👨‍💼 *FALAR COM OPERADOR*

🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!

Vou transferir você para nossa equipe de atendimento especializada em vendas de passagens.

⏰ *Horário de Atendimento:*
Segunda a Sexta: 6h às 22h
Sábado: 6h às 18h  
Domingo: 8h às 20h

Em alguns instantes um operador entrará em contato! 

Obrigado pela preferência! 🚌✨`,
        active: true
      },
      {
        id: 'bus-city-available',
        trigger: ['CIDADE_DISPONIVEL'], // Trigger especial - será ativado programaticamente
        response: `✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*

🎫 *Informações da Viagem:*
📍 Origem: Palmas - TO
📍 Destino: {CIDADE_NOME}
🕐 Horários disponíveis: Consulte digitando *2*

Para finalizar sua compra, preciso de algumas informações:

👤 *Nome completo*
📱 *Telefone para contato*  
📅 *Data da viagem desejada*
🆔 *CPF*

Ou se preferir, fale com nosso operador digitando *3*! 

Vamos prosseguir? 😊🚌`,
        active: true
      },
      {
        id: 'bus-city-not-available',
        trigger: ['CIDADE_NAO_DISPONIVEL'], // Trigger especial - será ativado programaticamente
        response: `❌ *Infelizmente não temos passagens para {CIDADE_NOME}*

Mas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:

🚌 *Viações Recomendadas:*
• Expresso Guanabara
• Viação Útil  
• Real Expresso
• Eucatur

Ou consulte nossos destinos disponíveis digitando *1*! 

*Destinos que atendemos:*
São Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba! 

Posso ajudar com algo mais? 😊`,
        active: true
      }
    ]

    const project: MessageProject = {
      id: `bus-ticket-${Date.now()}`,
      name: 'Vendas de Passagem de Ônibus',
      description: 'Fluxo otimizado para vendas de passagens com sistema inteligente de verificação de cidades (6 mensagens ao invés de 39)',
      messages: busTicketMessages,
      createdAt: new Date().toISOString(),
      isActive: true,
      isDefault: false
    }

    setMessageProjects([...messageProjects, project])
    setSelectedProject(project.id)
    return project
  }

  const getCurrentMessages = (): AutoMessage[] => {
    if (!selectedProject) return autoMessages
    const project = messageProjects.find(p => p.id === selectedProject)
    return project ? project.messages : []
  }

  const updateCurrentMessages = (messages: AutoMessage[]) => {
    if (!selectedProject) {
      setAutoMessages(messages)
    } else {
      setMessageProjects(messageProjects.map(p => 
        p.id === selectedProject ? { ...p, messages } : p
      ))
    }
  }

  // Convert AutoMessages to FlowNodes
  const convertMessagesToFlow = (messages: AutoMessage[]): { nodes: FlowNode[], connections: FlowConnection[] } => {
    const nodes: FlowNode[] = []
    const connections: FlowConnection[] = []

    // Start node
    const startNode: FlowNode = {
      id: 'start-1',
      type: 'start',
      position: { x: 50, y: 50 },
      data: { title: 'Início', description: 'Usuário inicia conversa' },
      connections: []
    }
    nodes.push(startNode)

    // Find welcome message (with oi, olá, menu triggers)
    const welcomeMsg = messages.find(msg => 
      msg.trigger.some(t => ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite'].includes(t.toLowerCase()))
    )

    if (welcomeMsg) {
      const welcomeNode: FlowNode = {
        id: `message-${welcomeMsg.id}`,
        type: 'message',
        position: { x: 50, y: 150 },
        data: { 
          title: 'Boas-vindas', 
          triggers: welcomeMsg.trigger,
          response: welcomeMsg.response,
          active: welcomeMsg.active
        },
        connections: []
      }
      nodes.push(welcomeNode)
      
      // Connect start to welcome
      connections.push({
        id: `${startNode.id}-${welcomeNode.id}`,
        source: startNode.id,
        target: welcomeNode.id
      })
      startNode.connections.push(welcomeNode.id)
    }

    // Find menu options (1, 2, 3, 4, 5)
    const menuOptions = messages.filter(msg => 
      msg.trigger.some(t => ['1', '2', '3', '4', '5'].includes(t))
    ).sort((a, b) => {
      const aNum = parseInt(a.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t)) || '0')
      const bNum = parseInt(b.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t)) || '0')
      return aNum - bNum
    })

    menuOptions.forEach((option, index) => {
      const optionNumber = option.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t))
      const optionNode: FlowNode = {
        id: `option-${option.id}`,
        type: 'message',
        position: { x: 300 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 120 },
        data: { 
          title: `Opção ${optionNumber}`, 
          triggers: option.trigger,
          response: option.response,
          active: option.active
        },
        connections: []
      }
      nodes.push(optionNode)

      // Connect welcome to options
      if (welcomeMsg) {
        const welcomeNodeId = `message-${welcomeMsg.id}`
        connections.push({
          id: `${welcomeNodeId}-${optionNode.id}`,
          source: welcomeNodeId,
          target: optionNode.id
        })
        const welcomeFlowNode = nodes.find(n => n.id === welcomeNodeId)
        if (welcomeFlowNode) {
          welcomeFlowNode.connections.push(optionNode.id)
        }
      }
    })

    // Find human intervention
    const humanMsg = messages.find(msg => 
      msg.id.startsWith('human-') || 
      msg.trigger.some(t => ['falar com humano', 'atendente', 'suporte'].includes(t.toLowerCase()))
    )

    if (humanMsg) {
      const humanNode: FlowNode = {
        id: `human-${humanMsg.id}`,
        type: 'human',
        position: { x: 50, y: 350 },
        data: { 
          title: 'Atendimento Humano', 
          triggers: humanMsg.trigger,
          response: humanMsg.response,
          active: humanMsg.active
        },
        connections: []
      }
      nodes.push(humanNode)
    }

    // Add end node
    const endNode: FlowNode = {
      id: 'end-1',
      type: 'end',
      position: { x: 650, y: 250 },
      data: { title: 'Fim', description: 'Conversa finalizada' },
      connections: []
    }
    nodes.push(endNode)

    // Connect options to end
    menuOptions.forEach(option => {
      const optionNodeId = `option-${option.id}`
      connections.push({
        id: `${optionNodeId}-${endNode.id}`,
        source: optionNodeId,
        target: endNode.id
      })
      const optionFlowNode = nodes.find(n => n.id === optionNodeId)
      if (optionFlowNode) {
        optionFlowNode.connections.push(endNode.id)
      }
    })

    return { nodes, connections }
  }

  // Update flow when messages change or flow view is opened
  useEffect(() => {
    const currentMessages = getCurrentMessages()
    if (showFlowView && currentMessages.length > 0) {
      const { nodes, connections } = convertMessagesToFlow(currentMessages)
      setFlowState(prev => ({
        ...prev,
        nodes,
        connections
      }))
    }
  }, [showFlowView, autoMessages, messageProjects, selectedProject])

  // Advanced Flow Functions
  const addFlowNode = (type: FlowNode['type'], position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
      connections: []
    }
    
    setFlowState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNode: newNode.id
    }))
    setShowNodeEditor(true)
  }

  const getDefaultNodeData = (type: FlowNode['type']) => {
    switch (type) {
      case 'start':
        return { title: 'Início', description: 'Conversa iniciada' }
      case 'message':
        return { title: 'Nova Mensagem', triggers: [''], response: '', active: true }
      case 'condition':
        return { title: 'Condição', conditions: [{ field: '', operator: 'contains', value: '' }] }
      case 'options':
        return { title: 'Opções', options: [{ id: '1', label: 'Opção 1', value: '1' }] }
      case 'human':
        return { title: 'Atendimento Humano', description: 'Transferir para humano' }
      case 'end':
        return { title: 'Fim', description: 'Conversa finalizada' }
      default:
        return { title: 'Nó', description: '' }
    }
  }

  const deleteFlowNode = (nodeId: string) => {
    setFlowState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.source !== nodeId && conn.target !== nodeId
      ),
      selectedNode: prev.selectedNode === nodeId ? null : prev.selectedNode
    }))
  }

  // Drag and Drop handlers
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (activeFlowTool !== 'select') return
    
    e.preventDefault()
    e.stopPropagation()
    
    const node = flowState.nodes.find(n => n.id === nodeId)
    if (!node) return
    
    const rect = (e.target as HTMLElement).closest('.flow-node-compact')?.getBoundingClientRect()
    if (!rect) return
    
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    setDragState({
      isDragging: true,
      draggedNodeId: nodeId,
      dragOffset: { x: offsetX, y: offsetY },
      startPosition: { x: node.position.x, y: node.position.y }
    })
    
    setFlowState(prev => ({ ...prev, selectedNode: nodeId }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNodeId) return
    
    const canvas = (e.target as HTMLElement).closest('.flow-canvas')
    if (!canvas) return
    
    const canvasRect = canvas.getBoundingClientRect()
    const newX = e.clientX - canvasRect.left - dragState.dragOffset.x
    const newY = e.clientY - canvasRect.top - dragState.dragOffset.y
    
    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvasRect.width - 150))
    const constrainedY = Math.max(0, Math.min(newY, canvasRect.height - 100))
    
    setFlowState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === dragState.draggedNodeId
          ? { ...node, position: { x: constrainedX, y: constrainedY } }
          : node
      )
    }))
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 }
    })
  }

  const getNodeIcon = (type: FlowNode['type']) => {
    switch (type) {
      case 'start': return PlayCircle
      case 'message': return MessageCircle
      case 'condition': return Diamond
      case 'options': return List
      case 'human': return UserCheck
      case 'end': return CheckCircle
      default: return MessageCircle
    }
  }

  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'start': return '#48bb78'
      case 'message': return '#4299e1'
      case 'condition': return '#ed8936'
      case 'options': return '#9f7aea'
      case 'human': return '#e53e3e'
      case 'end': return '#38b2ac'
      default: return '#a0aec0'
    }
  }

  return (
    <div className="messages-container">
      {!selectedProject ? (
        // Projects List View
        <div className="projects-view">
          <div className="projects-header">
            <div className="title-section">
              <div className="title-with-icon">
                <div className="title-icon">
                  <MessageSquareText size={24} />
                </div>
                <div>
                  <h2>Projetos de Mensagens</h2>
                  <p>Organize suas mensagens automáticas em projetos</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn-modern btn-success"
                onClick={createBusTicketProject}
                title="Criar projeto pré-configurado para vendas de passagens de ônibus"
              >
                <Route size={16} />
                🚌 Passagens de Ônibus
              </button>
              <button 
                className="btn-modern btn-primary"
                onClick={() => setShowProjectForm(true)}
              >
                <Plus size={16} />
                Novo Projeto
              </button>
            </div>
          </div>

          {/* Project Form */}
          {showProjectForm && (
            <div className="project-form-modern">
              <div className="form-header">
                <h3>Criar Novo Projeto</h3>
                <button 
                  className="btn-close"
                  onClick={() => setShowProjectForm(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="form-body">
                <div className="form-group">
                  <label>Nome do Projeto</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Ex: Atendimento Comercial, Suporte Técnico..."
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Descreva o objetivo deste projeto de mensagens..."
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-modern btn-secondary"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-modern btn-primary"
                    onClick={createProject}
                  >
                    Criar Projeto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="projects-grid">
            {/* Default Project Card */}
            <div 
              className="project-card default-project"
              onClick={() => setSelectedProject(null)}
            >
              <div className="project-status-indicator">
                {!defaultProjectId ? (
                  <div className="status-active-indicator">
                    <Zap size={12} />
                    <span>ATIVO</span>
                  </div>
                ) : (
                  <div className="status-standby-indicator">
                    <Bot size={12} />
                    <span>STANDBY</span>
                  </div>
                )}
              </div>
              <div className="project-header">
                <div className="project-icon-container">
                  <div className="project-icon default">
                    <Bot size={28} />
                  </div>
                  <div className="project-category">
                    <span className="category-badge system">SISTEMA</span>
                  </div>
                </div>
                <div className="project-actions">
                  {!defaultProjectId && (
                    <button
                      className="action-btn set-default-btn active"
                      onClick={(e) => {
                        e.stopPropagation()
                        setProjectAsDefault(null)
                      }}
                      title="Projeto padrão ativo"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="project-content">
                <div className="project-title-section">
                  <h3>Mensagens Padrão</h3>
                  <div className="project-type">Sistema Legado</div>
                </div>
                <p>Sistema original de mensagens automáticas integrado</p>
                
                <div className="project-metrics">
                  <div className="metric-primary">
                    <div className="metric-value">{autoMessages.length}</div>
                    <div className="metric-label">Total de Mensagens</div>
                  </div>
                  <div className="metric-secondary">
                    <div className="metric-item">
                      <Zap size={14} />
                      <span>{autoMessages.filter(msg => msg.active).length} ativas</span>
                    </div>
                    <div className="metric-item">
                      <MessageCircle size={14} />
                      <span>{autoMessages.filter(msg => !msg.active).length} inativas</span>
                    </div>
                  </div>
                </div>
                
                <div className="project-footer">
                  <div className="project-date">
                    <span>Sistema Original</span>
                  </div>
                  <div className="effectiveness-indicator">
                    <div className="effectiveness-bar">
                      <div 
                        className="effectiveness-fill" 
                        style={{ width: `${Math.round((autoMessages.filter(msg => msg.active).length / autoMessages.length) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="effectiveness-text">
                      {Math.round((autoMessages.filter(msg => msg.active).length / autoMessages.length) * 100)}% ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Projects */}
            {messageProjects.map((project) => {
              const getProjectCategory = (projectName: string) => {
                if (projectName.toLowerCase().includes('passagem') || projectName.toLowerCase().includes('ônibus')) {
                  return { type: 'transport', label: 'TRANSPORTE', icon: Route }
                }
                if (projectName.toLowerCase().includes('vendas') || projectName.toLowerCase().includes('comercial')) {
                  return { type: 'sales', label: 'VENDAS', icon: MessageSquareText }
                }
                if (projectName.toLowerCase().includes('suporte') || projectName.toLowerCase().includes('atendimento')) {
                  return { type: 'support', label: 'SUPORTE', icon: MessageCircle }
                }
                return { type: 'general', label: 'GERAL', icon: MessageSquareText }
              }

              const category = getProjectCategory(project.name)
              const IconComponent = category.icon
              const activeMessages = project.messages.filter(msg => msg.active).length
              const totalMessages = project.messages.length
              const effectiveness = totalMessages > 0 ? Math.round((activeMessages / totalMessages) * 100) : 0

              return (
                <div 
                  key={project.id}
                  className={`project-card ${!project.isActive ? 'inactive' : ''} ${category.type}`}
                  data-type={category.type}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="project-status-indicator">
                    {project.isActive ? (
                      <div className={`status-active-indicator ${project.isDefault ? 'default' : ''}`}>
                        <Zap size={12} />
                        <span>{project.isDefault ? 'PADRÃO' : 'ATIVO'}</span>
                      </div>
                    ) : (
                      <div className="status-inactive-indicator">
                        <X size={12} />
                        <span>INATIVO</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="project-header">
                    <div className="project-icon-container">
                      <div className={`project-icon ${category.type}`}>
                        <IconComponent size={28} />
                      </div>
                      <div className="project-category">
                        <span className={`category-badge ${category.type}`}>{category.label}</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button
                        className={`action-btn set-default-btn ${project.isDefault ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectAsDefault(project.isDefault ? null : project.id)
                        }}
                        title={project.isDefault ? 'Remover como padrão' : 'Definir como padrão'}
                      >
                        {project.isDefault ? <Check size={16} /> : <Diamond size={16} />}
                      </button>
                      <button
                        className={`action-btn toggle-btn ${project.isActive ? 'active' : 'inactive'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProjectActive(project.id)
                        }}
                        title={project.isActive ? 'Desativar projeto' : 'Ativar projeto'}
                      >
                        {project.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Tem certeza que deseja excluir este projeto?')) {
                            deleteProject(project.id)
                          }
                        }}
                        title="Excluir projeto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="project-content">
                    <div className="project-title-section">
                      <h3>{project.name}</h3>
                      <div className="project-type">Projeto Personalizado</div>
                    </div>
                    <p>{project.description || 'Projeto de mensagens personalizadas'}</p>
                    
                    <div className="project-metrics">
                      <div className="metric-primary">
                        <div className="metric-value">{totalMessages}</div>
                        <div className="metric-label">Total de Mensagens</div>
                      </div>
                      <div className="metric-secondary">
                        <div className="metric-item">
                          <Zap size={14} />
                          <span>{activeMessages} ativas</span>
                        </div>
                        <div className="metric-item">
                          <MessageCircle size={14} />
                          <span>{totalMessages - activeMessages} inativas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="project-footer">
                      <div className="project-date">
                        <span>Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="effectiveness-indicator">
                        <div className="effectiveness-bar">
                          <div 
                            className="effectiveness-fill" 
                            style={{ width: `${effectiveness}%` }}
                          ></div>
                        </div>
                        <span className="effectiveness-text">{effectiveness}% ativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Empty State */}
            {messageProjects.length === 0 && (
              <div className="empty-projects">
                <div className="empty-icon">
                  <MessageSquareText size={48} />
                </div>
                <h3>Nenhum projeto criado</h3>
                <p>Crie seu primeiro projeto para organizar suas mensagens automáticas</p>
                <button 
                  className="btn-modern btn-primary"
                  onClick={() => setShowProjectForm(true)}
                >
                  <Plus size={16} />
                  Criar Primeiro Projeto
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Messages View for Selected Project
        <div>
          <div className="messages-header-modern">
            <div className="messages-title-section">
              <button 
                className="btn-back"
                onClick={() => setSelectedProject(null)}
              >
                ← Voltar aos Projetos
              </button>
              <div className="title-with-icon">
                <div className="title-icon">
                  <MessageSquareText size={24} />
                </div>
                <div>
                  <h2>{selectedProject ? messageProjects.find(p => p.id === selectedProject)?.name : 'Mensagens Padrão'}</h2>
                  <p>Configure as respostas inteligentes do seu chatbot</p>
                </div>
              </div>
              <div className="messages-stats">
                <div className="stat-item">
                  <Zap size={16} />
                  <span>{getCurrentMessages().filter(msg => msg.active).length} Ativas</span>
                </div>
                <div className="stat-item">
                  <MessageCircle size={16} />
                  <span>{getCurrentMessages().length} Total</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn-modern btn-secondary"
                onClick={() => setShowFlowView(!showFlowView)}
              >
                {showFlowView ? <EyeOff size={16} /> : <Eye size={16} />}
                {showFlowView ? 'Ocultar Fluxo' : 'Ver Fluxo'}
              </button>
              <button 
                className="btn-modern btn-info"
                onClick={addHumanIntervention}
              >
                <UserCheck size={16} />
                + Intervenção Humana
              </button>
              <button 
                className="btn-modern btn-primary"
                onClick={() => setShowAddMessage(true)}
              >
                <Sparkles size={18} />
                Criar Mensagem
              </button>
            </div>
          </div>

          {/* Advanced Flow Editor */}
          {showFlowView && (
            <div className={`flow-editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
              {/* Flow Toolbar */}
              <div className="flow-toolbar">
                <div className="toolbar-left">
                  <div className="toolbar-section">
                    <Route size={18} />
                    <span>Editor Visual de Fluxo</span>
                  </div>
                  
                  <div className="toolbar-tools">
                    <button 
                      className={`tool-btn ${activeFlowTool === 'select' ? 'active' : ''}`}
                      onClick={() => setActiveFlowTool('select')}
                    >
                      <MousePointer size={16} />
                    </button>
                    <button 
                      className={`tool-btn ${activeFlowTool === 'connect' ? 'active' : ''}`}
                      onClick={() => setActiveFlowTool('connect')}
                    >
                      <Route size={16} />
                    </button>
                    <button 
                      className={`tool-btn ${activeFlowTool === 'pan' ? 'active' : ''}`}
                      onClick={() => setActiveFlowTool('pan')}
                    >
                      <Move size={16} />
                    </button>
                  </div>
                </div>

                <div className="toolbar-center">
                  <div className="flow-info">
                    <span>{flowState.nodes.length} nós</span>
                    <span>•</span>
                    <span>{flowState.connections.length} conexões</span>
                  </div>
                </div>

                <div className="toolbar-right">
                  <button className="toolbar-btn" title="Salvar">
                    <Save size={16} />
                  </button>
                  <button className="toolbar-btn" title="Exportar">
                    <Download size={16} />
                  </button>
                  <button className="toolbar-btn" title="Importar">
                    <Upload size={16} />
                  </button>
                  <button 
                    className="toolbar-btn" 
                    title={isFullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Flow Main Area */}
              <div className="flow-main-area">
                {/* Flow Canvas */}
                <div className="flow-canvas-compact">
                  <div 
                    className="flow-canvas"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Background Grid */}
                    <div className="flow-grid"></div>
                    
                    {/* Connections */}
                    <svg className="flow-connections">
                      {flowState.connections.map(connection => {
                        const sourceNode = flowState.nodes.find(n => n.id === connection.source)
                        const targetNode = flowState.nodes.find(n => n.id === connection.target)
                        
                        if (!sourceNode || !targetNode) return null
                        
                        const x1 = sourceNode.position.x + 75
                        const y1 = sourceNode.position.y + 40
                        const x2 = targetNode.position.x + 75
                        const y2 = targetNode.position.y
                        
                        // Curved connection
                        const midY = y1 + (y2 - y1) / 2
                        
                        return (
                          <path
                            key={connection.id}
                            d={`M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`}
                            stroke="#cbd5e0"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                          />
                        )
                      })}
                      
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                          refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e0" />
                        </marker>
                      </defs>
                    </svg>

                    {/* Flow Nodes */}
                    {flowState.nodes.map(node => {
                      const IconComponent = getNodeIcon(node.type)
                      const nodeColor = getNodeColor(node.type)
                      
                      return (
                        <div
                          key={node.id}
                          className={`flow-node-compact ${node.type}-node ${flowState.selectedNode === node.id ? 'selected' : ''} ${dragState.draggedNodeId === node.id ? 'dragging' : ''}`}
                          style={{
                            left: node.position.x,
                            top: node.position.y,
                            borderColor: nodeColor,
                            cursor: activeFlowTool === 'select' ? (dragState.draggedNodeId === node.id ? 'grabbing' : 'grab') : 'default',
                            zIndex: dragState.draggedNodeId === node.id ? 1000 : 2
                          }}
                          onClick={() => setFlowState(prev => ({ ...prev, selectedNode: node.id }))}
                          onDoubleClick={() => {
                            setFlowState(prev => ({ ...prev, selectedNode: node.id }))
                            setShowNodeEditor(true)
                          }}
                          onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                        >
                          <div className="node-header-compact" style={{ backgroundColor: nodeColor }}>
                            <IconComponent size={14} color="white" />
                            <span>{node.data.title}</span>
                            <button 
                              className="node-delete-compact"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFlowNode(node.id)
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                          
                          {(node.data.description || node.data.triggers || node.data.response) && (
                            <div className="node-body-compact">
                              {node.data.description && (
                                <p className="node-description-compact">{node.data.description}</p>
                              )}
                              
                              {node.data.triggers && (
                                <div className="node-triggers-compact">
                                  {node.data.triggers.slice(0, 2).map((trigger, idx) => (
                                    <span key={idx} className="trigger-tag-compact">{trigger}</span>
                                  ))}
                                </div>
                              )}
                              
                              {node.data.response && (
                                <p className="node-preview-compact">{node.data.response.substring(0, 30)}...</p>
                              )}
                            </div>
                          )}
                          
                          {/* Connection Points */}
                          <div className="connection-point-compact input" title="Entrada"></div>
                          <div className="connection-point-compact output" title="Saída"></div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right Sidebar - Node Palette */}
                <div className="flow-sidebar">
                  <div className="sidebar-header">
                    <h3>Adicionar Nós</h3>
                    <p>Arraste para o canvas</p>
                  </div>
                  
                  <div className="sidebar-content">
                    <div className="node-palette-vertical">
                      <button 
                        className="node-btn" 
                        onClick={() => addFlowNode('message', { x: 150, y: 100 })}
                      >
                        <MessageCircle size={16} />
                        <div className="node-btn-info">
                          <span>Mensagem</span>
                          <small>Resposta automática</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={() => addFlowNode('condition', { x: 150, y: 200 })}
                      >
                        <Diamond size={16} />
                        <div className="node-btn-info">
                          <span>Condição</span>
                          <small>Lógica condicional</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={() => addFlowNode('options', { x: 150, y: 300 })}
                      >
                        <List size={16} />
                        <div className="node-btn-info">
                          <span>Opções</span>
                          <small>Menu de escolhas</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={() => addFlowNode('human', { x: 150, y: 400 })}
                      >
                        <UserCheck size={16} />
                        <div className="node-btn-info">
                          <span>Atendimento</span>
                          <small>Transferir para humano</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={() => addFlowNode('end', { x: 150, y: 500 })}
                      >
                        <CheckCircle size={16} />
                        <div className="node-btn-info">
                          <span>Finalizar</span>
                          <small>Fim da conversa</small>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Properties Panel */}
              {showNodeEditor && flowState.selectedNode && (() => {
                const selectedNode = flowState.nodes.find(n => n.id === flowState.selectedNode)
                if (!selectedNode) return null
                
                return (
                  <div className="node-editor-panel">
                    <div className="panel-header">
                      <h3>Propriedades do Nó</h3>
                      <button onClick={() => setShowNodeEditor(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="panel-content">
                      <div className="node-property-form">
                        <div className="property-section">
                          <label className="property-label">
                            <Type size={16} />
                            Título do Nó
                          </label>
                          <input
                            type="text"
                            className="property-input"
                            value={selectedNode.data.title}
                            onChange={(e) => {
                              setFlowState(prev => ({
                                ...prev,
                                nodes: prev.nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, title: e.target.value } }
                                    : node
                                )
                              }))
                            }}
                            placeholder="Digite o título do nó"
                          />
                        </div>

                        {selectedNode.data.description !== undefined && (
                          <div className="property-section">
                            <label className="property-label">
                              <MessageSquare size={16} />
                              Descrição
                            </label>
                            <textarea
                              className="property-textarea"
                              value={selectedNode.data.description || ''}
                              onChange={(e) => {
                                setFlowState(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, description: e.target.value } }
                                      : node
                                  )
                                }))
                              }}
                              placeholder="Digite a descrição do nó"
                              rows={3}
                            />
                          </div>
                        )}

                        {selectedNode.data.triggers && (
                          <div className="property-section">
                            <label className="property-label">
                              <Tag size={16} />
                              Palavras-chave (Gatilhos)
                            </label>
                            <input
                              type="text"
                              className="property-input"
                              value={selectedNode.data.triggers.join(', ')}
                              onChange={(e) => {
                                const triggers = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                setFlowState(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, triggers } }
                                      : node
                                  )
                                }))
                              }}
                              placeholder="Ex: oi, olá, menu (separadas por vírgula)"
                            />
                            <small className="property-help">Digite as palavras que ativarão esta resposta</small>
                          </div>
                        )}

                        {selectedNode.data.response !== undefined && (
                          <div className="property-section">
                            <label className="property-label">
                              <MessageCircle size={16} />
                              Resposta Automática
                            </label>
                            <textarea
                              className="property-textarea"
                              value={selectedNode.data.response || ''}
                              onChange={(e) => {
                                setFlowState(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, response: e.target.value } }
                                      : node
                                  )
                                }))
                              }}
                              placeholder="Digite a resposta que será enviada automaticamente..."
                              rows={6}
                            />
                            <small className="property-help">
                              💡 Dica: Use <code>{'{name}'}</code> para incluir o nome do contato
                            </small>
                          </div>
                        )}

                        {selectedNode.data.active !== undefined && (
                          <div className="property-section">
                            <label className="property-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedNode.data.active}
                                onChange={(e) => {
                                  setFlowState(prev => ({
                                    ...prev,
                                    nodes: prev.nodes.map(node =>
                                      node.id === selectedNode.id
                                        ? { ...node, data: { ...node.data, active: e.target.checked } }
                                        : node
                                    )
                                  }))
                                }}
                              />
                              <Zap size={16} />
                              Mensagem Ativa
                            </label>
                            <small className="property-help">Desmarque para desativar esta mensagem temporariamente</small>
                          </div>
                        )}

                        <div className="property-actions">
                          <button 
                            className="btn-modern btn-secondary"
                            onClick={() => setShowNodeEditor(false)}
                          >
                            <X size={16} />
                            Fechar
                          </button>
                          <button 
                            className="btn-modern btn-primary"
                            onClick={() => {
                              // Salvar alterações no projeto atual
                              if (selectedProject && selectedNode.data.triggers && selectedNode.data.response) {
                                const nodeMessage: AutoMessage = {
                                  id: selectedNode.id.replace('message-', ''),
                                  trigger: selectedNode.data.triggers,
                                  response: selectedNode.data.response,
                                  active: selectedNode.data.active || true
                                }
                                
                                const currentMessages = getCurrentMessages()
                                const updatedMessages = currentMessages.map(msg => 
                                  msg.id === nodeMessage.id ? nodeMessage : msg
                                )
                                
                                updateCurrentMessages(updatedMessages)
                              }
                              setShowNodeEditor(false)
                            }}
                          >
                            <Save size={16} />
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Add New Message Form */}
          {showAddMessage && (
            <div className="message-form-modern">
              <div className="form-header-modern">
                <div className="form-title-section">
                  <div className="form-icon">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3>Criar Nova Mensagem</h3>
                    <p>Configure uma resposta automática inteligente</p>
                  </div>
                </div>
                <button 
                  className="btn-close"
                  onClick={() => setShowAddMessage(false)}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="form-content-modern">
                <div className="form-section">
                  <div className="form-group-modern">
                    <label className="label-modern">
                      <Tag size={16} />
                      Palavras-chave (gatilhos)
                    </label>
                    <input
                      className="input-modern"
                      type="text"
                      placeholder="Ex: oi, olá, bom dia, menu (separadas por vírgula)"
                      value={Array.isArray(newAutoMessage.trigger) ? newAutoMessage.trigger.join(', ') : ''}
                      onChange={(e) => setNewAutoMessage({
                        ...newAutoMessage,
                        trigger: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      })}
                    />
                    <small className="help-text">Digite as palavras que ativarão esta resposta</small>
                  </div>

                  <div className="form-group-modern">
                    <label className="label-modern">
                      <MessageSquare size={16} />
                      Resposta automática
                    </label>
                    <textarea
                      className="textarea-modern"
                      placeholder="Digite a resposta que será enviada automaticamente..."
                      value={newAutoMessage.response || ''}
                      onChange={(e) => setNewAutoMessage({
                        ...newAutoMessage,
                        response: e.target.value
                      })}
                      rows={5}
                    />
                    <small className="help-text">
                      💡 Dica: Use <code>{'{name}'}</code> para incluir o nome do contato
                    </small>
                  </div>
                </div>

                <div className="form-actions-modern">
                  <button 
                    className="btn-modern btn-secondary"
                    onClick={() => setShowAddMessage(false)}
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                  <button 
                    className="btn-modern btn-primary"
                    onClick={addAutoMessage}
                  >
                    <Check size={16} />
                    Criar Mensagem
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="messages-list-modern">
            {getCurrentMessages().map((message) => (
              <div key={message.id} className={`message-card-modern ${!message.active ? 'inactive' : ''}`}>
                {editingMessage?.id === message.id ? (
                  // Edit Form
                  <div className="message-edit-modern">
                    <div className="edit-header">
                      <Edit3 size={18} />
                      <span>Editando Mensagem</span>
                    </div>
                    
                    <div className="edit-content">
                      <div className="form-group-modern">
                        <label className="label-modern">
                          <Tag size={14} />
                          Palavras-chave
                        </label>
                        <input
                          className="input-modern"
                          type="text"
                          value={editingMessage.trigger.join(', ')}
                          onChange={(e) => setEditingMessage({
                            ...editingMessage,
                            trigger: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                          })}
                        />
                      </div>
                      
                      <div className="form-group-modern">
                        <label className="label-modern">
                          <MessageSquare size={14} />
                          Resposta
                        </label>
                        <textarea
                          className="textarea-modern"
                          value={editingMessage.response}
                          onChange={(e) => setEditingMessage({
                            ...editingMessage,
                            response: e.target.value
                          })}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button 
                        className="btn-modern btn-secondary"
                        onClick={() => setEditingMessage(null)}
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                      <button 
                        className="btn-modern btn-primary"
                        onClick={() => updateAutoMessage(editingMessage)}
                      >
                        <Check size={14} />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div className="message-header-card">
                      <div className="message-status">
                        {message.active ? (
                          <div className="status-active">
                            <Zap size={14} />
                            <span>Ativa</span>
                          </div>
                        ) : (
                          <div className="status-inactive">
                            <X size={14} />
                            <span>Inativa</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="message-actions-modern">
                        <button
                          className="action-btn toggle-btn"
                          onClick={() => toggleMessageActive(message.id)}
                          title={message.active ? 'Desativar' : 'Ativar'}
                        >
                          {message.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        
                        <button
                          className="action-btn edit-btn"
                          onClick={() => setEditingMessage(message)}
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteAutoMessage(message.id)}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="message-content-modern">
                      <div className="triggers-section">
                        <div className="section-label">
                          <Tag size={14} />
                          <span>Gatilhos</span>
                        </div>
                        <div className="triggers-container">
                          {message.trigger.map((trigger, index) => (
                            <span key={index} className="trigger-chip">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="response-section">
                        <div className="section-label">
                          <MessageSquare size={14} />
                          <span>Resposta</span>
                        </div>
                        <div className="response-preview">
                          {message.response}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {getCurrentMessages().length === 0 && (
              <div className="empty-state-modern">
                <div className="empty-icon-container">
                  <MessageSquareText size={64} />
                </div>
                <div className="empty-content">
                  <h3>Nenhuma mensagem criada ainda</h3>
                  <p>Comece criando sua primeira resposta automática inteligente para o chatbot</p>
                  <button 
                    className="btn-modern btn-primary"
                    onClick={() => setShowAddMessage(true)}
                  >
                    <Sparkles size={16} />
                    Criar Primeira Mensagem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
