import './Skeleton.css'

/**
 * Skeleton loader component
 * Loading placeholder that matches content shape
 */
export function Skeleton({
  width,
  height,
  circle = false,
  variant = 'rectangular',
  animation = 'pulse',
  className = '',
  style = {},
}) {
  const classes = [
    'skeleton',
    `skeleton--${variant}`,
    `skeleton--${animation}`,
    circle && 'skeleton--circle',
    className,
  ].filter(Boolean).join(' ')

  const skeletonStyle = {
    width,
    height,
    ...style,
  }

  return <div className={classes} style={skeletonStyle} aria-busy="true" aria-live="polite" />
}

/**
 * Pre-built skeleton patterns
 */

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '80%' : '100%'}
          height="1rem"
          style={{ marginBottom: i < lines - 1 ? 'var(--space-2)' : 0 }}
        />
      ))}
    </div>
  )
}

// Card skeleton
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton-card__header">
        <Skeleton circle width="48px" height="48px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="1.25rem" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton width="40%" height="0.875rem" />
        </div>
      </div>
      <div className="skeleton-card__body">
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

// Table skeleton
export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`skeleton-table ${className}`}>
      {/* Header */}
      <div className="skeleton-table__header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="80%" height="1rem" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="90%" height="0.875rem" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: '32px',
    md: '40px',
    lg: '64px',
    xl: '96px',
  }

  return (
    <Skeleton
      circle
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  )
}
