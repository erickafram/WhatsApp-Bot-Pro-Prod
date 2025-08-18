import { X, QrCode, Smartphone, Wifi } from 'lucide-react'

interface QRCodePopupProps {
  qrCode: string | null
  isVisible: boolean
  onClose: () => void
  isLoading?: boolean
}

function QRCodePopup({ qrCode, isVisible, onClose, isLoading = false }: QRCodePopupProps) {
  if (!isVisible) return null

  return (
    <div className="qr-popup-overlay">
      <div className="qr-popup">
        <div className="qr-popup-header">
          <div className="qr-popup-title">
            <QrCode size={24} />
            <h2>Conectar WhatsApp</h2>
          </div>
          <button className="qr-popup-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="qr-popup-content">
          {isLoading && !qrCode ? (
            <div className="qr-loading">
              <div className="loading-spinner"></div>
              <h3>Aguarde...</h3>
              <p>Gerando QR Code para conexão</p>
            </div>
          ) : qrCode && qrCode.trim() !== '' ? (
            <>
              <div className="qr-code-section">
                <div className="qr-code-wrapper">
                  <img src={qrCode} alt="QR Code WhatsApp" className="qr-image" />
                </div>
                <div className="qr-status">
                  <Wifi size={16} />
                  <span>Aguardando conexão...</span>
                </div>
              </div>

              <div className="qr-instructions">
                <div className="instructions-header">
                  <Smartphone size={20} />
                  <h3>Como conectar</h3>
                </div>
                
                <div className="instruction-steps">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Abra o WhatsApp</h4>
                      <p>Abra o WhatsApp no seu celular</p>
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Acesse Aparelhos Conectados</h4>
                      <p>Toque em <strong>Mais opções (⋮)</strong> → <strong>Aparelhos conectados</strong></p>
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Conectar Aparelho</h4>
                      <p>Toque em <strong>"Conectar um aparelho"</strong></p>
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Escaneie o Código</h4>
                      <p>Aponte a câmera do seu celular para o QR Code acima</p>
                    </div>
                  </div>
                </div>

                <div className="qr-tips">
                  <div className="tip">
                    <strong>💡 Dica:</strong> Mantenha o celular estável para uma leitura mais rápida
                  </div>
                  <div className="tip">
                    <strong>⚡ Importante:</strong> O QR Code expira em alguns minutos. Se não funcionar, feche e gere um novo
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="qr-error">
              <h3>Erro ao gerar QR Code</h3>
              <p>Tente novamente em alguns instantes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodePopup
