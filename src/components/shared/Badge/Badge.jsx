import './Badge.css'

/**
 * Badge component for status indicators
 * Variants: new, in-progress, completed, urgent, info, success, warning, error
 */
export default function Badge({
  children,
  variant = 'info',
  size = 'md',
  dot = false,
  pill = true,
  className = '',
  ...props
}) {
  const classes = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    pill && 'badge--pill',
    dot && 'badge--with-dot',
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
