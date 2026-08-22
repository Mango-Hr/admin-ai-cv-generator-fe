import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Mail, Lock, Info, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import logoImg from '../assets/textbg.png'
import './Login.css'

const DEMO_ACCOUNTS = [
  { email: 'admin@company.com', password: 'admin123', role: 'Admin', badge: 'admin' },
  { email: 'sarah@company.com', password: 'sarah123', role: 'Sub-Admin', badge: 'sub' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate email first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      setErrors(newErrors)
      return false
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      setErrors(newErrors)
      return false
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required'
      setErrors(newErrors)
      return false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Login successful!')
      navigate('/admin')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (account) => {
    setFormData(prev => ({
      ...prev,
      email: account.email,
      password: account.password,
    }))
    toast.info(`Demo credentials loaded for ${account.role}`)
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
            <h1 className="login__title">Welcome Back</h1>
            <p className="login__subtitle">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form className="login__form" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="admin@company.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail />}
              error={errors.email}
              autoComplete="email"
            />

            <div className="login__password-field">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock />}
                error={errors.password}
                autoComplete="current-password"
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

            <div className="login__remember">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="login__checkbox"
              />
              <label htmlFor="remember" className="login__remember-label">
                Remember me
              </label>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="login__demo">
            <div className="login__demo-title">
              <Info size={16} className="login__demo-icon" />
              Demo Accounts
            </div>
            <div className="login__demo-list">
              {DEMO_ACCOUNTS.map((account, index) => (
                <div
                  key={index}
                  className="login__demo-item"
                  onClick={() => handleDemoLogin(account)}
                >
                  <div className="login__demo-role">
                    <span>{account.role}</span>
                    <span className={`login__demo-role-badge login__demo-role-badge--${account.badge}`}>
                      {account.badge.toUpperCase()}
                    </span>
                  </div>
                  <div className="login__demo-email">{account.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="login__footer">
            <p className="login__footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="login__footer-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
