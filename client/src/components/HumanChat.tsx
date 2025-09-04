import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquareText,
  MessageCircle,
  Users,
  ArrowRightLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Send,
  Search,
  FileText,
  FileImage,
  File,
  Music,
  Video,
  Reply,
  X,
  Smile,
  Paperclip
} from 'lucide-react'
import './HumanChatWhatsApp.css'

interface ChatMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  isFromBot: boolean
  isFromHuman: boolean
  messageType?: 'text' | 'audio' | 'document' | 'image' | 'video'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
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

// Componente para reprodução de áudio
const AudioPlayer = ({ audioUrl, fileName, messageId, onDeleteMessage }: { 
  audioUrl: string, 
  fileName?: string,
  messageId?: string,
  onDeleteMessage?: (messageId: string) => void
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Construir URL absoluta se necessário
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + '/' + url
  }
  
  const audioRef = useState(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    return audio
  })[0]

  useEffect(() => {
    const audio = audioRef
    setIsLoading(true)
    setError(null)
    
    const absoluteUrl = getAbsoluteUrl(audioUrl)
    console.log('🔊 Carregando áudio:', { originalUrl: audioUrl, absoluteUrl })
    
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      const errorDetails = {
        event: e,
        audioError: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc,
        canPlayType: {
          ogg: audio.canPlayType('audio/ogg'),
          mp3: audio.canPlayType('audio/mpeg'),
          wav: audio.canPlayType('audio/wav'),
          m4a: audio.canPlayType('audio/mp4')
        }
      }
      
      console.error('❌ Erro ao carregar áudio:', errorDetails)
      
      let errorMessage = 'Formato de áudio não suportado'
      if (audio.error) {
        switch (audio.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = 'Carregamento cancelado'
            break
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = 'Erro de rede'
            break
          case 3: // MEDIA_ERR_DECODE
            errorMessage = 'Erro de decodificação'
            break
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = 'Formato não suportado pelo navegador'
            break
          default:
            errorMessage = audio.error.message || 'Erro desconhecido'
        }
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
    const handleCanPlay = () => {
      console.log('✅ Áudio carregado com sucesso')
      setIsLoading(false)
      setError(null)
    }

    // Verificar suporte do navegador para o formato
    console.log('🔊 Suporte de áudio do navegador:', {
      ogg: audio.canPlayType('audio/ogg'),
      mp3: audio.canPlayType('audio/mpeg'),
      wav: audio.canPlayType('audio/wav'),
      m4a: audio.canPlayType('audio/mp4')
    })
    
    // Configurar src e listeners
    audio.src = absoluteUrl
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadstart', () => console.log('🔊 Iniciando carregamento do áudio'))
    audio.addEventListener('progress', () => console.log('🔊 Progresso do carregamento'))

    // Verificar se a URL é acessível antes de tentar carregar
    fetch(absoluteUrl, { method: 'HEAD' })
      .then(response => {
        console.log('🔍 Status do arquivo de áudio:', response.status, response.headers.get('content-type'))
        if (response.ok) {
          // Carregar o áudio apenas se o arquivo existir
          audio.load()
        } else {
          setError(`Arquivo não encontrado (${response.status})`)
          setIsLoading(false)
        }
      })
      .catch(err => {
        console.error('❌ Erro ao verificar arquivo de áudio:', err)
        // Tentar carregar mesmo assim
        audio.load()
      })

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.pause()
    }
  }, [audioRef, audioUrl])

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.pause()
    } else {
      audioRef.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    audioRef.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className="audio-player">
      <button 
        onClick={togglePlay} 
        className="play-button"
        disabled={!!error || isLoading}
        style={{
          background: error ? '#ef4444' : isLoading ? '#fbbf24' : '#25d366',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: error || isLoading ? 'not-allowed' : 'pointer',
          opacity: error || isLoading ? 0.7 : 1
        }}
      >
{error ? '⚠️' : isLoading ? '⏳' : (isPlaying ? '⏸️' : '▶️')}
      </button>
      <div className="audio-info">
        <div className="audio-filename">{fileName || 'Áudio'}</div>
        {error ? (
          <div className="audio-error" style={{ color: '#ef4444', fontSize: '0.75rem' }}>
            {error}
          </div>
        ) : (
          <div className="audio-controls">
            <span className="time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="seek-bar"
              disabled={!!error || isLoading}
            />
            <span className="time">{formatTime(duration)}</span>
          </div>
        )}
      </div>
             <a 
         href={getAbsoluteUrl(audioUrl)} 
         download={fileName} 
         className="download-button"
         title={error ? "Baixar arquivo (reprodução indisponível)" : "Baixar áudio"}
         style={{
           background: '#25d366',
           color: 'white',
           border: 'none',
           borderRadius: '6px',
           width: 'auto',
           height: '32px',
           padding: '0 8px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           textDecoration: 'none',
           fontSize: '12px',
           fontWeight: 'bold'
         }}
       >
         BAIXAR
       </a>
      {messageId && onDeleteMessage && (
                 <button 
           onClick={() => {
             if (confirm('Tem certeza que deseja apagar este áudio para todos? Esta ação não pode ser desfeita.')) {
               onDeleteMessage(messageId)
             }
           }}
           className="delete-button"
           title="Apagar para todos"
           style={{
             background: '#dc2626',
             color: 'white',
             border: 'none',
             borderRadius: '6px',
             width: 'auto',
             height: '32px',
             padding: '0 8px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: '12px',
             fontWeight: 'bold'
           }}
         >
           APAGAR
         </button>
      )}
    </div>
  )
}

// Componente para documentos
const DocumentViewer = ({ fileUrl, fileName, fileSize, mimeType, messageId, onSaveDocument, onDeleteMessage }: { 
  fileUrl: string, 
  fileName?: string, 
  fileSize?: number, 
  mimeType?: string,
  messageId?: string,
  onSaveDocument?: (messageId: string, fileInfo: any) => void,
  onDeleteMessage?: (messageId: string) => void
}) => {
  const getFileIcon = (mimeType?: string, fileName?: string) => {
    if (!mimeType && !fileName) return <File size={24} />
    
    const type = mimeType || ''
    const name = fileName || ''
    
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText size={24} color="#dc2626" />
    }
    if (type.includes('word') || name.includes('.doc') || name.includes('.docx')) {
      return <FileText size={24} color="#2563eb" />
    }
    if (type.includes('excel') || name.includes('.xls') || name.includes('.xlsx')) {
      return <FileText size={24} color="#16a34a" />
    }
    if (type.includes('powerpoint') || name.includes('.ppt') || name.includes('.pptx')) {
      return <FileText size={24} color="#ea580c" />
    }
    if (type.includes('image')) {
      return <FileImage size={24} color="#7c3aed" />
    }
    if (type.includes('video')) {
      return <Video size={24} color="#dc2626" />
    }
    if (type.includes('audio')) {
      return <Music size={24} color="#059669" />
    }
    
    return <File size={24} />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + '/' + url
  }

  const openDocument = () => {
    const absoluteUrl = getAbsoluteUrl(fileUrl)
    console.log('📄 Abrindo documento:', { originalUrl: fileUrl, absoluteUrl })
    
    // Verificar se a URL é acessível primeiro
    fetch(absoluteUrl, { method: 'HEAD' })
      .then(response => {
        console.log('🔍 Status do arquivo:', response.status, response.statusText)
        if (response.ok) {
          // Arquivo existe, tentar abrir
          try {
            const newWindow = window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
            if (!newWindow || newWindow.closed) {
              // Se o popup foi bloqueado, tentar download direto
              console.warn('⚠️ Popup bloqueado, tentando download direto')
              const link = document.createElement('a')
              link.href = absoluteUrl
              link.download = fileName || 'documento'
              link.target = '_blank'
              link.rel = 'noopener noreferrer'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          } catch (error) {
            console.error('❌ Erro ao abrir documento:', error)
            // Tentar download como fallback
            window.location.href = absoluteUrl
          }
        } else {
          console.error('❌ Arquivo não encontrado:', response.status)
          alert(`Arquivo não encontrado no servidor (${response.status}). Verifique se o arquivo existe.`)
        }
      })
      .catch(error => {
        console.error('❌ Erro ao verificar arquivo:', error)
        alert('Erro ao acessar arquivo. Verifique sua conexão.')
      })
  }

  const handleSaveDocument = () => {
    if (messageId && onSaveDocument) {
      onSaveDocument(messageId, {
        fileName,
        fileSize,
        mimeType,
        fileUrl
      })
    }
  }

  return (
    <div className="document-viewer">
      <div className="document-icon">
        {getFileIcon(mimeType, fileName)}
      </div>
      <div className="document-info">
        <div className="document-name">{fileName || 'Documento'}</div>
        {fileSize && (
          <div className="document-size">{formatFileSize(fileSize)}</div>
        )}
      </div>
      <div className="document-actions">
                 <button 
           onClick={openDocument} 
           className="view-button" 
           title="Abrir documento"
           style={{
             background: '#128c7e',
             color: 'white',
             border: 'none',
             borderRadius: '6px',
             width: 'auto',
             height: '32px',
             padding: '0 8px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: '12px',
             fontWeight: 'bold'
           }}
         >
           ABRIR
         </button>
                 <a 
           href={getAbsoluteUrl(fileUrl)} 
           download={fileName} 
           className="download-button" 
           title="Baixar arquivo"
           style={{
             background: '#25d366',
             color: 'white',
             border: 'none',
             borderRadius: '6px',
             width: 'auto',
             height: '32px',
             padding: '0 8px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             textDecoration: 'none',
             fontSize: '12px',
             fontWeight: 'bold'
           }}
         >
           BAIXAR
         </a>
        {messageId && onSaveDocument && (
                     <button 
             onClick={handleSaveDocument} 
             className="save-button" 
             title="Catalogar documento no sistema"
             style={{
               background: '#fbbf24',
               color: 'white',
               border: 'none',
               borderRadius: '6px',
               width: 'auto',
               height: '32px',
               padding: '0 8px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '12px',
               fontWeight: 'bold'
             }}
           >
             SALVAR
           </button>
        )}
        {messageId && onDeleteMessage && (
                     <button 
             onClick={() => {
               if (confirm('Tem certeza que deseja apagar este documento para todos? Esta ação não pode ser desfeita.')) {
                 onDeleteMessage(messageId)
               }
             }}
             className="delete-button" 
             title="Apagar para todos"
             style={{
               background: '#dc2626',
               color: 'white',
               border: 'none',
               borderRadius: '6px',
               width: 'auto',
               height: '32px',
               padding: '0 8px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '12px',
               fontWeight: 'bold'
             }}
           >
             APAGAR
           </button>
        )}
      </div>
    </div>
  )
}

// Componente para imagens
const ImageViewer = ({ imageUrl, fileName, messageId, onDeleteMessage, onSaveDocument }: { 
  imageUrl: string, 
  fileName?: string,
  messageId?: string,
  onDeleteMessage?: (messageId: string) => void,
  onSaveDocument?: (messageId: string, fileInfo: any) => void
}) => {
  const [showFullSize, setShowFullSize] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + '/' + url
  }
  
  const absoluteUrl = getAbsoluteUrl(imageUrl)
  
  // Debug da URL
  console.log('🖼️ ImageViewer - URLs:', { 
    original: imageUrl, 
    absolute: absoluteUrl,
    fileName 
  })

  // Função para fazer download da imagem
  const handleDownloadImage = async () => {
    try {
      console.log('📥 Iniciando download da imagem:', absoluteUrl)
      
      // Buscar a imagem
      const response = await fetch(absoluteUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Converter para blob
      const blob = await response.blob()
      
      // Criar URL temporária para o blob
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Criar elemento de download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || `imagem_${Date.now()}.jpg`
      
      // Adicionar ao DOM temporariamente e clicar
      document.body.appendChild(link)
      link.click()
      
      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      
      console.log('✅ Download da imagem iniciado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fazer download da imagem:', error)
      alert('Erro ao fazer download da imagem. Tente novamente.')
    }
  }

  // Função para catalogar imagem como documento
  const handleSaveImageAsDocument = () => {
    if (messageId && onSaveDocument) {
      // Determinar o tipo MIME baseado na extensão
      let mimeType = 'image/jpeg'
      if (fileName) {
        if (fileName.toLowerCase().endsWith('.png')) mimeType = 'image/png'
        else if (fileName.toLowerCase().endsWith('.gif')) mimeType = 'image/gif'
        else if (fileName.toLowerCase().endsWith('.webp')) mimeType = 'image/webp'
      }

      onSaveDocument(messageId, {
        fileName: fileName || 'imagem.jpg',
        fileSize: undefined, // Não temos o tamanho da imagem facilmente
        mimeType: mimeType,
        fileUrl: imageUrl
      })
    }
  }

  return (
    <>
      <div className="image-viewer">
        {imageError ? (
          <div className="image-error" style={{ 
            padding: '20px', 
            background: '#f3f4f6', 
            borderRadius: '8px', 
            textAlign: 'center',
            color: '#6b7280',
            border: '1px solid #e5e7eb'
          }}>
            <FileImage size={32} style={{ margin: '0 auto 8px' }} />
            <div>❌ Imagem não disponível</div>
            <small>{fileName || 'Arquivo de imagem'}</small>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#9ca3af' }}>
              URL: {absoluteUrl}
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1
              }}>
                ⏳ Carregando...
              </div>
            )}
            <img 
              src={absoluteUrl} 
              alt={fileName || 'Imagem'} 
              className="message-image"
              onClick={() => !imageError && setShowFullSize(true)}
              onError={() => {
                console.error('❌ Erro ao carregar imagem:', { 
                  url: absoluteUrl, 
                  original: imageUrl,
                  fileName 
                })
                setImageError(true)
                setIsLoading(false)
              }}
              onLoad={() => {
                console.log('✅ Imagem carregada com sucesso:', absoluteUrl)
                setImageError(false)
                setIsLoading(false)
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                cursor: imageError ? 'default' : 'pointer',
                display: 'block'
              }}
            />
          </div>
        )}
        <div className="image-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <button 
             onClick={handleDownloadImage}
             title="Salvar imagem"
             style={{
               background: '#25d366',
               color: 'white',
               border: 'none',
               borderRadius: '6px',
               width: 'auto',
               height: '32px',
               padding: '0 10px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer',
               fontSize: '12px',
               fontWeight: 'bold'
             }}
           >
             BAIXAR
           </button>
                     <button 
             onClick={() => window.open(absoluteUrl, '_blank')}
             title="Abrir em nova aba"
             style={{
               background: '#128c7e',
               color: 'white',
               border: 'none',
               borderRadius: '6px',
               width: 'auto',
               height: '32px',
               padding: '0 10px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer',
               fontSize: '12px',
               fontWeight: 'bold'
             }}
           >
             ABRIR
           </button>
          {messageId && onSaveDocument && (
                         <button 
               onClick={handleSaveImageAsDocument}
               title="Catalogar imagem no sistema"
               style={{
                 background: '#fbbf24',
                 color: 'white',
                 border: 'none',
                 borderRadius: '6px',
                 width: 'auto',
                 height: '32px',
                 padding: '0 10px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 fontSize: '12px',
                 fontWeight: 'bold'
               }}
             >
               SALVAR
             </button>
          )}
          {messageId && onDeleteMessage && (
                         <button 
               onClick={() => {
                 if (confirm('Tem certeza que deseja apagar esta imagem para todos? Esta ação não pode ser desfeita.')) {
                   onDeleteMessage(messageId)
                 }
               }}
               title="Apagar para todos"
               style={{
                 background: '#dc2626',
                 color: 'white',
                 border: 'none',
                 borderRadius: '6px',
                 width: 'auto',
                 height: '32px',
                 padding: '0 10px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 fontSize: '12px',
                 fontWeight: 'bold'
               }}
             >
               APAGAR
             </button>
          )}
        </div>
      </div>
      
      {showFullSize && !imageError && (
        <div className="image-modal" onClick={() => setShowFullSize(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowFullSize(false)}>
              <XCircle size={20} />
            </button>
            <img src={absoluteUrl} alt={fileName || 'Imagem'} className="full-size-image" />
          </div>
        </div>
      )}
    </>
  )
}

function HumanChat({ socket, onUnreadCountChange }: HumanChatProps) {
  // States for Human Chat System
  const [humanChats, setHumanChats] = useState<HumanChat[]>([])
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  // Função para detectar tipo de mensagem baseado no conteúdo
  const detectMessageType = (message: any): ChatMessage => {
    console.log('🔍 Detectando tipo de mensagem:', message)
    
    // Se a mensagem tem anexo/arquivo
    if (message.media_url || message.fileUrl || message.hasMedia || message.message_type !== 'text') {
      const mimeType = message.mimeType || message.media_type || ''
      const fileName = message.fileName || message.media_name || undefined
      const fileUrl = message.media_url || message.fileUrl
      const messageType = message.message_type || message.messageType
      
      console.log('📁 Detectando tipo de arquivo:', { 
        mimeType, 
        fileName, 
        fileUrl, 
        messageType,
        originalMessageType: message.message_type 
      })
      
      // Verificar primeiro pelo message_type do banco de dados
      if (messageType === 'audio' || mimeType.includes('audio') || (fileName && fileName.match(/\.(mp3|wav|ogg|m4a|aac)$/i))) {
        console.log('🔊 Detectado como áudio')
        return {
          ...message,
          messageType: 'audio',
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: message.fileSize || message.media_size,
          mimeType: mimeType
        }
      } else if (messageType === 'image' || mimeType.includes('image') || (fileName && fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i))) {
        console.log('🖼️ Detectado como imagem')
        return {
          ...message,
          messageType: 'image',
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: message.fileSize || message.media_size,
          mimeType: mimeType
        }
      } else if (messageType === 'video' || mimeType.includes('video') || (fileName && fileName.match(/\.(mp4|avi|mov|webm|mkv)$/i))) {
        console.log('🎥 Detectado como vídeo')
        return {
          ...message,
          messageType: 'video',
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: message.fileSize || message.media_size,
          mimeType: mimeType
        }
      } else if (messageType === 'document' || fileUrl) {
        console.log('📄 Detectado como documento')
        return {
          ...message,
          messageType: 'document',
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: message.fileSize || message.media_size,
          mimeType: mimeType
        }
      }
    }
    
    // Mensagem de texto padrão
    console.log('📝 Detectado como texto')
    return {
      ...message,
      messageType: 'text'
    }
  }
  
  const [newChatMessage, setNewChatMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null)
  const [showTakeChatModal, setShowTakeChatModal] = useState<string | null>(null)
  const [dismissedTakeModals, setDismissedTakeModals] = useState<Set<string>>(new Set())
  const [operatorName] = useState(() => {
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

  // Função para formatar data/hora de forma robusta
  const formatMessageTime = (timestamp: Date | string | undefined) => {
    try {
      if (!timestamp) return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      console.warn('Erro ao formatar data:', error)
      return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Função para formatar data/hora completa
  const formatFullDateTime = (timestamp: Date | string | undefined) => {
    try {
      if (!timestamp) return new Date().toLocaleString('pt-BR')
      
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString('pt-BR')
      }
      
      return date.toLocaleString('pt-BR')
    } catch (error) {
      console.warn('Erro ao formatar data completa:', error)
      return new Date().toLocaleString('pt-BR')
    }
  }

  // Função para deduplicar chats por contactNumber (manter o mais recente)
  const deduplicateChats = (chats: HumanChat[]): HumanChat[] => {
    const seen = new Map<string, HumanChat>()
    
    // Processar chats em ordem (manter o mais recente por contactNumber)
    chats.forEach(chat => {
      const key = chat.contactNumber
      const existing = seen.get(key)
      
      if (!existing) {
        seen.set(key, chat)
      } else {
        // Comparar datas para manter o mais recente
        const currentDate = new Date(chat.lastActivity || chat.createdAt)
        const existingDate = new Date(existing.lastActivity || existing.createdAt)
        
        if (currentDate > existingDate) {
          seen.set(key, chat)
        }
      }
    })
    
    const result = Array.from(seen.values())
    console.log(`🔧 Deduplicação: ${chats.length} → ${result.length} chats`)
    return result
  }

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
  const [isSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true'
  })
  const [showTransferAcceptModal, setShowTransferAcceptModal] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileChatList, setShowMobileChatList] = useState(true)
  
  // Estados para salvar documentos
  const [showSaveDocumentModal, setShowSaveDocumentModal] = useState(false)
  const [selectedDocumentToSave, setSelectedDocumentToSave] = useState<any>(null)
  const [documentDescription, setDocumentDescription] = useState('')
  const [documentCategory, setDocumentCategory] = useState('outros')
  const [documentTags, setDocumentTags] = useState('')
  const [isImportantDocument, setIsImportantDocument] = useState(false)
  
  // Estados para emoji picker e upload de arquivos
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para colar imagens
  const [pastedImage, setPastedImage] = useState<File | null>(null)
  const [showPastedImagePreview, setShowPastedImagePreview] = useState(false)
  const [pastedImagePreview, setPastedImagePreview] = useState<string | null>(null)

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

        // 🔧 DEDUPLICAR CHATS por contactNumber (manter o mais recente)
        const deduplicatedChats = deduplicateChats(convertedChats)
        
        // Preservar mensagens existentes e status atualizados recentemente
        setHumanChats(prevChats => {
          return deduplicatedChats.map((newChat: HumanChat) => {
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

  // Função para lidar com salvamento de documento
  const handleSaveDocument = (messageId: string, fileInfo: any) => {
    console.log('📁 Iniciando salvamento de documento:', { messageId, fileInfo })
    
    // Guardar informações do documento selecionado
    setSelectedDocumentToSave({
      messageId,
      ...fileInfo
    })
    
    // Limpar campos do modal
    setDocumentDescription('')
    setDocumentCategory('outros')
    setDocumentTags('')
    setIsImportantDocument(false)
    
    // Abrir modal
    setShowSaveDocumentModal(true)
  }

  // Função para confirmar salvamento do documento
  const confirmSaveDocument = async () => {
    if (!selectedDocumentToSave || !documentDescription.trim()) {
      alert('Por favor, adicione uma descrição para o documento.')
      return
    }

    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('💾 Salvando documento no sistema...', {
        messageId: selectedDocumentToSave.messageId,
        description: documentDescription,
        category: documentCategory
      })

      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId: parseInt(selectedDocumentToSave.messageId),
          description: documentDescription.trim(),
          category: documentCategory,
          tags: documentTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          isImportant: isImportantDocument
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Documento salvo com sucesso:', data)
        
        // Fechar modal
        setShowSaveDocumentModal(false)
        setSelectedDocumentToSave(null)
        
        // Mostrar confirmação
        alert('📁 Documento catalogado com sucesso no sistema!')
        
      } else {
        const error = await response.json()
        console.error('❌ Erro ao salvar documento:', error)
        alert(error.message || 'Erro ao salvar documento')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar documento:', error)
      alert('Erro interno ao salvar documento')
    }
  }

  // Função para deletar mensagem para todos
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ Token de autenticação não encontrado')
        return
      }

      console.log('🗑️ Deletando mensagem para todos:', messageId)

      const response = await fetch(`/api/messages/${messageId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Mensagem deletada com sucesso:', data)
        
        // Remover mensagem do estado local
        setHumanChats(chats => chats.map(chat => ({
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId)
        })))
        
        // Notificar via socket sobre a deleção
        if (socket) {
          const currentChat = humanChats.find(chat => 
            chat.messages.some(msg => msg.id === messageId)
          )
          
          if (currentChat) {
            socket.emit('delete_message_for_all', {
              messageId: messageId,
              chatId: currentChat.contactNumber + '@c.us',
              operatorName: operatorName
            })
          }
        }
        
        console.log('✅ Mensagem deletada para todos')
        
      } else {
        const error = await response.json()
        console.error('❌ Erro ao deletar mensagem:', error)
        alert(error.message || 'Erro ao deletar mensagem')
      }
    } catch (error) {
      console.error('❌ Erro ao deletar mensagem:', error)
      alert('Erro interno ao deletar mensagem')
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

      // Usar API correta de mensagens por chat humano - carregar TODAS as mensagens
      const response = await fetch(`/api/messages/human-chats/${chatId}/messages?include_all=true&limit=1000`, {
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
           console.log('🔄 Convertendo mensagem do banco:', msg)
           // Garantir que a data seja válida
           const messageDate = msg.created_at ? new Date(msg.created_at) : new Date()
           const validDate = isNaN(messageDate.getTime()) ? new Date() : messageDate
           
           const baseMessage = {
             id: msg.id.toString(),
             from: msg.sender_type === 'contact' ? `${currentChat.contactNumber}@c.us` : msg.sender_type,
             to: msg.sender_type === 'contact' ? 'operator' : `${currentChat.contactNumber}@c.us`,
             body: msg.content || '',
             timestamp: validDate,
             isFromBot: msg.sender_type === 'bot',
             isFromHuman: msg.sender_type === 'operator',
             // Dados de mídia se existirem - MAPEAMENTO COMPLETO DOS CAMPOS
             message_type: msg.message_type, // Campo original do banco
             messageType: msg.message_type, // Para compatibilidade
             media_url: msg.media_url, // URL da mídia
             fileUrl: msg.media_url, // Para compatibilidade
             media_name: msg.media_name, // Nome original do arquivo
             fileName: msg.media_name || msg.fileName, // Para compatibilidade
             media_size: msg.media_size, // Tamanho do arquivo
             fileSize: msg.media_size || msg.fileSize, // Para compatibilidade
             media_type: msg.media_type, // MIME type
             mimeType: msg.media_type || msg.mimeType, // Para compatibilidade
             hasMedia: !!msg.media_url && msg.message_type !== 'text'
           }
           
           console.log('🔄 Mensagem base criada:', {
             id: baseMessage.id,
             messageType: baseMessage.message_type,
             fileUrl: baseMessage.media_url,
             fileName: baseMessage.media_name,
             mimeType: baseMessage.media_type
           })
           
           return detectMessageType(baseMessage)
         })
        
        console.log('✅ Mensagens convertidas:', convertedMessages)
        
        // Atualizar o chat com as mensagens - SEMPRE sobrescrever com histórico completo
        setHumanChats(chats => {
          const updatedChats = chats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  messages: convertedMessages, // Sobrescrever completamente as mensagens
                  hasNewMessage: false, // Marcar como lida ao carregar
                  unreadCount: 0 // Reset contador
                }
              : chat
          )
          console.log('✅ Estado atualizado com histórico completo - chat encontrado:', updatedChats.find(c => c.id === chatId))
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
        
        // Mostrar modal de assumir se a conversa estiver pendente e não atribuída
        if (currentChat.status === 'pending' && !currentChat.assignedOperator && !dismissedTakeModals.has(selectedChat)) {
          setTimeout(() => {
            setShowTakeChatModal(selectedChat)
          }, 500) // Pequeno delay para melhor UX
        }
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

  // Função para lidar com imagens coladas (Ctrl+V)
  const handlePaste = useCallback(async (event: any) => {
    if (!selectedChat) return
    
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Verificar se é uma imagem
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault()
        
        const file = item.getAsFile()
        if (!file) continue

        console.log('📋 Imagem colada:', { name: file.name, type: file.type, size: file.size })

        // Criar preview da imagem
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string
          setPastedImagePreview(imageDataUrl)
          setPastedImage(file)
          setShowPastedImagePreview(true)
        }
        reader.readAsDataURL(file)
        
        break
      }
    }
  }, [selectedChat])

  // Adicionar listener para colar imagens (Ctrl+V)
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-main')
    if (chatContainer && selectedChat) {
      const handleGlobalPaste = (e: Event) => handlePaste(e)
      
      // Adicionar listener apenas quando há chat selecionado
      chatContainer.addEventListener('paste', handleGlobalPaste)
      
      return () => {
        chatContainer.removeEventListener('paste', handleGlobalPaste)
      }
    }
  }, [selectedChat, handlePaste])

  // Lista de emojis mais usados
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲',
    '🤝', '🙏', '✍️', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜',
    '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯',
    '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
    '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑'
  ]

  // Função para inserir emoji no texto
  const insertEmoji = (emoji: string) => {
    setNewChatMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }



  // Função para enviar imagem colada
  const sendPastedImage = async () => {
    if (!pastedImage || !selectedChat) return

    try {
      const currentChat = humanChats.find(chat => chat.id === selectedChat)
      if (!currentChat) return

      const formData = new FormData()
      
      // Criar nome único para a imagem colada
      const timestamp = Date.now()
      const extension = pastedImage.type.split('/')[1] || 'png'
      const fileName = `pasted_image_${timestamp}.${extension}`
      
      formData.append('file', pastedImage, fileName)
      formData.append('chatId', currentChat.contactNumber + '@c.us')
      formData.append('operatorName', operatorName)

      const authToken = localStorage.getItem('authToken')
      
      console.log('📤 Enviando imagem colada:', fileName)
      
      const response = await fetch('/api/messages/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Imagem colada enviada com sucesso:', data)
        
        // Fechar preview
        setShowPastedImagePreview(false)
        setPastedImage(null)
        setPastedImagePreview(null)
        
        // Mostrar confirmação
        console.log('🖼️ Imagem enviada para', currentChat.contactName)
      } else {
        const error = await response.json()
        console.error('❌ Erro ao enviar imagem colada:', error)
        alert(error.message || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload da imagem colada:', error)
      alert('Erro ao enviar imagem colada')
    }
  }

  // Função para cancelar envio da imagem colada
  const cancelPastedImage = () => {
    setShowPastedImagePreview(false)
    setPastedImage(null)
    setPastedImagePreview(null)
  }

  // Função para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar se é um arquivo válido (PDF, imagem, documento)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use PDF, imagens ou documentos do Office.')
      return
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10MB.')
      return
    }

    try {
      const currentChat = humanChats.find(chat => chat.id === selectedChat)
      if (!currentChat) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('chatId', currentChat.contactNumber + '@c.us')
      formData.append('operatorName', operatorName)

      const authToken = localStorage.getItem('authToken')
      const response = await fetch('/api/messages/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Arquivo enviado com sucesso:', data)
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = await response.json()
        console.error('❌ Erro ao enviar arquivo:', error)
        alert(error.message || 'Erro ao enviar arquivo')
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      alert('Erro ao enviar arquivo')
    }
  }

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
    
    // Preparar mensagem com referência se estiver respondendo
    let messageText = newChatMessage.trim()
    if (replyingToMessage) {
      const replyPrefix = `_Em resposta a:_ "${replyingToMessage.body.substring(0, 50)}${replyingToMessage.body.length > 50 ? '...' : ''}"\n\n`
      messageText = replyPrefix + messageText
    }
    
    // Enviar via socket - a mensagem será adicionada via operator_message_saved
    if (socket) {
      const messageData = {
        chatId: currentChat.contactNumber + '@c.us',
        message: messageText,
        operatorName: operatorName,
        replyTo: replyingToMessage ? {
          messageId: replyingToMessage.id,
          content: replyingToMessage.body.substring(0, 100)
        } : undefined
      };
      console.log('📤 Enviando mensagem do operador via socket:', messageData);
      socket.emit('send_operator_message', messageData);
    }
    
    setNewChatMessage('')
    setReplyingToMessage(null) // Limpar resposta após enviar
    
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
        
        // Mostrar modal de assumir para nova conversa pendente após recarregar dados
        setTimeout(() => {
          // Aguardar o reload e então buscar a nova conversa
          setTimeout(() => {
            setHumanChats(currentChats => {
              const newChat = currentChats.find(chat => chat.contactNumber === data.customerPhone)
              if (newChat && newChat.status === 'pending' && !newChat.assignedOperator && !dismissedTakeModals.has(newChat.id)) {
                setShowTakeChatModal(newChat.id)
              }
              return currentChats
            })
          }, 1000)
        }, 1000)
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
          
          // Garantir que a data seja válida
          const operatorDate = data.timestamp ? new Date(data.timestamp) : new Date()
          const validOperatorDate = isNaN(operatorDate.getTime()) ? new Date() : operatorDate
          
          const newMessage = {
            id: data.messageId.toString(),
            from: 'operator',
            to: data.chatId,
            body: data.message,
            timestamp: validOperatorDate,
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
      messageId?: number  // ✅ ADICIONAR messageId do banco
      messageType?: string
      mediaUrl?: string
      fileName?: string
      fileSize?: number
      mimeType?: string
      hasMedia?: boolean
    }) => {
      console.log('📩 Mensagem do cliente recebida via socket:', data)
      console.log('📩 Chats atuais:', humanChats.map(c => ({id: c.id, contactNumber: c.contactNumber})))
      
      // Mostrar notificação para nova mensagem do cliente
      const notificationText = data.hasMedia 
        ? `${data.customerName}: [${data.messageType?.toUpperCase() || 'MÍDIA'}] ${data.fileName || ''}`
        : `${data.customerName}: ${data.message.substring(0, 50)}...`;
      
      showNotification(
        data.hasMedia ? '📎 Nova Mídia' : '💬 Nova Mensagem',
        notificationText,
        data.chatId
      )
      
      // Adicionar mensagem do cliente ao chat existente
      const customerPhone = data.chatId.replace('@c.us', '')
      
      // Garantir que a data seja válida
      const customerDate = data.timestamp ? new Date(data.timestamp) : new Date()
      const validCustomerDate = isNaN(customerDate.getTime()) ? new Date() : customerDate
      
      const newMessage: ChatMessage = {
        id: data.messageId ? data.messageId.toString() : Date.now().toString(), // ✅ USAR ID REAL DO BANCO
        from: data.chatId,
        to: 'operator',
        body: data.message || '',
        timestamp: validCustomerDate,
        isFromBot: false,
        isFromHuman: false,
        // Incluir informações de mídia se presente
        ...(data.hasMedia && {
          messageType: data.messageType as any,
          fileUrl: data.mediaUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          hasMedia: true
        })
      }
      
      setHumanChats(chats =>
        chats.map(chat => {
          if (chat.contactNumber === customerPhone) {
            // Verificar se a mensagem já existe para evitar duplicatas (verificação mais robusta)
            const messageExists = chat.messages.some(msg => {
              // Verificar por ID primeiro (mais confiável)
              if (data.messageId && msg.id === data.messageId.toString()) {
                return true
              }
              
              // Verificar por conteúdo e tempo como fallback
              const timeDiff = Math.abs(new Date(msg.timestamp).getTime() - validCustomerDate.getTime())
              return msg.body === data.message && 
                     msg.fileUrl === data.mediaUrl && 
                     timeDiff < 2000
            })

            if (messageExists) {
              console.log('📝 Mensagem duplicada ignorada')
              return chat
            }

            // Se o chat estava encerrado, reativar automaticamente
            const wasFinished = chat.status === 'resolved' || chat.status === 'finished'
            const updatedStatus = wasFinished ? 'active' : chat.status

            // Só incrementar unreadCount se o chat não estiver selecionado atualmente
            const shouldIncrementUnread = selectedChat !== chat.id

            // Se era uma conversa pendente e recebeu mensagem, remover do dismissed (dar nova chance de assumir)
            if (chat.status === 'pending' && !chat.assignedOperator) {
              setDismissedTakeModals(prev => {
                const newSet = new Set(prev)
                newSet.delete(chat.id)
                return newSet
              })
            }

            // Se a conversa estava encerrada e foi reativada, forçar carregamento completo do histórico
            if (wasFinished && selectedChat === chat.id) {
              console.log('🔄 Conversa reativada, forçando carregamento do histórico completo')
              setTimeout(() => {
                loadChatMessages(chat.id)
              }, 500)
            }

            return {
              ...chat,
              status: updatedStatus as any,
              messages: [...chat.messages, newMessage],
              lastActivity: validCustomerDate,
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
        
        // Se for um novo chat, mostrar modal de assumir após carregar dados
        if (data.type === 'new_chat') {
          setTimeout(() => {
            setHumanChats(currentChats => {
              const newChat = currentChats.find(chat => chat.id === data.chatId.toString())
              if (newChat && newChat.status === 'pending' && !newChat.assignedOperator && !dismissedTakeModals.has(newChat.id)) {
                setShowTakeChatModal(newChat.id)
              }
              return currentChats
            })
          }, 1500)
        }
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

    // Listener para arquivos enviados com sucesso
    socket.on('file_sent_success', (data: {
      chatId: string
      messageId: number
      filename: string
      mediaUrl: string
      timestamp: Date
      operatorName: string
    }) => {
      console.log('📎 Arquivo enviado com sucesso:', data);
      
      // Atualizar a lista de chats para mostrar a nova mensagem
      setHumanChats(prevChats => 
        prevChats.map(chat => {
          if (chat.contactNumber + '@c.us' === data.chatId) {
            // Criar nova mensagem de arquivo
            const newMessage: ChatMessage = {
              id: `${data.messageId}`,
              from: 'operator',
              to: chat.contactNumber,
              body: `*${data.operatorName}:* 📎 ${data.filename} ✅`,
              timestamp: new Date(data.timestamp),
              isFromBot: false,
              isFromHuman: true,
              messageType: 'document',
              fileUrl: data.mediaUrl,
              fileName: data.filename
            };

            // Adicionar mensagem ao chat se não existir
            const messageExists = chat.messages.some(msg => msg.id === newMessage.id);
            if (!messageExists) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage.body,
                lastMessageTime: newMessage.timestamp
              };
            }
          }
          return chat;
        })
      );
    });

    // Listener para alertas instantâneos da dashboard
    socket.on('dashboard_instant_alert', (data: {
      type: 'chat_reopened' | 'menu_access'
      chatId: number
      customerName: string
      customerPhone: string
      message: string
      timestamp: Date
    }) => {
      console.log('🚨 Alerta instantâneo da dashboard:', data);
      
      // Se for um chat reaberto (opção 1 ou 3), recarregar lista de chats
      if (data.type === 'chat_reopened') {
        console.log('🔄 Chat reaberto detectado, recarregando lista de chats');
        loadChatsFromDatabase();
        
        // Mostrar notificação
        showNotification(`Chat reaberto: ${data.customerName}`, data.message);
      }
    });

    return () => {
      socket.off('human_chat_requested')
      socket.off('customer_message')
      socket.off('operator_message_saved')
      socket.off('chat_transferred')
      socket.off('dashboard_chat_update')
      socket.off('human_chat_status_changed')
      socket.off('dashboard_instant_alert')
      socket.off('operator_message_error')
      socket.off('message_send_error')
      socket.off('message_sent_confirmation')
      socket.off('file_sent_success')
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
                          {formatMessageTime(chat.lastActivity)}
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
                        onClick={() => setShowTakeChatModal(currentChat.id)}
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
                                         {currentChat.messages.map(message => {
                       // Debug da renderização de mensagens
                       console.log('🎨 Renderizando mensagem:', {
                         id: message.id,
                         messageType: message.messageType,
                         hasFileUrl: !!message.fileUrl,
                         fileUrl: message.fileUrl,
                         fileName: message.fileName,
                         body: message.body?.substring(0, 50)
                       })
                       
                       return (
                         <div
                           key={message.id}
                           className={`message ${message.isFromBot ? 'bot' : message.isFromHuman ? 'human' : 'customer'}`}
                         >
                           <div className="message-content">
                             {/* Debug visual do tipo da mensagem */}
                             {process.env.NODE_ENV === 'development' && (
                               <div style={{ 
                                 fontSize: '10px', 
                                 color: '#999', 
                                 marginBottom: '4px',
                                 fontFamily: 'monospace'
                               }}>
                                 DEBUG: tipo={message.messageType} | hasFile={!!message.fileUrl}
                               </div>
                             )}
                             
                             {/* Renderizar conteúdo baseado no tipo de mensagem */}
                             {message.messageType === 'audio' && message.fileUrl && (
                               <AudioPlayer 
                                 audioUrl={message.fileUrl} 
                                 fileName={message.fileName}
                                 messageId={message.id}
                                 onDeleteMessage={handleDeleteMessage}
                               />
                             )}
                             
                             {message.messageType === 'document' && message.fileUrl && (
                               <DocumentViewer 
                                 fileUrl={message.fileUrl}
                                 fileName={message.fileName}
                                 fileSize={message.fileSize}
                                 mimeType={message.mimeType}
                                 messageId={message.id}
                                 onSaveDocument={handleSaveDocument}
                                 onDeleteMessage={handleDeleteMessage}
                               />
                             )}
                             
                             {message.messageType === 'image' && message.fileUrl && (
                               <ImageViewer 
                                 imageUrl={message.fileUrl}
                                 fileName={message.fileName}
                                 messageId={message.id}
                                 onDeleteMessage={handleDeleteMessage}
                                 onSaveDocument={handleSaveDocument}
                               />
                             )}
                             
                             {message.messageType === 'video' && message.fileUrl && (
                               <div className="video-viewer">
                                 <video 
                                   controls 
                                   className="message-video"
                                   preload="metadata"
                                   onError={(e) => {
                                     console.error('❌ Erro ao carregar vídeo:', message.fileUrl)
                                     e.currentTarget.style.display = 'none'
                                     const errorDiv = document.createElement('div')
                                     errorDiv.innerHTML = '⚠️ Erro ao carregar vídeo'
                                     errorDiv.style.cssText = 'padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; color: #6b7280;'
                                     e.currentTarget.parentNode?.appendChild(errorDiv)
                                   }}
                                   onLoadedData={() => {
                                     console.log('✅ Vídeo carregado:', message.fileUrl)
                                   }}
                                 >
                                   <source src={message.fileUrl.startsWith('http') ? message.fileUrl : window.location.origin + (message.fileUrl.startsWith('/') ? '' : '/') + message.fileUrl} type={message.mimeType} />
                                   Seu navegador não suporta reprodução de vídeo.
                                 </video>
                                 <div className="video-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                   <a 
                                     href={message.fileUrl.startsWith('http') ? message.fileUrl : window.location.origin + (message.fileUrl.startsWith('/') ? '' : '/') + message.fileUrl} 
                                     download={message.fileName} 
                                     className="download-button"
                                     title="Baixar vídeo"
                                     style={{
                                       background: 'rgba(255, 255, 255, 0.1)',
                                       color: '#e9edef',
                                       border: 'none',
                                       borderRadius: '6px',
                                       width: '28px',
                                       height: '28px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       textDecoration: 'none',
                                       fontSize: '12px'
                                     }}
                                   >
                                     ⬇️
                                   </a>
                                   <button 
                                     onClick={() => {
                                       if (confirm('Tem certeza que deseja apagar este vídeo para todos? Esta ação não pode ser desfeita.')) {
                                         handleDeleteMessage(message.id)
                                       }
                                     }}
                                     title="Apagar para todos"
                                     style={{
                                       background: 'rgba(220, 38, 38, 0.1)',
                                       color: '#dc2626',
                                       border: '1px solid rgba(220, 38, 38, 0.3)',
                                       borderRadius: '6px',
                                       width: '28px',
                                       height: '28px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       cursor: 'pointer',
                                       fontSize: '12px'
                                     }}
                                   >
                                     🗑️
                                   </button>
                                 </div>
                               </div>
                             )}
                             
                             {/* Mostrar texto da mensagem se existir (pode acompanhar mídia) */}
                             {message.body && message.body.trim() && (
                               <div className="message-text">{message.body}</div>
                             )}
                             
                             <div className="message-actions">
                               <div className="message-time">
                                 {formatMessageTime(message.timestamp)}
                               </div>
                               
                               <div className="message-buttons">
                                 {/* Botão de responder (apenas para mensagens do cliente) */}
                                 {!message.isFromHuman && !message.isFromBot && (
                                   <button
                                     className="reply-button"
                                     onClick={() => setReplyingToMessage(message)}
                                     title="Responder a esta mensagem"
                                     style={{
                                       background: 'rgba(255, 255, 255, 0.1)',
                                       color: '#e9edef',
                                       border: 'none',
                                       borderRadius: '4px',
                                       width: '24px',
                                       height: '24px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       cursor: 'pointer',
                                       marginLeft: '4px',
                                       fontSize: '12px'
                                     }}
                                   >
                                     ↩️
                                   </button>
                                 )}
                                 
                                 {/* Botão de deletar para todos (apenas para operadores/gestores) */}
                                 {(message.isFromHuman || message.isFromBot) && (
                                   <button
                                     className="delete-button"
                                     onClick={() => {
                                       if (confirm('Tem certeza que deseja apagar esta mensagem para todos? Esta ação não pode ser desfeita.')) {
                                         handleDeleteMessage(message.id)
                                       }
                                     }}
                                     title="Apagar para todos"
                                     style={{
                                       background: 'rgba(220, 38, 38, 0.1)',
                                       color: '#dc2626',
                                       border: '1px solid rgba(220, 38, 38, 0.2)',
                                       borderRadius: '4px',
                                       width: '24px',
                                       height: '24px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       cursor: 'pointer',
                                       marginLeft: '4px',
                                       fontSize: '12px'
                                     }}
                                   >
                                     🗑️
                                   </button>
                                 )}
                               </div>
                             </div>
                           </div>
                         </div>
                       )
                     })}
                  </div>

                  <div className="chat-input-fixed">
                    {/* Indicador de resposta */}
                    {replyingToMessage && (
                      <div className="reply-indicator">
                        <div className="reply-content">
                          <div className="reply-header">
                            <Reply size={14} />
                            <span>Respondendo para {currentChat.contactName}</span>
                            <button 
                              className="cancel-reply"
                              onClick={() => setReplyingToMessage(null)}
                              title="Cancelar resposta"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="reply-preview">
                            {replyingToMessage.body.substring(0, 80)}
                            {replyingToMessage.body.length > 80 && '...'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="input-container">
                      {/* Botões de ação */}
                      <div className="input-actions">
                        {/* Botão de emoji */}
                        <button
                          className="action-btn emoji-btn"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          title="Adicionar emoji"
                        >
                          <Smile size={18} />
                        </button>
                        
                        {/* Botão de upload */}
                        <button
                          className="action-btn upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          title="Enviar arquivo"
                        >
                          <Paperclip size={18} />
                        </button>
                        
                        {/* Input de arquivo oculto */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </div>

                      <textarea
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder={
                          replyingToMessage
                            ? `Responder a "${replyingToMessage.body.substring(0, 30)}${replyingToMessage.body.length > 30 ? '...' : ''}"`
                            : currentChat.status === 'pending' && !currentChat.assignedOperator
                              ? `Assuma a conversa para responder...`
                              : `Responder para ${currentChat.contactName}... (Ctrl+V para colar imagens)`
                        }
                        disabled={currentChat.status === 'pending' && !currentChat.assignedOperator}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                          if (e.key === 'Escape') {
                            setReplyingToMessage(null)
                          }
                        }}
                        onPaste={handlePaste}
                      />
                      <button
                        className="btn-send"
                        onClick={sendMessage}
                        disabled={
                          !newChatMessage.trim() ||
                          (currentChat.status === 'pending' && !currentChat.assignedOperator)
                        }
                        title={replyingToMessage ? "Enviar resposta" : "Enviar mensagem"}
                      >
                        <Send size={18} />
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        <div className="emoji-header">
                          <span>Emojis mais usados</span>
                          <button
                            className="close-emoji"
                            onClick={() => setShowEmojiPicker(false)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="emoji-grid">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              className="emoji-btn"
                              onClick={() => insertEmoji(emoji)}
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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

      {/* Modal para Assumir Conversa */}
      {showTakeChatModal && (
        <div className="modal-overlay" onClick={() => setShowTakeChatModal(null)}>
          <div className="modal-content take-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤝 Assumir Conversa</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTakeChatModal(null)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {(() => {
                const chat = humanChats.find(c => c.id === showTakeChatModal)
                if (!chat) return null
                
                return (
                  <div className="take-chat-content">
                    <div className="chat-info-card">
                      <div className="chat-avatar">
                        <Users size={24} />
                      </div>
                      <div className="chat-details">
                        <h4>{chat.contactName}</h4>
                        <p className="phone-number">{chat.contactNumber}</p>
                        <p className="chat-status">
                          <span className="status-indicator pending"></span>
                          Aguardando atendimento
                        </p>
                      </div>
                    </div>
                    
                    <div className="take-chat-message">
                      <p>Esta conversa está aguardando atendimento. Você deseja assumir esta conversa e começar a atender este cliente?</p>
                      
                      <div className="chat-preview">
                        {chat.messages.length > 0 ? (
                          <div className="last-message">
                            <strong>Última mensagem:</strong>
                            <p>"{chat.messages[chat.messages.length - 1]?.body.substring(0, 100)}
                            {chat.messages[chat.messages.length - 1]?.body.length > 100 && '...'}"</p>
                            <small>
                              {formatFullDateTime(chat.messages[chat.messages.length - 1]?.timestamp)}
                            </small>
                          </div>
                        ) : (
                          <p className="no-messages">Ainda não há mensagens nesta conversa.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowTakeChatModal(null)}
              >
                Fechar
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  if (showTakeChatModal) {
                    setDismissedTakeModals(prev => new Set(prev).add(showTakeChatModal))
                    setShowTakeChatModal(null)
                  }
                }}
              >
                ⏰ Lembrar Depois
              </button>
              <button 
                className="btn-confirm btn-take"
                onClick={async () => {
                  if (showTakeChatModal) {
                    await handleTakeChat(showTakeChatModal)
                    setShowTakeChatModal(null)
                  }
                }}
              >
                <Users size={16} />
                Assumir Conversa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para salvar documento */}
      {showSaveDocumentModal && selectedDocumentToSave && (
        <div className="modal-overlay">
          <div className="modal-content save-document-modal">
            <div className="modal-header">
              <h3>📁 Catalogar Documento</h3>
              <button className="modal-close" onClick={() => setShowSaveDocumentModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="document-preview">
                <div className="document-icon">
                  <FileText size={24} />
                </div>
                <div className="document-info">
                  <div className="document-name">
                    {selectedDocumentToSave.fileName || 'Documento'}
                  </div>
                  <div className="document-size">
                    {selectedDocumentToSave.fileSize ? 
                      `${(selectedDocumentToSave.fileSize / (1024 * 1024)).toFixed(1)} MB` : 
                      'Tamanho desconhecido'
                    }
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="document-description">
                  <strong>Descrição *</strong>
                  <span className="help-text">Ex: Comprovante de pagamento da passagem</span>
                </label>
                <textarea
                  id="document-description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Descreva o conteúdo e propósito do documento..."
                  rows={3}
                  maxLength={500}
                />
                <div className="char-count">
                  {documentDescription.length}/500 caracteres
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="document-category">
                  <strong>Categoria</strong>
                </label>
                <select
                  id="document-category"
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                >
                  <option value="pagamento">💳 Pagamento</option>
                  <option value="documento_pessoal">👤 Documento Pessoal</option>
                  <option value="comprovante">📄 Comprovante</option>
                  <option value="contrato">📋 Contrato</option>
                  <option value="outros">📂 Outros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="document-tags">
                  <strong>Tags (opcional)</strong>
                  <span className="help-text">Separadas por vírgula</span>
                </label>
                <input
                  type="text"
                  id="document-tags"
                  value={documentTags}
                  onChange={(e) => setDocumentTags(e.target.value)}
                  placeholder="Ex: passagem, goiania, janeiro"
                  maxLength={200}
                />
              </div>

              <div className="form-group checkbox-group">
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '0',
                  flexDirection: 'row',
                  justifyContent: 'flex-start'
                }}>
                  <input
                    type="checkbox"
                    checked={isImportantDocument}
                    onChange={(e) => setIsImportantDocument(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      margin: '0',
                      flexShrink: 0
                    }}
                  />
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: '16px',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                  }}>⭐ Marcar como importante</span>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => setShowSaveDocumentModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button"
                className="btn-confirm"
                onClick={confirmSaveDocument}
                disabled={!documentDescription.trim()}
              >
                💾 Catalogar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para preview de imagem colada */}
      {showPastedImagePreview && pastedImagePreview && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ 
            maxWidth: '450px', 
            width: '90%',
            maxHeight: '80vh',
            fontSize: '14px',
            position: 'relative',
            margin: '20px'
          }}>
            <div className="modal-header" style={{ 
              padding: '1rem 1.5rem',
              fontSize: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>📋 Enviar Imagem Colada</h3>
              <button className="modal-close" onClick={cancelPastedImage}>
                <XCircle size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ 
              padding: '1rem 1.5rem',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>Você colou uma imagem. Deseja enviá-la para o cliente?</p>
              </div>
              
              <div className="pasted-image-preview" style={{
                textAlign: 'center',
                marginBottom: '15px',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <img 
                  src={pastedImagePreview} 
                  alt="Imagem colada" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                  {pastedImage && (
                    <>
                      Tipo: {pastedImage.type} | 
                      Tamanho: {(pastedImage.size / 1024).toFixed(1)} KB
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ 
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              background: '#f8fafc',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}>
              <button 
                type="button"
                className="btn-cancel"
                onClick={cancelPastedImage}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#718096',
                  cursor: 'pointer'
                }}
              >
                ❌ Cancelar
              </button>
              <button 
                type="button"
                className="btn-confirm"
                onClick={sendPastedImage}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '13px',
                  background: '#25d366',
                  borderColor: '#25d366',
                  color: 'white',
                  border: '1px solid #25d366',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📤 Enviar Imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HumanChat
