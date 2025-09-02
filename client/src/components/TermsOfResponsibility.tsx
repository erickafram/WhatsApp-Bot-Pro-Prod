import { useState } from 'react'
import { X, AlertTriangle, Shield, CheckCircle } from 'lucide-react'
import './TermsOfResponsibility.css'

interface TermsOfResponsibilityProps {
  isVisible: boolean
  onClose: () => void
  onAccept: () => void
}

function TermsOfResponsibility({ isVisible, onClose, onAccept }: TermsOfResponsibilityProps) {
  const [isChecked, setIsChecked] = useState(false)

  if (!isVisible) return null

  const handleClose = () => {
    setIsChecked(false)
    onClose()
  }

  const handleAccept = () => {
    if (isChecked) {
      setIsChecked(false)
      onAccept()
    }
  }

  return (
    <div className="terms-overlay">
      <div className="terms-modal">
        <div className="terms-header">
          <div className="terms-title">
            <AlertTriangle size={24} color="#f59e0b" />
            <h2>Termo de Responsabilidade</h2>
          </div>
          <button className="terms-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="terms-content">
          <div className="unofficial-warning">
            <h3>🚨 ATENÇÃO: API OFICIAL</h3>
            <div className="unofficial-text">
              <p>
                <strong>Esta ferramenta é uma API oficial do WhatsApp.</strong> 
                Utilizamos métodos oficiais para conectar com o WhatsApp Web, 
                se usada de forma inadequada, pode resultar em <strong>bloqueios permanentes</strong> da sua conta.
              </p>
            </div>
          </div>

          <div className="warning-section">
            <h3>⚠️ IMPORTANTE: Riscos de Uso</h3>
            <div className="warning-text">
              <p>
                Ao utilizar esta ferramenta de automação do WhatsApp, você está ciente de que:
              </p>
              <ul>
                <li><strong>Seu número pode ser temporariamente suspenso ou permanentemente banido</strong> caso viole as diretrizes do Meta/WhatsApp</li>
                <li>O WhatsApp não permite oficialmente o uso de bots e automações não autorizadas</li>
                <li>Você é totalmente responsável pelo uso adequado da ferramenta</li>
                <li>Nossa empresa não se responsabiliza por eventuais bloqueios ou suspensões</li>
              </ul>
            </div>
          </div>

          <div className="guidelines-section">
            <h3><Shield size={20} /> Como Usar Sem Ser Bloqueado</h3>
            <div className="guidelines-grid">
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Volume Moderado</strong>
                  <p>Evite enviar muitas mensagens por minuto. Respeite intervalos naturais.</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Conteúdo Apropriado</strong>
                  <p>Não envie spam, conteúdo impróprio ou mensagens comerciais excessivas.</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Comportamento Humano</strong>
                  <p>Simule padrões de uso humano, evite atividade 24h por dia.</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Números Verificados</strong>
                  <p>Use números pessoais já estabelecidos, evite números novos ou temporários.</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Respeite Privacidade</strong>
                  <p>Não adicione pessoas em grupos sem permissão ou envie mensagens não solicitadas.</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <CheckCircle size={16} color="#10b981" />
                <div>
                  <strong>Monitore Atividade</strong>
                  <p>Acompanhe logs e seja responsivo se receber avisos do WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="recommendations-section">
            <h3>📋 Recomendações Adicionais</h3>
            <div className="recommendations">
              <p>• <strong>Comece devagar:</strong> Inicie com poucos contatos e aumente gradualmente</p>
              <p>• <strong>Use com parcimônia:</strong> Não abuse da automação, mantenha interações naturais</p>
              <p>• <strong>Tenha backup:</strong> Mantenha sempre um número secundário caso necessário</p>
              <p>• <strong>Seja ético:</strong> Use apenas para finalidades legítimas e com consentimento</p>
              <p>• <strong>Monitore sempre:</strong> Fique atento a mudanças nas políticas do WhatsApp</p>
            </div>
          </div>

          <div className="disclaimer-section">
            <h3>📝 Isenção de Responsabilidade</h3>
            <p className="disclaimer-text">
              Esta ferramenta é fornecida "como está" para fins educacionais e de automação pessoal. 
              O usuário assume total responsabilidade pelo uso adequado e pelas consequências de seu uso. 
              Não garantimos que o uso desta ferramenta não resultará em bloqueios ou suspensões por parte do WhatsApp/Meta.
            </p>
          </div>
        </div>

        <div className="terms-footer">
          <div className="agreement-text">
            <input 
              type="checkbox" 
              id="agree-terms" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label htmlFor="agree-terms">
              Li e concordo com os termos acima. Entendo os riscos e assumo total responsabilidade pelo uso da ferramenta.
            </label>
          </div>
          
          <div className="terms-actions">
            <button className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button 
              className="btn-accept" 
              onClick={handleAccept}
              disabled={!isChecked}
            >
              Aceitar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfResponsibility
