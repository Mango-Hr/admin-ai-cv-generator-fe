import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, User, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import { Input, Select } from '../components/shared/Input'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { verifyInvitationToken, acceptAdminInvitation, declineAdminInvitation } from '../services/authService'
import { getUserFriendlyError, logTechnicalError } from '../utils/errorMessages'
import logoImg from '../assets/textbg.png'
import './AcceptInvitation.css'

export default function AcceptInvitation() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  
  const token = searchParams.get('token')
  const action = searchParams.get('action') || 'accept'

  const [stage, setStage] = useState('verifying') // verifying -> form -> success -> decline
  const [inviteData, setInviteData] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    phone: '',
    gender: '',
  })

  // Verify token on mount
  useEffect(() => {
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    if (!token) {
      setStage('error')
      toast.error('Invalid invitation link - missing token')
      return
    }

    setLoading(true)
    try {
      const data = await verifyInvitationToken(token)
      setInviteData(data)
      
      // If action is decline, show decline confirmation
      if (action === 'decline') {
        setStage('decline-confirm')
      } else {
        setStage('form')
      }
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('Verify Invitation', technicalError)
      toast.error(userMessage)
      setStage('error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAccept = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await acceptAdminInvitation({
        token,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
      })

      setStage('success')
      toast.success('Invitation accepted! Logging you in...')

      // Auto-login with the returned token
      setTimeout(() => {
        // Store token and redirect to dashboard
        localStorage.setItem('auth_token', response.access_token)
        navigate('/admin')
      }, 2000)
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('Accept Invitation', technicalError)
      setErrors({ submit: userMessage })
      toast.error(userMessage)
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)

    try {
      await declineAdminInvitation({ token })
      setStage('decline-success')
      toast.success('Invitation declined')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('Decline Invitation', technicalError)
      toast.error(userMessage)
      setLoading(false)
    }
  }

  return (
    <div className="accept-invitation">
      <motion.div
        className="accept-invitation__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="accept-invitation__card">
          {/* Header */}
          <div className="accept-invitation__header">
            <div className="accept-invitation__logo">
              <img src={logoImg} alt="Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', transform: 'scale(3.2)', marginLeft: '5px' }} />
            </div>
            <h1 className="accept-invitation__title">
              {stage === 'verifying' ? 'Verifying Invitation...' : 
               stage === 'form' ? 'Complete Your Profile' :
               stage === 'success' ? 'Welcome!' :
               stage === 'decline-confirm' ? 'Decline Invitation' :
               stage === 'decline-success' ? 'Invitation Declined' :
               'Invalid Invitation'}
            </h1>
            <p className="accept-invitation__subtitle">
              {stage === 'verifying' ? 'Please wait while we verify your invitation token...' : 
               stage === 'form' ? `You have been invited as a ${inviteData?.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}` :
               stage === 'success' ? 'You have successfully accepted the invitation!' :
               stage === 'decline-confirm' ? 'Are you sure you want to decline this invitation?' :
               stage === 'decline-success' ? 'The invitation has been declined.' :
               'This invitation link is invalid or has expired.'}
            </p>
          </div>

          {/* Verifying Stage */}
          {stage === 'verifying' && (
            <div className="accept-invitation__loading">
              <div className="accept-invitation__spinner"></div>
              <p>Verifying your invitation...</p>
            </div>
          )}

          {/* Form Stage */}
          {stage === 'form' && inviteData && (
            <form className="accept-invitation__form" onSubmit={handleAccept}>
              <div className="accept-invitation__info-box">
                <Mail size={16} />
                <span>Invitation for: <strong>{inviteData.email}</strong></span>
              </div>

              <div className="accept-invitation__row">
                <Input
                  label="First Name"
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  icon={<User />}
                  error={errors.first_name}
                />

                <Input
                  label="Last Name"
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  icon={<User />}
                  error={errors.last_name}
                />
              </div>

              <div className="accept-invitation__password-field">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock />}
                  error={errors.password}
                  hideErrorBorder={true}
                />
                <button
                  type="button"
                  className="accept-invitation__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Input
                label="Phone Number (Optional)"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone />}
                error={errors.phone}
              />

              <div className="accept-invitation__field">
                <label className="accept-invitation__label">Gender (Optional)</label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Select>
              </div>

              {errors.submit && (
                <div className="accept-invitation__error">
                  <AlertCircle size={16} />
                  <span>{errors.submit}</span>
                </div>
              )}

              <div className="accept-invitation__actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStage('decline-confirm')}
                  disabled={loading}
                >
                  Decline
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  {loading ? 'Accepting...' : 'Accept & Continue'}
                </Button>
              </div>
            </form>
          )}

          {/* Success Stage */}
          {stage === 'success' && (
            <div className="accept-invitation__success">
              <CheckCircle2 size={64} className="accept-invitation__success-icon" />
              <h3 className="accept-invitation__success-title">Welcome!</h3>
              <p className="accept-invitation__success-message">
                Your account has been created successfully. You are being redirected to the dashboard...
              </p>
            </div>
          )}

          {/* Decline Confirm Stage */}
          {stage === 'decline-confirm' && (
            <div className="accept-invitation__decline-confirm">
              <div className="accept-invitation__decline-icon">
                <AlertCircle size={48} />
              </div>
              <p className="accept-invitation__decline-text">
                You are about to decline this invitation. Once declined, you will not be able to use this link.
              </p>
              <div className="accept-invitation__actions">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStage('form')}
                  disabled={loading}
                >
                  Keep It
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  loading={loading}
                  disabled={loading}
                  onClick={handleDecline}
                >
                  {loading ? 'Declining...' : 'Decline Invitation'}
                </Button>
              </div>
            </div>
          )}

          {/* Decline Success Stage */}
          {stage === 'decline-success' && (
            <div className="accept-invitation__success">
              <CheckCircle2 size={64} className="accept-invitation__success-icon" />
              <h3 className="accept-invitation__success-title">Invitation Declined</h3>
              <p className="accept-invitation__success-message">
                The invitation has been declined. Redirecting to login page...
              </p>
            </div>
          )}

          {/* Error Stage */}
          {stage === 'error' && (
            <div className="accept-invitation__error-full">
              <AlertCircle size={64} className="accept-invitation__error-icon" />
              <h3 className="accept-invitation__error-title">Invalid Invitation</h3>
              <p className="accept-invitation__error-message">
                This invitation link is invalid, has expired, or has already been used.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
