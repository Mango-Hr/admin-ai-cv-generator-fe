import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import './Input.css'

/**
 * Textarea component with labels, validation, help text
 */
const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  required = false,
  disabled = false,
  rows = 4,
  error,
  helpText,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const textareaId = id || `textarea-${name}`
  const hasError = !!error

  const wrapperClasses = [
    'input-wrapper',
    `input-wrapper--${size}`,
    hasError && 'input-wrapper--error',
    className,
  ].filter(Boolean).join(' ')

  const textareaClasses = ['input-field', 'textarea-field'].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={textareaId} className="input-label">
          {label}
          {required && <span className="input-label__required">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined
        }
        {...props}
      />

      {hasError && (
        <div id={`${textareaId}-error`} className="input-error" role="alert">
          <AlertCircle className="input-error__icon" />
          <span>{error}</span>
        </div>
      )}

      {!hasError && helpText && (
        <div id={`${textareaId}-help`} className="input-help">
          {helpText}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
