import { useState } from 'react'
import {
  MessageSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface LoginProps {
  onNavigate: (page: 'landing' | 'register' | 'dashboard') => void
}

export default function Login({ onNavigate }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Fazer login real na API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Login bem-sucedido
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onNavigate('dashboard')
      } else {
        // Erro de login
        setErrors({ general: data.error || 'Credenciais inválidas' })
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setErrors({ general: 'Erro ao conectar com servidor. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Back Button */}
        <button 
          className="auth-back-btn"
          onClick={() => onNavigate('landing')}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <MessageSquare size={32} />
              <span>WhatsApp Bot Pro</span>
            </div>
            <h1 className="auth-title">Bem-vindo de volta!</h1>
            <p className="auth-subtitle">
              Faça login para acessar seu dashboard e gerenciar seus chatbots
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className="input-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Senha
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="input-error">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" />
                <span className="checkbox-text">Lembrar de mim</span>
              </label>
              <button type="button" className="link-button">
                Esqueci minha senha
              </button>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="spinner" />
                  Entrando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Ainda não tem uma conta?{' '}
              <button 
                className="link-button"
                onClick={() => onNavigate('register')}
                disabled={isLoading}
              >
                Criar conta grátis
              </button>
            </p>
          </div>
        </div>


      </div>
    </div>
  )
}
