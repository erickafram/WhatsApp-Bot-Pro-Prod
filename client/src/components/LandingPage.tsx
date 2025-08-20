import { useState } from 'react'
import {
  MessageSquare,
  Bot,
  Zap,
  CheckCircle,
  Users,
  BarChart3,
  Clock,
  Smartphone,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
  Play,
  Menu,
  X,
  Settings,
  Heart,
  DollarSign,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react'

interface LandingPageProps {
  onNavigate: (page: 'login' | 'register') => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
    setMobileMenuOpen(false) // Close mobile menu after clicking
  }

  const features = [
    {
      icon: MessageSquare,
      title: "Respostas Automáticas",
      description: "Configure respostas inteligentes que respondem automaticamente às mensagens dos seus clientes"
    },
    {
      icon: Bot,
      title: "Chatbot Inteligente", 
      description: "IA avançada que simula conversas humanas naturais com delays e indicadores de digitação"
    },
    {
      icon: Zap,
      title: "Integração WhatsApp",
      description: "Conecte diretamente com WhatsApp Web através de QR Code de forma rápida e segura"
    },
    {
      icon: BarChart3,
      title: "Analytics Completo",
      description: "Monitore mensagens, tempo de resposta e engajamento dos seus clientes em tempo real"
    },
    {
      icon: Clock,
      title: "24/7 Disponível",
      description: "Seu chatbot trabalha 24 horas por dia, 7 dias por semana, nunca perdendo uma oportunidade"
    },
    {
      icon: Users,
      title: "Gestão de Contatos",
      description: "Organize e segmente seus contatos para campanhas e atendimentos mais eficazes"
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      company: "Loja Virtual Plus",
      text: "Aumentei em 300% o engajamento com os clientes. O chatbot responde na hora e converte muito mais!",
      stars: 5
    },
    {
      name: "João Santos", 
      company: "Consultoria Premium",
      text: "Economizo 8 horas por dia que gastava respondendo WhatsApp. Agora foco no que realmente importa.",
      stars: 5
    },
    {
      name: "Ana Costa",
      company: "Serviços Online",
      text: "A melhor ferramenta que já usei! Fácil de configurar e os resultados são imediatos.",
      stars: 5
    }
  ]

  const plans = [
    {
      name: "Starter",
      price: "399",
      period: "/mês",
      description: "Ideal para pequenos negócios",
      features: [
        "Até 1.000 mensagens/mês",
        "1 número WhatsApp",
        "Respostas automáticas",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "499", 
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "Até 10.000 mensagens/mês",
        "3 números WhatsApp",
        "Chatbot avançado",
        "Analytics completo",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "599",
      period: "/mês", 
      description: "Para grandes empresas",
      features: [
        "Mensagens ilimitadas",
        "Números ilimitados",
        "IA personalizada",
        "Integrações customizadas",
        "Suporte 24/7"
      ],
      popular: false
    }
  ]

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <MessageSquare className="brand-icon" />
              <span className="brand-text">WhatsApp Bot Pro</span>
            </div>
            
                         {/* Desktop Menu */}
             <div className="nav-menu desktop-menu">
               <button onClick={() => scrollToSection('features')} className="nav-link">
                 <Settings size={16} />
                 Funcionalidades
               </button>
               <button onClick={() => scrollToSection('testimonials')} className="nav-link">
                 <Heart size={16} />
                 Depoimentos
               </button>
               <button onClick={() => scrollToSection('pricing')} className="nav-link">
                 <DollarSign size={16} />
                 Preços
               </button>
               <button onClick={() => scrollToSection('contact')} className="nav-link">
                 <Mail size={16} />
                 Contato
               </button>
             </div>

            <div className="nav-actions desktop-actions">
              <button 
                className="btn-outline"
                onClick={() => onNavigate('login')}
              >
                Entrar
              </button>
              <button 
                className="btn-primary"
                onClick={() => onNavigate('register')}
              >
                Começar Grátis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
                             <div className="mobile-nav-links">
                 <button onClick={() => scrollToSection('features')} className="mobile-nav-link">
                   <Settings size={16} />
                   Funcionalidades
                 </button>
                 <button onClick={() => scrollToSection('testimonials')} className="mobile-nav-link">
                   <Heart size={16} />
                   Depoimentos
                 </button>
                 <button onClick={() => scrollToSection('pricing')} className="mobile-nav-link">
                   <DollarSign size={16} />
                   Preços
                 </button>
                 <button onClick={() => scrollToSection('contact')} className="mobile-nav-link">
                   <Mail size={16} />
                   Contato
                 </button>
               </div>
              <div className="mobile-nav-actions">
                <button 
                  className="btn-outline mobile-btn"
                  onClick={() => onNavigate('login')}
                >
                  Entrar
                </button>
                <button 
                  className="btn-primary mobile-btn"
                  onClick={() => onNavigate('register')}
                >
                  Começar Grátis
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Automatização Inteligente</span>
            </div>
            <h1 className="hero-title">
              Transforme seu WhatsApp em uma
              <span className="hero-highlight"> Máquina de Vendas</span>
            </h1>
            <p className="hero-description">
              Crie chatbots inteligentes que respondem automaticamente seus clientes 24/7, 
              aumentando suas vendas e economizando horas do seu tempo todos os dias.
            </p>
            <div className="hero-actions">
              <button 
                className="btn-hero-primary"
                onClick={() => onNavigate('register')}
              >
                <Play size={20} />
                Começar Gratuitamente
              </button>
              <button className="btn-hero-secondary">
                <MessageSquare size={20} />
                Ver Demonstração
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10.000+</span>
                <span className="stat-label">Empresas Ativas</span>
              </div>
              <div className="stat">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Mensagens/Dia</span>
              </div>
              <div className="stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfação</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="mockup-title">WhatsApp Bot Dashboard</span>
              </div>
              <div className="mockup-content">
                <div className="mockup-sidebar">
                  <div className="sidebar-item active">
                    <Bot size={16} />
                    <span>Chatbot</span>
                  </div>
                  <div className="sidebar-item">
                    <MessageSquare size={16} />
                    <span>Mensagens</span>
                  </div>
                  <div className="sidebar-item">
                    <BarChart3 size={16} />
                    <span>Analytics</span>
                  </div>
                </div>
                <div className="mockup-main">
                  <div className="dashboard-cards-mini">
                    <div className="mini-card">
                      <div className="mini-card-icon success">
                        <CheckCircle size={16} />
                      </div>
                      <div className="mini-card-content">
                        <span className="mini-card-title">Status</span>
                        <span className="mini-card-value">Conectado</span>
                      </div>
                    </div>
                    <div className="mini-card">
                      <div className="mini-card-icon primary">
                        <MessageSquare size={16} />
                      </div>
                      <div className="mini-card-content">
                        <span className="mini-card-title">Mensagens</span>
                        <span className="mini-card-value">1,234</span>
                      </div>
                    </div>
                  </div>
                  <div className="mockup-chat">
                    <div className="chat-message received">
                      <span>Olá! Como posso ajudar?</span>
                    </div>
                    <div className="chat-message sent">
                      <span>Quero saber sobre os preços</span>
                    </div>
                    <div className="chat-message received">
                      <span>Claro! Temos 3 planos disponíveis...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">
              Funcionalidades que <span className="text-highlight">Revolucionam</span> seu Atendimento
            </h2>
            <p className="section-description">
              Tudo que você precisa para automatizar e otimizar sua comunicação no WhatsApp
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">
              O que nossos <span className="text-highlight">Clientes</span> dizem
            </h2>
            <p className="section-description">
              Mais de 10.000 empresas já transformaram seus resultados
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} size={16} className="star-filled" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-company">{testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title">
              Planos para <span className="text-highlight">Todos os Tamanhos</span>
            </h2>
            <p className="section-description">
              Escolha o plano ideal para o seu negócio e comece hoje mesmo
            </p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">
                    <Sparkles size={14} />
                    <span>Mais Popular</span>
                  </div>
                )}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price-currency">R$</span>
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-period">{plan.period}</span>
                  </div>
                </div>
                <div className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="plan-feature">
                      <CheckCircle size={16} className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  className={`plan-btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onNavigate('register')}
                >
                  {plan.popular ? 'Começar Agora' : 'Escolher Plano'}
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <Shield size={48} className="cta-icon" />
            <h2 className="cta-title">
              Pronto para <span className="text-highlight">Revolucionar</span> seu WhatsApp?
            </h2>
            <p className="cta-description">
              Junte-se a milhares de empresas que já automatizaram seu atendimento e aumentaram suas vendas
            </p>
            <div className="cta-features">
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>7 dias grátis</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Sem compromisso</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Configuração em 5 minutos</span>
              </div>
            </div>
            <button 
              className="cta-btn"
              onClick={() => onNavigate('register')}
            >
              <Smartphone size={20} />
              Começar Gratuitamente
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <MessageSquare size={24} />
                <span>WhatsApp Bot Pro</span>
              </div>
              <p className="footer-description">
                A plataforma mais completa para automatizar seu WhatsApp Business e aumentar suas vendas. 
                Transforme sua comunicação e acelere seus resultados.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Produto</h4>
              <button onClick={() => scrollToSection('features')} className="footer-link">
                <Settings size={14} />
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('pricing')} className="footer-link">
                <DollarSign size={14} />
                Preços
              </button>
              <a href="#" className="footer-link">
                <Zap size={14} />
                Integrações
              </a>
              <a href="#" className="footer-link">
                <Bot size={14} />
                API
              </a>
            </div>
            
            <div className="footer-section">
              <h4>Suporte</h4>
              <a href="#" className="footer-link">
                <CheckCircle size={14} />
                Central de Ajuda
              </a>
              <a href="#" className="footer-link">
                <MessageSquare size={14} />
                Documentação
              </a>
              <a href="#" className="footer-link">
                <Phone size={14} />
                Contato
              </a>
              <a href="#" className="footer-link">
                <Shield size={14} />
                Status
              </a>
            </div>
            
            <div className="footer-section">
              <h4>Empresa</h4>
              <a href="#" className="footer-link">
                <Users size={14} />
                Sobre
              </a>
              <a href="#" className="footer-link">
                <Star size={14} />
                Blog
              </a>
              <a href="#" className="footer-link">
                <Sparkles size={14} />
                Carreiras
              </a>
              <a href="#" className="footer-link">
                <Shield size={14} />
                Privacidade
              </a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-text">
              &copy; 2024 WhatsApp Bot Pro. Todos os direitos reservados.
            </div>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Termos de Uso</a>
              <a href="#" className="footer-bottom-link">Política de Privacidade</a>
              <a href="#" className="footer-bottom-link">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
