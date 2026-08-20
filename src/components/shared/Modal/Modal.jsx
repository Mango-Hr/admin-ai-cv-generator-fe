import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './Modal.css'

/**
 * Modal component with animations
 * Overlay, backdrop blur, scale+fade animation
 */
export function Modal({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className = '',
}) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-portal">
          {/* Backdrop */}
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          >
            {/* Modal */}
            <motion.div
              className={`modal modal--${size} ${className}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Modal Header
 */
export function ModalHeader({ children, title, showClose = true, onClose, className = '' }) {
  return (
    <div className={`modal__header ${className}`}>
      {title ? (
        <>
          <h2 className="modal__title">{title}</h2>
          {showClose && onClose && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="modal__header-content">{children}</div>
          {showClose && onClose && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Modal Body
 */
export function ModalBody({ children, className = '' }) {
  return <div className={`modal__body ${className}`}>{children}</div>
}

/**
 * Modal Footer
 */
export function ModalFooter({ children, className = '' }) {
  return <div className={`modal__footer ${className}`}>{children}</div>
}
