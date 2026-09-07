import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { useToast } from '../contexts/ToastContext'
import { submitPasswordReset } from '../services/submissionsService'
import { getUserFriendlyError, logTechnicalError } from '../utils/errorMessages'
import logoImg from '../assets/textbg.png'
import './Login.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // If no token in URL, show an error state
  if (!token) {
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
              <h1 className="login__title">Invalid Reset Link</h1>
              <p className="login__subtitle">
                This password reset link is invalid or missing a token. Please request a new one.
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight />}
                iconPosition="right"
                onClick={() => navigate('/forgot-password')}
                style={{ width: '100%' }}
              >
                Request New Link
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (success) {
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
              <h1 className="login__title">Password Reset</h1>
              <p className="login__subtitle">
                Your password has been updated. You're being signed in…
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const validate = () => {
    const newErrors = {}

    if (!newPassword) {
      newErrors.newPassword = 'Password is required'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!validate()) return

    setLoading(true)

    try {
      const result = await submitPasswordReset(token, newPassword)

      // Store the fresh access token and redirect to dashboard
      if (result?.access_token) {
        localStorage.setItem('admin_token', result.access_token)
        localStorage.setItem('admin_user', JSON.stringify({
          id: result.id,
          first_name: result.first_name,
          last_name: result.last_name,
          email: result.email,
          role: result.role,
          is_active: result.is_active,
        }))
      }

      setSuccess(true)
      toast.success('Password reset successfully! Redirecting…')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin', { replace: true })
      }, 1500)
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('ResetPassword', technicalError)
      setErrors({ newPassword: userMessage })
      setLoading(false)
    }
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
            <h1 className="login__title">Set New Password</h1>
            <p className="login__subtitle">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Form */}
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__password-field">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: '' })) }}
                icon={<Lock />}
                error={errors.newPassword}
                hideErrorBorder={true}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="login__password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
              </button>
            </div>

            <div className="login__password-field">
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })) }}
                icon={<Lock />}
                error={errors.confirmPassword}
                hideErrorBorder={true}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login__password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={25} /> : <Eye size={25} />}
              </button>
            </div>

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
              {loading ? 'Resetting...' : 'Reset Password'}
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
