import './Card.css'

/**
 * Card component matching features card style
 */
export function Card({
  children,
  hover = false,
  accent = null,
  flat = false,
  outlined = false,
  ghost = false,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'card',
    hover && 'card--hoverable',
    accent && 'card--accent',
    accent && `card--accent-${accent}`,
    flat && 'card--flat',
    outlined && 'card--outlined',
    ghost && 'card--ghost',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Header
 */
export function CardHeader({
  children,
  title,
  subtitle,
  action,
  withBorder = false,
  className = '',
}) {
  const classes = [
    'card__header',
    withBorder && 'card__header--with-border',
    className,
  ].filter(Boolean).join(' ')

  if (title || subtitle) {
    return (
      <div className={classes}>
        <div className="card__header-content">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
        {action && <div className="card__header-action">{action}</div>}
      </div>
    )
  }

  return <div className={classes}>{children}</div>
}

/**
 * Card Icon (like features cards)
 */
export function CardIcon({ children, color = 'blue', className = '' }) {
  const classes = [
    'card__icon',
    `card__icon--${color}`,
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}

/**
 * Card Body
 */
export function CardBody({ children, compact = false, className = '' }) {
  const classes = [
    'card__body',
    compact && 'card__body--compact',
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}

/**
 * Card Footer
 */
export function CardFooter({ children, noBorder = false, className = '' }) {
  const classes = [
    'card__footer',
    noBorder && 'card__footer--no-border',
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
