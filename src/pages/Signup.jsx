import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { validatePhoneNumber, formatPhoneNumberForDisplay } from '../utils/phoneValidator'
import { getUserFriendlyError, logTechnicalError } from '../utils/errorMessages'
import logoImg from '../assets/textbg.png'
import './Signup.css'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export default function Signup() {
  const navigate = useNavigate()
  const { isAuthenticated, signup } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    gender: '',
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validate fields in order and stop at first error
    
    // Validate first name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
      setErrors(newErrors)
      return false
    }

    // Validate last name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
      setErrors(newErrors)
      return false
    }

    // Validate email
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

    // Validate confirm password
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password'
      setErrors(newErrors)
      return false
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
      setErrors(newErrors)
      return false
    }

    // Validate phone
    const phoneValidation = validatePhoneNumber(formData.phone)
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message
      setErrors(newErrors)
      return false
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
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
      // Validate and format phone number
      const phoneValidation = validatePhoneNumber(formData.phone)
      
      await signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: phoneValidation.formattedNumber, // Send formatted phone number
        gender: formData.gender,
      })
      
      toast.success('Account created successfully!')
      navigate('/admin')
    } catch (error) {
      const { userMessage, technicalError } = getUserFriendlyError(error.message)
      logTechnicalError('Signup', technicalError)
      toast.error(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="signup">
      <motion.div
        className="signup__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="signup__card">
          {/* Header */}
          <div className="signup__header">
            <div className="signup__logo">
              <img src={logoImg} alt="Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', transform: 'scale(3.2)', marginLeft: '5px' }} />
            </div>
            <h1 className="signup__title">Create Account</h1>
            <p className="signup__subtitle">
              Join our platform and start managing CVs
            </p>
          </div>

          {/* Form */}
          <form className="signup__form" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="signup__form-row">
              <Input
                label="First Name"
                type="text"
                name="first_name"
                placeholder="first name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
              />
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                placeholder="last name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
              />
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="email"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail />}
              error={errors.email}
            />

            {/* Password */}
            <div className="signup__password-field">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock />}
                error={errors.password}
              />
              <button
                type="button"
                className="signup__password-toggle"
                onClick={togglePasswordVisibility}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="signup__password-field">
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                icon={<Lock />}
                error={errors.confirm_password}
              />
              <button
                type="button"
                className="signup__password-toggle"
                onClick={togglePasswordVisibility}
                title={showPassword ? 'Hide passwords' : 'Show passwords'}
              >
                {/* {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} */}
              </button>
            </div>

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+234 000-000-0000"
              value={formData.phone}
              onChange={handleChange}
              icon={<Phone />}
              error={errors.phone}
            />

            {/* Gender */}
            <div className="signup__form-group">
              <label htmlFor="gender" className="signup__label">
                Gender <span className="signup__required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`signup__select ${errors.gender ? 'signup__select--error' : ''}`}
              >
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <div className="signup__error" role="alert">
                  {errors.gender}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              icon={<ArrowRight />}
              iconPosition="right"
              className="signup__submit"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="signup__footer">
            <p className="signup__footer-text">
              Already have an account?{' '}
              <Link to="/login" className="signup__footer-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
