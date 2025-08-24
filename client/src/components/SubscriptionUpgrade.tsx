import { 
  Crown, 
  X, 
  Shield,
  MessageCircle,
  Phone,
  Copy
} from 'lucide-react'

interface SubscriptionUpgradeProps {
  isVisible: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
}



function SubscriptionUpgrade({ isVisible, onClose }: SubscriptionUpgradeProps) {
  const phoneNumber = "(63) 99241-0056"
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Feedback visual que foi copiado
      alert('Número copiado para a área de transferência!')
    }).catch(() => {
      // Fallback caso não consiga copiar
      alert(`Número: ${text}`)
    })
  }

  const openWhatsApp = () => {
    const message = "Olá! Gostaria de informações sobre os planos de assinatura do WhatsApp Bot."
    const url = `https://wa.me/5563992410056?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
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
            <Crown size={24} color="#f59e0b" />
            <h2>Assine o WhatsApp Bot</h2>
            <p>Entre em contato para adquirir seu plano</p>
          </div>
        </div>

        <div className="subscription-content">
          <div className="current-status">
            <div className="status-card free">
              <Shield size={20} />
              <div>
                <h4>Conta Gratuita</h4>
                <p>Para usar o WhatsApp Bot, você precisa de uma assinatura ativa.</p>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <div className="contact-card">
              <MessageCircle size={28} color="#25D366" />
              <h3>Entre em Contato</h3>
              <p>Para adquirir um plano, entre em contato pelo WhatsApp:</p>
              
              <div className="phone-display">
                <Phone size={20} color="#25D366" />
                <span className="phone-number">{phoneNumber}</span>
                <button 
                  className="btn-copy" 
                  onClick={() => copyToClipboard(phoneNumber)}
                  title="Copiar número"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="contact-actions">
                <button 
                  className="btn-whatsapp"
                  onClick={openWhatsApp}
                >
                  <MessageCircle size={18} />
                  Abrir WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="subscription-benefits">
            <h3>O que você terá com a assinatura:</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                ✅ Instâncias ilimitadas do WhatsApp
              </div>
              <div className="benefit-item">
                ✅ Suporte técnico especializado
              </div>
              <div className="benefit-item">
                ✅ Recursos premium exclusivos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionUpgrade
