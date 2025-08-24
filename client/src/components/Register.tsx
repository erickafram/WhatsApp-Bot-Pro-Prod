import { useState } from 'react'
import {
  MessageSquare,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react'

interface RegisterProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void
}

export default function Register({ onNavigate }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [acceptTerms, setAcceptTerms] = useState(false)

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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Nome da empresa é obrigatório'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!acceptTerms) {
      newErrors.terms = 'Você deve aceitar os termos de uso'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Fazer registro real na API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Registro bem-sucedido
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onNavigate('dashboard')
      } else {
        // Erro no registro
        setErrors({ general: data.error || 'Erro ao criar conta' })
      }
    } catch (error) {
      console.error('Erro no registro:', error)
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
        <div className="auth-card register-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <MessageSquare size={32} />
              <span>ChatBot What</span>
            </div>
            <h1 className="auth-title">Crie sua conta grátis</h1>
            <p className="auth-subtitle">
              Comece hoje mesmo a automatizar seu WhatsApp e aumentar suas vendas
            </p>
            <div className="register-benefits">
              <div className="benefit-tag">
                <Sparkles size={14} />
                <span>7 dias grátis</span>
              </div>
              <div className="benefit-tag">
                <Shield size={14} />
                <span>Sem compromisso</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Nome completo
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <span className="input-error">{errors.name}</span>
                )}
              </div>

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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Telefone/WhatsApp
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <span className="input-error">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building size={16} />
                  Empresa
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="company"
                    className={`form-input ${errors.company ? 'error' : ''}`}
                    placeholder="Nome da sua empresa"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.company && (
                  <span className="input-error">{errors.company}</span>
                )}
              </div>
            </div>

            <div className="form-row">
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
                    placeholder="Mínimo 6 caracteres"
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

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Confirmar senha
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="input-error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-text">
                  Eu aceito os{' '}
                  <button type="button" className="link-button">
                    Termos de Uso
                  </button>{' '}
                  e{' '}
                  <button type="button" className="link-button">
                    Política de Privacidade
                  </button>
                </span>
              </label>
              {errors.terms && (
                <span className="input-error">{errors.terms}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="spinner" />
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Criar conta grátis
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Já tem uma conta?{' '}
              <button 
                className="link-button"
                onClick={() => onNavigate('login')}
                disabled={isLoading}
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>

        {/* Security Info */}
        {/* Trust Indicators */}
      </div>
    </div>
  )
}
