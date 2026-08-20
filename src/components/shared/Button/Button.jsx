import { forwardRef } from 'react'
import './Button.css'

/**
 * Button component matching landing page CTA style
 * Variants: primary, secondary, ghost, destructive
 * Sizes: sm, md, lg
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}, ref) => {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full-width',
    loading && 'button--loading',
    disabled && 'button--disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="button__spinner" aria-hidden="true">
          <svg className="button__spinner-icon" viewBox="0 0 24 24" fill="none">
            <circle
              className="button__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="button__icon button__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span className="button__content">
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="button__icon button__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
