import './EmptyState.css'

/**
 * EmptyState component
 * Meaningful empty screens for no data scenarios
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = '',
}) {
  const classes = [
    'empty-state',
    compact && 'empty-state--compact',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="empty-state__title">{title}</h3>
      )}

      {description && (
        <p className="empty-state__description">{description}</p>
      )}

      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  )
}
