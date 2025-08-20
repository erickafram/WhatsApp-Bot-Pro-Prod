import { useState, useEffect, useRef } from 'react'
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
  List,
  Send,
  Phone
} from 'lucide-react'

interface AutoTemplate {
  id: string
  trigger: string[]
  response: string
  active: boolean
}

interface TemplateProject {
  id: string
  name: string
  description: string
  templates: AutoTemplate[]
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

interface TemplatesProps {
  socket: any | null
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  nodeId?: string
}

interface SimulationState {
  isActive: boolean
  currentNodeId: string | null
  chatHistory: ChatMessage[]
  awaitingInput: boolean
}

function Templates({ }: TemplatesProps) {
    // States for Template Projects
  const [templateProjects, setTemplateProjects] = useState<TemplateProject[]>([])  
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Legacy state - will be migrated to projects
  const [autoTemplates, setAutoTemplates] = useState<AutoTemplate[]>([
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
  const [editingTemplate, setEditingTemplate] = useState<AutoTemplate | null>(null)
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [showFlowView, setShowFlowView] = useState(false)
  const [newAutoTemplate, setNewAutoTemplate] = useState<Partial<AutoTemplate>>({
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

  // Chat Simulation States
  const [showChatSimulator, setShowChatSimulator] = useState(false)
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    currentNodeId: null,
    chatHistory: [],
    awaitingInput: false
  })
  const [userInput, setUserInput] = useState('')
  const chatMessagesRef = useRef<HTMLDivElement>(null)
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
          templates: [], // Será carregado depois
          isActive: project.is_active,
          isDefault: project.is_default,
          createdAt: new Date(project.created_at)
        }))
        
        setTemplateProjects(convertedProjects)
        
        // Encontrar projeto padrão
        const defaultProject = data.projects.find((p: any) => p.is_default)
        if (defaultProject) {
          setDefaultProjectId(defaultProject.id.toString())
          console.log('🌟 Projeto padrão encontrado:', defaultProject.name)
          
          // Carregar templates do projeto padrão
          await loadProjectTemplates(defaultProject.id)
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

  // Função para carregar templates de um projeto específico
  const loadProjectTemplates = async (projectId: number) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      console.log(`🔍 Carregando templates do projeto ${projectId}...`)
      
      const response = await fetch(`/api/messages/projects/${projectId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Templates carregados do banco:', data.messages)
        
        // Converter formato do banco para formato do frontend
        const convertedTemplates = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          trigger: msg.trigger_words,
          response: msg.response_text,
          active: msg.is_active
        }))
        
        // Atualizar os templates automáticos
        setAutoTemplates(convertedTemplates)
        
        // Atualizar também o projeto com os templates
        setTemplateProjects(prev => prev.map(project => 
          project.id === projectId.toString() 
            ? { ...project, templates: convertedTemplates }
            : project
        ))
        
        console.log(`✅ ${convertedTemplates.length} templates carregados para o projeto ${projectId}`)
      } else {
        console.error('❌ Erro ao carregar templates:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar templates do banco:', error)
    }
  }

  // Auto Templates Management Functions
  const addAutoTemplate = async () => {
    if (newAutoTemplate.trigger && newAutoTemplate.response && defaultProjectId) {
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
            trigger_words: Array.isArray(newAutoTemplate.trigger) ? newAutoTemplate.trigger : [newAutoTemplate.trigger],
            response_text: newAutoTemplate.response,
            is_active: newAutoTemplate.active || true,
            order_index: autoTemplates.length
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Mensagem criada no banco:', data.message)
          
          // Recarregar templates do projeto
          await loadProjectTemplates(parseInt(defaultProjectId))
          
      setNewAutoTemplate({ trigger: [], response: '', active: true })
      setShowAddTemplate(false)
        } else {
          console.error('❌ Erro ao criar template:', response.statusText)
          alert('Erro ao criar template. Tente novamente.')
        }
      } catch (error) {
        console.error('❌ Erro ao criar template no banco:', error)
        alert('Erro ao criar template. Tente novamente.')
      }
    }
  }

  const updateAutoTemplate = async (updatedTemplate: AutoTemplate) => {
    try {
      // Save to database if we have a selected project
      if (selectedProject && selectedProject !== 'default') {
        await updateAutoTemplateInDatabase(updatedTemplate)
      }
      
      // Update local state
    const currentTemplates = getCurrentTemplates()
    updateCurrentTemplates(currentTemplates.map(tpl => 
      tpl.id === updatedTemplate.id ? updatedTemplate : tpl
    ))
    setEditingTemplate(null)
    } catch (error) {
      console.error('❌ Erro ao atualizar template:', error)
      alert('Erro ao salvar template. Tente novamente.')
    }
  }

  // Function to save template updates to database
  const updateAutoTemplateInDatabase = async (updatedTemplate: AutoTemplate) => {
    try {
      setIsSaving(true)
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('💾 Salvando alterações do template no banco:', updatedTemplate.id)
      
      const response = await fetch(`/api/messages/messages/${updatedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger_words: Array.isArray(updatedTemplate.trigger) ? updatedTemplate.trigger : [updatedTemplate.trigger],
          response_text: updatedTemplate.response,
          is_active: updatedTemplate.active,
          order_index: 0 // You may want to track this properly
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Template atualizado no banco:', data.message)
      } else {
        console.error('❌ Erro ao atualizar template:', response.statusText)
        throw new Error('Falha ao salvar no banco de dados')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar template no banco:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAutoTemplate = (id: string) => {
    const currentTemplates = getCurrentTemplates()
    updateCurrentTemplates(currentTemplates.filter(tpl => tpl.id !== id))
  }

  const toggleTemplateActive = (id: string) => {
    const currentTemplates = getCurrentTemplates()
    updateCurrentTemplates(currentTemplates.map(tpl => 
      tpl.id === id ? { ...tpl, active: !tpl.active } : tpl
    ))
  }

  const addHumanIntervention = () => {
    const humanTemplate: AutoTemplate = {
      id: 'human-' + Date.now().toString(),
      trigger: ['falar com humano', 'atendente', 'suporte humano', 'pessoa real', 'operador'],
      response: '🙋‍♀️ Entendi que você gostaria de falar com um atendente humano.\n\nVou transferir você para nossa equipe de suporte. Em alguns instantes um de nossos especialistas entrará em contato.\n\n⏰ Horário de atendimento: Segunda a Sexta, 8h às 18h\n\nObrigado pela paciência! 😊',
      active: true
    }
    const currentTemplates = getCurrentTemplates()
    updateCurrentTemplates([...currentTemplates, humanTemplate])
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
        const convertedProject: TemplateProject = {
          id: data.project.id.toString(),
          name: data.project.name,
          description: data.project.description || '',
        templates: [],
          createdAt: new Date(data.project.created_at).toISOString(),
          isActive: data.project.is_active,
          isDefault: data.project.is_default
      }
          
          setTemplateProjects([...templateProjects, convertedProject])
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
    setTemplateProjects(templateProjects.filter(p => p.id !== projectId))
    if (selectedProject === projectId) {
      setSelectedProject(null)
    }
  }

  const toggleProjectActive = (projectId: string) => {
    setTemplateProjects(templateProjects.map(p => 
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
    setTemplateProjects(templateProjects.map(p => 
      ({ ...p, isDefault: p.id === projectId })
    ))
        
        // Carregar templates do novo projeto padrão
        await loadProjectTemplates(parseInt(projectId))
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
    const busTicketTemplates: AutoTemplate[] = [
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

    const project: TemplateProject = {
      id: `bus-ticket-${Date.now()}`,
      name: 'Vendas de Passagem de Ônibus',
      description: 'Fluxo otimizado para vendas de passagens com sistema inteligente de verificação de cidades (6 templates ao invés de 39)',
      templates: busTicketTemplates,
      createdAt: new Date().toISOString(),
      isActive: true,
      isDefault: false
    }

    setTemplateProjects([...templateProjects, project])
    setSelectedProject(project.id)
    return project
  }

  const getCurrentTemplates = (): AutoTemplate[] => {
    if (!selectedProject) return autoTemplates
    const project = templateProjects.find(p => p.id === selectedProject)
    return project ? project.templates : []
  }

  const updateCurrentTemplates = (templates: AutoTemplate[]) => {
    if (!selectedProject) {
      setAutoTemplates(templates)
    } else {
      setTemplateProjects(templateProjects.map(p => 
        p.id === selectedProject ? { ...p, templates } : p
      ))
    }
  }

  // Convert AutoTemplates to FlowNodes
  const convertTemplatesToFlow = (templates: AutoTemplate[]): { nodes: FlowNode[], connections: FlowConnection[] } => {
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

    // Find welcome template (with oi, olá, menu triggers)
    const welcomeTpl = templates.find(tpl =>
      tpl.trigger.some(t => ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite', 'bom dia', 'boa tarde', 'boa noite'].includes(t.toLowerCase()))
    )

    let welcomeNode: FlowNode | null = null
    if (welcomeTpl) {
      welcomeNode = {
        id: `template-${welcomeTpl.id}`,
        type: 'message',
        position: { x: 50, y: 150 },
        data: {
          title: 'Boas-vindas',
          triggers: welcomeTpl.trigger,
          response: welcomeTpl.response,
          active: welcomeTpl.active
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

    // Find menu options (1, 2, 3, 4, 5) - these are the actual responses to user choices
    const menuOptions = templates.filter(tpl =>
      tpl.trigger.some(t => ['1', '2', '3', '4', '5'].includes(t)) &&
      !tpl.trigger.some(t => ['oi', 'olá', 'menu', 'dia', 'tarde', 'noite', 'bom dia', 'boa tarde', 'boa noite'].includes(t.toLowerCase()))
    ).sort((a, b) => {
      const aNum = parseInt(a.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t)) || '0')
      const bNum = parseInt(b.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t)) || '0')
      return aNum - bNum
    })

    // Create option nodes
    menuOptions.forEach((option, index) => {
      const optionNumber = option.trigger.find(t => ['1', '2', '3', '4', '5'].includes(t))
      let optionTitle = `Opção ${optionNumber}`

      // Set more descriptive titles based on content
      if (option.trigger.some(t => ['comprar', 'passagem', 'bilhete'].includes(t.toLowerCase()))) {
        optionTitle = `Opção ${optionNumber} - Comprar Passagem`
      } else if (option.trigger.some(t => ['horários', 'horario', 'hora'].includes(t.toLowerCase()))) {
        optionTitle = `Opção ${optionNumber} - Ver Horários`
      } else if (option.trigger.some(t => ['operador', 'atendente', 'humano', 'pessoa'].includes(t.toLowerCase()))) {
        optionTitle = `Opção ${optionNumber} - Falar com Operador`
      }

      const optionNode: FlowNode = {
        id: `template-${option.id}`,
        type: 'message',
        position: { x: 300 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 120 },
        data: {
          title: optionTitle,
          triggers: option.trigger,
          response: option.response,
          active: option.active
        },
        connections: []
      }
      nodes.push(optionNode)

      // Connect welcome to options if welcome exists
      if (welcomeNode) {
        connections.push({
          id: `${welcomeNode.id}-${optionNode.id}`,
          source: welcomeNode.id,
          target: optionNode.id
        })
        welcomeNode.connections.push(optionNode.id)
      }
    })

    // Find special templates (CIDADE_DISPONIVEL, CIDADE_NAO_DISPONIVEL, etc.)
    const specialTemplates = templates.filter(tpl =>
      tpl.trigger.some(t => t.includes('CIDADE_') || t.includes('_DISPONIVEL') || t.includes('_NAO_DISPONIVEL'))
    )

    // Add special templates as separate nodes
    specialTemplates.forEach((template, index) => {
      let nodeTitle = 'Template Especial'
      if (template.trigger.some(t => t.includes('CIDADE_DISPONIVEL'))) {
        nodeTitle = 'Cidade Disponível'
      } else if (template.trigger.some(t => t.includes('CIDADE_NAO_DISPONIVEL'))) {
        nodeTitle = 'Cidade Não Disponível'
      }

      const specialNode: FlowNode = {
        id: `template-${template.id}`,
        type: 'condition',
        position: { x: 50 + (index * 250), y: 400 },
        data: {
          title: nodeTitle,
          triggers: template.trigger,
          response: template.response,
          active: template.active
        },
        connections: []
      }
      nodes.push(specialNode)

      // Connect from comprar passagem option if it exists
      const comprarOption = menuOptions.find(opt =>
        opt.trigger.some(t => ['comprar', 'passagem', '1'].includes(t.toLowerCase()))
      )
      if (comprarOption) {
        const comprarNodeId = `template-${comprarOption.id}`
        connections.push({
          id: `${comprarNodeId}-${specialNode.id}`,
          source: comprarNodeId,
          target: specialNode.id
        })
        const comprarFlowNode = nodes.find(n => n.id === comprarNodeId)
        if (comprarFlowNode) {
          comprarFlowNode.connections.push(specialNode.id)
        }
      }
    })

    // Find human intervention template (operador option)
    const humanTpl = menuOptions.find(tpl =>
      tpl.trigger.some(t => ['3', 'operador', 'atendente', 'humano', 'pessoa'].includes(t.toLowerCase()))
    )

    if (humanTpl) {
      // Convert the operador option to human type
      const humanNodeIndex = nodes.findIndex(n => n.id === `template-${humanTpl.id}`)
      if (humanNodeIndex !== -1) {
        nodes[humanNodeIndex].type = 'human'
        nodes[humanNodeIndex].data.title = 'Atendimento Humano'
        nodes[humanNodeIndex].position = { x: 50, y: 300 }
      }
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

    // Connect all leaf nodes to end (except human intervention)
    nodes.forEach(node => {
      if (node.connections.length === 0 &&
          node.id !== endNode.id &&
          node.id !== startNode.id &&
          node.type !== 'human') {
        connections.push({
          id: `${node.id}-${endNode.id}`,
          source: node.id,
          target: endNode.id
        })
        node.connections.push(endNode.id)
      }
    })

    return { nodes, connections }
  }

  // Update flow when templates change or flow view is opened
  useEffect(() => {
    const currentTemplates = getCurrentTemplates()
    if (showFlowView && currentTemplates.length > 0) {
      const { nodes, connections } = convertTemplatesToFlow(currentTemplates)
      setFlowState(prev => ({
        ...prev,
        nodes,
        connections
      }))
    }
  }, [showFlowView, autoTemplates, templateProjects, selectedProject])

  // Auto-save message projects to database when they change
  useEffect(() => {
    const saveProjectsToDatabase = async () => {
      // Only save if we have projects and a selected project that's not default
      if (templateProjects.length > 0 && selectedProject && selectedProject !== 'default') {
        const currentProject = templateProjects.find((p: TemplateProject) => p.id === selectedProject)
        if (currentProject && currentProject.templates.length > 0) {
          try {
            console.log('💾 Salvamento automático do projeto:', currentProject.name)
            
            // Save each template that might have been modified
            for (const template of currentProject.templates) {
              // Check if template exists in database (has numeric ID)
              if (!isNaN(Number(template.id))) {
                await updateAutoTemplateInDatabase(template)
              }
            }
            
            console.log('✅ Salvamento automático concluído')
          } catch (error) {
            console.error('❌ Erro no salvamento automático:', error)
          }
        }
      }
    }

    // Debounce the save operation to avoid too many requests
    const timeoutId = setTimeout(() => {
      saveProjectsToDatabase()
    }, 2000) // Save 2 seconds after the last change

    return () => clearTimeout(timeoutId)
      }, [templateProjects, selectedProject])

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current && simulationState.chatHistory.length > 0) {
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
        }
      }, 100)
    }
  }, [simulationState.chatHistory])

  // Chat Simulation Functions
  const startChatSimulation = () => {
    const startNode = flowState.nodes.find(node => node.type === 'start')
    if (!startNode) {
      alert('Nenhum nó de início encontrado no fluxo!')
      return
    }

    setSimulationState({
      isActive: true,
      currentNodeId: startNode.id,
      chatHistory: [{
        id: Date.now().toString(),
        type: 'bot',
        content: '👋 Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo?',
        timestamp: new Date()
      }],
      awaitingInput: true
    })
    setShowChatSimulator(true)
  }

  const stopChatSimulation = () => {
    setSimulationState({
      isActive: false,
      currentNodeId: null,
      chatHistory: [],
      awaitingInput: false
    })
    setShowChatSimulator(false)
    setUserInput('')
  }

  const sendUserMessage = () => {
    if (!userInput.trim() || !simulationState.isActive) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    // Add user message to chat and show typing indicator
    setSimulationState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage],
      awaitingInput: false
    }))

    // Process user input and find matching template
    const currentTemplates = getCurrentTemplates()
    const matchingTemplate = currentTemplates.find(template =>
      template.active && template.trigger.some(trigger =>
        userInput.toLowerCase().includes(trigger.toLowerCase())
      )
    )

    setTimeout(() => {
      if (matchingTemplate) {
        // Replace {name} placeholder with a default name
        const responseText = matchingTemplate.response.replace(/{name}/g, 'Usuário')

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: responseText,
          timestamp: new Date(),
          nodeId: matchingTemplate.id
        }

        setSimulationState(prev => ({
          ...prev,
          chatHistory: [...prev.chatHistory, botMessage],
          awaitingInput: true,
          currentNodeId: `template-${matchingTemplate.id}`
        }))
      } else {
        // No matching template found
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: '🤔 Desculpe, não entendi sua mensagem. Você pode tentar novamente ou digitar "menu" para ver as opções disponíveis.',
          timestamp: new Date()
        }

        setSimulationState(prev => ({
          ...prev,
          chatHistory: [...prev.chatHistory, botMessage],
          awaitingInput: true
        }))
      }
    }, 1000) // Simulate typing delay

    setUserInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendUserMessage()
    }
  }

  // Advanced Flow Functions
  const addFlowNode = async (type: FlowNode['type'], position: { x: number; y: number }) => {
    const nodeId = `${type}-${Date.now()}`
    const newNode: FlowNode = {
      id: nodeId,
      type,
      position,
      data: getDefaultNodeData(type),
      connections: []
    }
    
    // If it's a message node and we have a selected project, create template in database
    if (type === 'message' && selectedProject && selectedProject !== 'default') {
      try {
        const newTemplate: AutoTemplate = {
          id: nodeId.replace('template-', ''),
          trigger: ['novo'],
          response: 'Nova resposta automática',
          active: true
        }
        
        // Create in database first
        const dbResult = await createAutoTemplateInDatabase(newTemplate)
        
        // Update node ID with database ID
        if (dbResult && dbResult.autoMessage && dbResult.autoMessage.id) {
          newNode.id = `template-${dbResult.autoMessage.id}`
          newNode.data = {
            ...newNode.data,
            triggers: newTemplate.trigger,
            response: newTemplate.response,
            active: newTemplate.active
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao criar template no banco:', error)
        alert('Erro ao criar novo template. Será criado apenas localmente.')
      }
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
        return { title: 'Novo Template', triggers: [''], response: '', active: true }
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

  // Function to save entire flow to database
  const saveFlowToDatabase = async () => {
    if (!selectedProject || selectedProject === 'default') {
      alert('Selecione um projeto para salvar o fluxo.')
      return
    }

    try {
      setIsSaving(true)
      console.log('💾 Salvando fluxo completo no banco de dados...')
      
      const currentProject = templateProjects.find(p => p.id === selectedProject)
      if (!currentProject) {
        throw new Error('Projeto não encontrado')
      }

      // Save all templates from the current project
      for (const template of currentProject.templates) {
        if (!isNaN(Number(template.id))) {
          // Existing template - update
          await updateAutoTemplateInDatabase(template)
        } else {
          // New template - create
          await createAutoTemplateInDatabase(template)
        }
      }

      console.log('✅ Fluxo salvo com sucesso!')
      alert('Fluxo salvo com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao salvar fluxo:', error)
      alert('Erro ao salvar fluxo. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Function to create new template in database
  const createAutoTemplateInDatabase = async (template: AutoTemplate) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/messages/auto-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: selectedProject,
          trigger_words: JSON.stringify(template.trigger),
          response_text: template.response,
          is_active: template.active,
          order_index: 0
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao criar template no banco de dados')
      }

      const data = await response.json()
      console.log('✅ Novo template criado no banco:', data.message)
      return data
      
    } catch (error) {
      console.error('❌ Erro ao criar template no banco:', error)
      throw error
    }
  }

  // Function to delete template from database
  const deleteAutoTemplateFromDatabase = async (templateId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado')
      }

      console.log(`🗑️ Iniciando exclusão do template ${templateId} no banco...`)

      const response = await fetch(`/api/messages/auto-messages/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Resposta de erro do servidor:', errorData)
        throw new Error(`Falha ao excluir template do banco de dados: ${response.status} ${response.statusText}`)
      }

      const result = await response.json().catch(() => ({}))
      console.log('✅ Template excluído do banco com sucesso:', result)
      
      // Force reload templates to ensure sync
      if (selectedProject && selectedProject !== 'default') {
        console.log('🔄 Recarregando templates após exclusão...')
        await loadProjectTemplates(parseInt(selectedProject))
      }
      
    } catch (error) {
      console.error('❌ Erro ao excluir template do banco:', error)
      throw error
    }
  }

  const deleteFlowNode = async (nodeId: string) => {
    console.log(`🗑️ Iniciando exclusão do nó: ${nodeId}`)
    
    const nodeToDelete = flowState.nodes.find(node => node.id === nodeId)
    if (!nodeToDelete) {
      console.warn(`⚠️ Nó ${nodeId} não encontrado no estado`)
      return
    }

    // First remove from visual flow state immediately for better UX
    setFlowState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.source !== nodeId && conn.target !== nodeId
      ),
      selectedNode: prev.selectedNode === nodeId ? null : prev.selectedNode
    }))
    
    // If this is a template node that corresponds to a database entry, delete from database too
    if (selectedProject && selectedProject !== 'default') {
      try {
        // Extract template ID from node ID
        let templateId = nodeId
        if (nodeId.startsWith('template-')) {
          templateId = nodeId.replace('template-', '')
        } else if (nodeId.includes('-')) {
          const parts = nodeId.split('-')
          templateId = parts[parts.length - 1]
        }
        
        // Only delete from database if it's a valid numeric ID
        if (!isNaN(Number(templateId)) && Number(templateId) > 0) {
          console.log(`🗑️ Excluindo template ${templateId} do banco de dados...`)
          await deleteAutoTemplateFromDatabase(templateId)
          console.log(`✅ Exclusão completa do template ${templateId}`)
        } else {
          console.log(`ℹ️ Nó ${nodeId} não tem ID de template válido, removido apenas visualmente`)
        }
      } catch (error) {
        console.error('❌ Erro ao excluir template do banco:', error)
        alert(`Erro ao excluir template do banco de dados: ${error instanceof Error ? error.message : String(error)}`)
        
        // Rollback: add the node back to the flow state
        setFlowState(prev => ({
          ...prev,
          nodes: [...prev.nodes, nodeToDelete]
        }))
        return
      }
    }
    
    console.log(`✅ Nó ${nodeId} removido completamente`)
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
                  <h2>Projetos de Templates</h2>
                  <p>Organize seus templates de resposta em projetos</p>
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
                    <div className="metric-value">{autoTemplates.length}</div>
                    <div className="metric-label">Total de Templates</div>
                  </div>
                  <div className="metric-secondary">
                    <div className="metric-item">
                      <Zap size={14} />
                      <span>{autoTemplates.filter(tpl => tpl.active).length} ativas</span>
                    </div>
                    <div className="metric-item">
                      <MessageCircle size={14} />
                      <span>{autoTemplates.filter(tpl => !tpl.active).length} inativas</span>
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
                        style={{ width: `${Math.round((autoTemplates.filter((tpl: AutoTemplate) => tpl.active).length / autoTemplates.length) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="effectiveness-text">
                      {Math.round((autoTemplates.filter((tpl: AutoTemplate) => tpl.active).length / autoTemplates.length) * 100)}% ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Projects */}
            {templateProjects.map((project: TemplateProject) => {
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
              const activeTemplates = project.templates.filter((tpl: AutoTemplate) => tpl.active).length
              const totalTemplates = project.templates.length
              const effectiveness = totalTemplates > 0 ? Math.round((activeTemplates / totalTemplates) * 100) : 0

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
                    <p>{project.description || 'Projeto de templates personalizados'}</p>
                    
                    <div className="project-metrics">
                      <div className="metric-primary">
                        <div className="metric-value">{totalTemplates}</div>
                        <div className="metric-label">Total de Templates</div>
                      </div>
                      <div className="metric-secondary">
                        <div className="metric-item">
                          <Zap size={14} />
                          <span>{activeTemplates} ativas</span>
                        </div>
                        <div className="metric-item">
                          <MessageCircle size={14} />
                          <span>{totalTemplates - activeTemplates} inativas</span>
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
            {templateProjects.length === 0 && (
              <div className="empty-projects">
                <div className="empty-icon">
                  <MessageSquareText size={48} />
                </div>
                <h3>Nenhum projeto criado</h3>
                <p>Crie seu primeiro projeto para organizar seus templates de resposta</p>
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
        // Templates View for Selected Project
        <div>
          <div className="templates-header-modern">
            <div className="templates-title-section">
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
                  <h2>{selectedProject ? templateProjects.find(p => p.id === selectedProject)?.name : 'Templates Padrão'}</h2>
                  <p>Configure os templates de resposta do seu chatbot</p>
                </div>
              </div>
              <div className="templates-stats">
                <div className="stat-item">
                  <Zap size={16} />
                  <span>{getCurrentTemplates().filter(tpl => tpl.active).length} Ativas</span>
                </div>
                <div className="stat-item">
                  <MessageCircle size={16} />
                  <span>{getCurrentTemplates().length} Total</span>
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
                className="btn-modern btn-success"
                onClick={startChatSimulation}
                disabled={getCurrentTemplates().length === 0}
              >
                <PlayCircle size={16} />
                Simular Conversa
              </button>
              <button
                className="btn-modern btn-primary"
                onClick={() => setShowAddTemplate(true)}
              >
                <Sparkles size={18} />
                Criar Template
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
                    {isSaving && (
                      <>
                        <span>•</span>
                        <span className="saving-indicator">
                          <div className="saving-spinner"></div>
                          Salvando...
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="toolbar-right">
                  <button 
                    className="toolbar-btn" 
                    title="Salvar Fluxo"
                    onClick={saveFlowToDatabase}
                  >
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
                        onClick={async () => await addFlowNode('message', { x: 150, y: 100 })}
                      >
                        <MessageCircle size={16} />
                        <div className="node-btn-info">
                          <span>Template</span>
                          <small>Resposta automática</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={async () => await addFlowNode('condition', { x: 150, y: 200 })}
                      >
                        <Diamond size={16} />
                        <div className="node-btn-info">
                          <span>Condição</span>
                          <small>Lógica condicional</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={async () => await addFlowNode('options', { x: 150, y: 300 })}
                      >
                        <List size={16} />
                        <div className="node-btn-info">
                          <span>Opções</span>
                          <small>Menu de escolhas</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={async () => await addFlowNode('human', { x: 150, y: 400 })}
                      >
                        <UserCheck size={16} />
                        <div className="node-btn-info">
                          <span>Atendimento</span>
                          <small>Transferir para humano</small>
                        </div>
                      </button>
                      
                      <button 
                        className="node-btn" 
                        onClick={async () => await addFlowNode('end', { x: 150, y: 500 })}
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
                            onClick={async () => {
                              // Salvar alterações no projeto atual
                              if (selectedProject && selectedNode.data.triggers && selectedNode.data.response) {
                                const nodeTemplate: AutoTemplate = {
                                  id: selectedNode.id.replace('template-', ''),
                                  trigger: selectedNode.data.triggers,
                                  response: selectedNode.data.response,
                                  active: selectedNode.data.active || true
                                }
                                
                                try {
                                  // Save to database first
                                  if (selectedProject !== 'default') {
                                    await updateAutoTemplateInDatabase(nodeTemplate)
                                  }
                                  
                                  // Update local state
                                const currentTemplates = getCurrentTemplates()
                                const updatedTemplates = currentTemplates.map(tpl => 
                                  tpl.id === nodeTemplate.id ? nodeTemplate : tpl
                                )
                                
                                updateCurrentTemplates(updatedTemplates)
                                  
                                  // Show success message
                                  console.log('✅ Alterações salvas com sucesso!')
                                  
                                } catch (error) {
                                  console.error('❌ Erro ao salvar alterações:', error)
                                  alert('Erro ao salvar alterações. Tente novamente.')
                                  return // Don't close editor if save failed
                                }
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

          {/* Chat Simulator */}
          {showChatSimulator && (
            <div className="chat-simulator-overlay">
              <div className="chat-simulator-container">
                <div className="chat-simulator-header">
                  <div className="chat-header-info">
                    <div className="chat-avatar">
                      <Phone size={20} />
                    </div>
                    <div className="chat-contact-info">
                      <h3>Simulação WhatsApp</h3>
                      <span className="chat-status">
                        <div className="status-dot online"></div>
                        Online - Testando fluxo
                      </span>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <button
                      className="btn-icon"
                      onClick={stopChatSimulation}
                      title="Fechar simulação"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="chat-messages-container" ref={chatMessagesRef}>
                  {simulationState.chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}

                  {!simulationState.awaitingInput && simulationState.isActive && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Digite sua mensagem..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={!simulationState.awaitingInput}
                    />
                    <button
                      className="send-button"
                      onClick={sendUserMessage}
                      disabled={!userInput.trim() || !simulationState.awaitingInput}
                    >
                      <Send size={18} />
                    </button>
                  </div>

                  <div className="chat-suggestions">
                    <span className="suggestions-label">Sugestões:</span>
                    <div className="suggestion-chips">
                      {['oi', 'menu', '1', '2', '3'].map((suggestion) => (
                        <button
                          key={suggestion}
                          className="suggestion-chip"
                          onClick={() => {
                            if (!simulationState.awaitingInput) return

                            const userMessage: ChatMessage = {
                              id: Date.now().toString(),
                              type: 'user',
                              content: suggestion,
                              timestamp: new Date()
                            }

                            // Add user message to chat
                            setSimulationState(prev => ({
                              ...prev,
                              chatHistory: [...prev.chatHistory, userMessage],
                              awaitingInput: false
                            }))

                            // Process the suggestion
                            const currentTemplates = getCurrentTemplates()
                            const matchingTemplate = currentTemplates.find(template =>
                              template.active && template.trigger.some(trigger =>
                                suggestion.toLowerCase().includes(trigger.toLowerCase())
                              )
                            )

                            setTimeout(() => {
                              if (matchingTemplate) {
                                const responseText = matchingTemplate.response.replace(/{name}/g, 'Usuário')

                                const botMessage: ChatMessage = {
                                  id: (Date.now() + 1).toString(),
                                  type: 'bot',
                                  content: responseText,
                                  timestamp: new Date(),
                                  nodeId: matchingTemplate.id
                                }

                                setSimulationState(prev => ({
                                  ...prev,
                                  chatHistory: [...prev.chatHistory, botMessage],
                                  awaitingInput: true,
                                  currentNodeId: `template-${matchingTemplate.id}`
                                }))
                              } else {
                                const botMessage: ChatMessage = {
                                  id: (Date.now() + 1).toString(),
                                  type: 'bot',
                                  content: '🤔 Desculpe, não entendi sua mensagem. Você pode tentar novamente ou digitar "menu" para ver as opções disponíveis.',
                                  timestamp: new Date()
                                }

                                setSimulationState(prev => ({
                                  ...prev,
                                  chatHistory: [...prev.chatHistory, botMessage],
                                  awaitingInput: true
                                }))
                              }
                            }, 1000)
                          }}
                          disabled={!simulationState.awaitingInput}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add New Template Form */}
          {showAddTemplate && (
            <div className="template-form-modern">
              <div className="form-header-modern">
                <div className="form-title-section">
                  <div className="form-icon">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3>Criar Novo Template</h3>
                    <p>Configure um template de resposta inteligente</p>
                  </div>
                </div>
                <button 
                  className="btn-close"
                  onClick={() => setShowAddTemplate(false)}
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
                      value={Array.isArray(newAutoTemplate.trigger) ? newAutoTemplate.trigger.join(', ') : ''}
                      onChange={(e) => setNewAutoTemplate({
                        ...newAutoTemplate,
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
                      value={newAutoTemplate.response || ''}
                      onChange={(e) => setNewAutoTemplate({
                        ...newAutoTemplate,
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
                    onClick={() => setShowAddTemplate(false)}
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                  <button 
                    className="btn-modern btn-primary"
                    onClick={addAutoTemplate}
                  >
                    <Check size={16} />
                    Criar Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="templates-list-modern">
            {getCurrentTemplates().map((template) => (
              <div key={template.id} className={`template-card-modern ${!template.active ? 'inactive' : ''}`}>
                {editingTemplate?.id === template.id ? (
                  // Edit Form
                  <div className="template-edit-modern">
                    <div className="edit-header">
                      <Edit3 size={18} />
                      <span>Editando Template</span>
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
                          value={editingTemplate.trigger.join(', ')}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
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
                          value={editingTemplate.response}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            response: e.target.value
                          })}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button 
                        className="btn-modern btn-secondary"
                        onClick={() => setEditingTemplate(null)}
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                      <button 
                        className="btn-modern btn-primary"
                        onClick={() => updateAutoTemplate(editingTemplate)}
                      >
                        <Check size={14} />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div className="template-header-card">
                      <div className="template-status">
                        {template.active ? (
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
                      
                      <div className="template-actions-modern">
                        <button
                          className="action-btn toggle-btn"
                          onClick={() => toggleTemplateActive(template.id)}
                          title={template.active ? 'Desativar' : 'Ativar'}
                        >
                          {template.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        
                        <button
                          className="action-btn edit-btn"
                          onClick={() => setEditingTemplate(template)}
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteAutoTemplate(template.id)}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="template-content-modern">
                      <div className="triggers-section">
                        <div className="section-label">
                          <Tag size={14} />
                          <span>Gatilhos</span>
                        </div>
                        <div className="triggers-container">
                          {template.trigger.map((trigger, index) => (
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
                          {template.response}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {getCurrentTemplates().length === 0 && (
              <div className="empty-state-modern">
                <div className="empty-icon-container">
                  <MessageSquareText size={64} />
                </div>
                <div className="empty-content">
                  <h3>Nenhum template criado ainda</h3>
                  <p>Comece criando seu primeiro template de resposta inteligente para o chatbot</p>
                  <button 
                    className="btn-modern btn-primary"
                    onClick={() => setShowAddTemplate(true)}
                  >
                    <Sparkles size={16} />
                    Criar Primeiro Template
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

export default Templates
