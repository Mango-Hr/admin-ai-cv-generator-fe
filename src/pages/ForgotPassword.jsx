import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { useToast } from '../contexts/ToastContext'
import { requestPasswordReset } from '../services/submissionsService'
import { getUserFriendlyError, logTechnicalError } from '../utils/errorMessages'
import logoImg from '../assets/textbg.png'
import './Login.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const prefillEmail = location.state?.email || ''

  const [email, setEmail] = useState(prefillEmail)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setSent(true)
      toast.success('If that email is registered, a reset link has been sent.')
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('ForgotPassword', technicalError)
      setErrors({ email: userMessage })
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="login">
        <motion.div
          className="login__container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login__card">
            <div className="login__header">
              <div className="login__logo">
                <img src={logoImg} alt="Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', transform: 'scale(3.2)', marginLeft: '5px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <CheckCircle2 size={48} style={{ color: '#22c55e' }} />
              </div>
              <h1 className="login__title">Check Your Email</h1>
              <p className="login__subtitle">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                The link expires in 30 minutes. Check your spam folder if you don't see it.
              </p>
              <Button
                variant="secondary"
                size="lg"
                icon={<ArrowLeft />}
                onClick={() => navigate('/login', { state: { email } })}
                style={{ width: '100%' }}
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="login">
      <motion.div
        className="login__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login__card">
          {/* Header */}
          <div className="login__header">
            <div className="login__logo">
              <img src={logoImg} alt="Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', transform: 'scale(3.2)', marginLeft: '5px' }} />
            </div>
            <h1 className="login__title">Forgot Password?</h1>
            <p className="login__subtitle">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form className="login__form" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
              icon={<Mail />}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              icon={<ArrowRight />}
              iconPosition="right"
              className="login__submit"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Footer */}
          <div className="login__footer">
            <p className="login__footer-text">
              <Link to="/login" className="login__footer-link">
                ← Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
