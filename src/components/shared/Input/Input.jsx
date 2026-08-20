import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import './Input.css'

/**
 * Input component with labels, validation, help text
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  required = false,
  disabled = false,
  error,
  helpText,
  icon,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${name}`
  const hasError = !!error

  const wrapperClasses = [
    'input-wrapper',
    `input-wrapper--${size}`,
    hasError && 'input-wrapper--error',
    className,
  ].filter(Boolean).join(' ')

  const inputClasses = ['input-field'].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-label__required">*</span>}
        </label>
      )}

      <div className={icon ? 'input-with-icon' : ''}>
        {icon && (
          <span className="input-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          {...props}
        />
      </div>

      {hasError && (
        <div id={`${inputId}-error`} className="input-error" role="alert">
          <AlertCircle className="input-error__icon" />
          <span>{error}</span>
        </div>
      )}

      {!hasError && helpText && (
        <div id={`${inputId}-help`} className="input-help">
          {helpText}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
