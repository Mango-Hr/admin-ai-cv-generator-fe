import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import Button from '../Button'
import { Input, Select } from '../Input'
import { useToast } from '../../../contexts/ToastContext'
import { sendAdminInvitation } from '../../../services/authService'
import './InviteAdminModal.css'

export default function InviteAdminModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'sub_admin',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate role
    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await sendAdminInvitation(formData.email, formData.role)
      setSuccess(true)
      setLoading(false)
      toast.success(`Invitation sent to ${formData.email}`)

      // Reset and close after a delay
      setTimeout(() => {
        handleClose()
        onSuccess?.()
      }, 2000)
    } catch (error) {
      const message = error.message || 'Failed to send invitation'
      setErrors({ submit: message })
      toast.error(message)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ email: '', role: 'sub_admin' })
    setErrors({})
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="invite-modal-overlay" onClick={handleClose}>
      <motion.div
        className="invite-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="invite-modal__header">
          <div>
            <h2 className="invite-modal__title">Invite Admin</h2>
            <p className="invite-modal__subtitle">Send an invitation to a new team member</p>
          </div>
          <button
            className="invite-modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="invite-modal__content">
            <div className="invite-modal__success">
              <CheckCircle2 size={48} className="invite-modal__success-icon" />
              <h3 className="invite-modal__success-title">Invitation Sent!</h3>
              <p className="invite-modal__success-message">
                An invitation email has been sent to <strong>{formData.email}</strong>
              </p>
              <p className="invite-modal__success-detail">
                They can accept or decline the invitation within 7 days.
              </p>
            </div>
          </div>
        )}

        {/* Form State */}
        {!success && (
          <form className="invite-modal__form" onSubmit={handleSubmit}>
            <div className="invite-modal__content">
              {/* Email Input */}
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
                autoFocus
              />

              {/* Role Selector */}
              <div className="invite-modal__field">
                <label className="invite-modal__label">Role</label>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="sub_admin">Sub Admin</option>
                  <option value="super_admin">Super Admin</option>
                </Select>
                <p className="invite-modal__role-hint">
                  Sub admins can manage clients and submissions. Super admins have full access including staff and prompt management.
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="invite-modal__error">
                  <AlertCircle size={16} />
                  <span>{errors.submit}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="invite-modal__actions">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading}
                icon={<Send />}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
