import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import './Input.css'

/**
 * Select component with labels, validation, help text
 */
const Select = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  required = false,
  disabled = false,
  options = [],
  error,
  helpText,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const selectId = id || `select-${name}`
  const hasError = !!error

  const wrapperClasses = [
    'input-wrapper',
    `input-wrapper--${size}`,
    hasError && 'input-wrapper--error',
    className,
  ].filter(Boolean).join(' ')

  const selectClasses = ['input-field', 'select-field'].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
          {required && <span className="input-label__required">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => {
          // Support both string[] and {label, value}[]
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>

      {hasError && (
        <div id={`${selectId}-error`} className="input-error" role="alert">
          <AlertCircle className="input-error__icon" />
          <span>{error}</span>
        </div>
      )}

      {!hasError && helpText && (
        <div id={`${selectId}-help`} className="input-help">
          {helpText}
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
