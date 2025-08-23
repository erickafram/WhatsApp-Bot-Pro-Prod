import { useState } from 'react'
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Zap,
  Shield,
  Headphones,
  Infinity
} from 'lucide-react'

interface SubscriptionUpgradeProps {
  isVisible: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
}

interface PlanFeature {
  text: string
  included: boolean
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: PlanFeature[]
  color: string
  icon: React.ReactNode
}

function SubscriptionUpgrade({ isVisible, onClose, onUpgrade }: SubscriptionUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 39.90,
      period: 'mês',
      description: 'Ideal para começar',
      features: [
        { text: '1 Instância WhatsApp', included: true },
        { text: 'Mensagens ilimitadas', included: true },
        { text: 'Chat humano básico', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Múltiplas instâncias', included: false },
        { text: 'API avançada', included: false },
        { text: 'Suporte prioritário', included: false }
      ],
      color: '#4299e1',
      icon: <Zap size={24} />
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 79.90,
      period: 'mês',
      description: 'Para empresas em crescimento',
      popular: true,
      features: [
        { text: '5 Instâncias WhatsApp', included: true },
        { text: 'Mensagens ilimitadas', included: true },
        { text: 'Chat humano avançado', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'API avançada', included: true },
        { text: 'Relatórios detalhados', included: true },
        { text: 'Integração webhooks', included: true }
      ],
      color: '#9f7aea',
      icon: <Crown size={24} />
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 149.90,
      period: 'mês',
      description: 'Para grandes empresas',
      features: [
        { text: 'Instâncias ilimitadas', included: true },
        { text: 'Mensagens ilimitadas', included: true },
        { text: 'Chat humano premium', included: true },
        { text: 'Suporte 24/7', included: true },
        { text: 'API completa', included: true },
        { text: 'Analytics avançados', included: true },
        { text: 'Customizações', included: true }
      ],
      color: '#f56565',
      icon: <Infinity size={24} />
    }
  ]

  const handleUpgrade = async () => {
    setIsProcessing(true)
    try {
      await onUpgrade(selectedPlan)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="subscription-overlay">
      <div className="subscription-modal">
        <div className="subscription-header">
          <button className="btn-close-subscription" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="subscription-title">
            <Crown size={32} color="#f59e0b" />
            <h2>Upgrade sua Assinatura</h2>
            <p>Desbloqueie todas as funcionalidades do WhatsApp Bot</p>
          </div>
        </div>

        <div className="subscription-content">
          <div className="current-status">
            <div className="status-card free">
              <Shield size={20} />
              <div>
                <h4>Conta Gratuita</h4>
                <p>Você não pode criar instâncias do WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <Crown size={16} />
                    Mais Popular
                  </div>
                )}

                <div className="plan-header">
                  <div className="plan-icon" style={{ color: plan.color }}>
                    {plan.icon}
                  </div>
                  <h3>{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-price">
                  <span className="price">R$ {plan.price.toFixed(2)}</span>
                  <span className="period">/{plan.period}</span>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className={`feature ${feature.included ? 'included' : 'not-included'}`}>
                      {feature.included ? (
                        <Check size={16} color="#22c55e" />
                      ) : (
                        <X size={16} color="#ef4444" />
                      )}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`btn-select-plan ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPlan(plan.id)
                  }}
                >
                  {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
                </button>
              </div>
            ))}
          </div>

          <div className="subscription-benefits">
            <h3>Benefícios da Assinatura</h3>
            <div className="benefits-grid">
              <div className="benefit">
                <Zap size={20} color="#4299e1" />
                <span>Instâncias ilimitadas do WhatsApp</span>
              </div>
              <div className="benefit">
                <Shield size={20} color="#22c55e" />
                <span>Sistema de segurança avançado</span>
              </div>
              <div className="benefit">
                <Headphones size={20} color="#9f7aea" />
                <span>Suporte técnico especializado</span>
              </div>
              <div className="benefit">
                <Crown size={20} color="#f59e0b" />
                <span>Recursos premium exclusivos</span>
              </div>
            </div>
          </div>

          <div className="subscription-actions">
            <button 
              className="btn-cancel-subscription"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button 
              className="btn-upgrade-subscription"
              onClick={handleUpgrade}
              disabled={isProcessing}
            >
              <CreditCard size={16} />
              {isProcessing ? 'Processando...' : `Assinar ${plans.find(p => p.id === selectedPlan)?.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionUpgrade
