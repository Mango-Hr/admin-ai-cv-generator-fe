import { useState, useEffect } from 'react'
import Button from '../Button'
import './ProgressiveLoadingButton.css'

export default function ProgressiveLoadingButton({
  isLoading,
  onClick,
  children,
  icon: Icon,
  disabled,
  variant = 'primary',
  size = 'md',
  style = {},
  ...props
}) {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setPercentage(0)
      return
    }

    // Start at 0, quickly ramp up to 40%, then slowly reach 95%
    let currentPercentage = 0
    let speed = 2 // Start with fast increments

    const interval = setInterval(() => {
      currentPercentage += speed

      // Slow down as we approach 40%
      if (currentPercentage >= 40) {
        speed = 0.5 // Much slower increments
      }

      // Cap at 95% (final 5% comes on completion)
      if (currentPercentage > 95) {
        currentPercentage = 95
      }

      setPercentage(Math.floor(currentPercentage))
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading])

  // Show 100% when loading finishes
  useEffect(() => {
    if (!isLoading && percentage < 100) {
      setPercentage(100)
      
      // Reset after showing 100%
      const timeout = setTimeout(() => {
        setPercentage(0)
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [isLoading, percentage])

  return (
    <div className="progressive-loading-button" style={style}>
      <Button
        variant={variant}
        size={size}
        icon={!isLoading && Icon ? <Icon /> : undefined}
        onClick={onClick}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="progressive-loading-button__text">
          {children}
          {isLoading && (
            <span className="progressive-loading-button__percentage">
              {percentage}%
            </span>
          )}
        </span>
      </Button>
      
      {isLoading && (
        <div className="progressive-loading-button__bar">
          <div
            className="progressive-loading-button__bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
