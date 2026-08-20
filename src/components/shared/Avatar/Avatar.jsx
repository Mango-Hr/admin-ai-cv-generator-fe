import { User } from 'lucide-react'
import './Avatar.css'

/**
 * Avatar component
 * User profile images with fallback
 */
export default function Avatar({
  src,
  alt = 'User avatar',
  fallback,
  size = 'md',
  status,
  color,
  className = '',
  ...props
}) {
  const classes = [
    'avatar',
    `avatar--${size}`,
    status && 'avatar--with-status',
    color && `avatar--${color}`,
    className,
  ].filter(Boolean).join(' ')

  // Generate initials from fallback text
  const getInitials = (text) => {
    if (!text) return ''
    const names = text.trim().split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className={classes} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar__image" />
      ) : fallback ? (
        <div className="avatar__fallback">
          {getInitials(fallback)}
        </div>
      ) : (
        <div className="avatar__icon">
          <User />
        </div>
      )}

      {status && (
        <span className={`avatar__status avatar__status--${status}`} aria-label={status} />
      )}
    </div>
  )
}

/**
 * Avatar Group
 * Stack multiple avatars
 */
export function AvatarGroup({ children, max = 3, size = 'md', className = '' }) {
  const childrenArray = Array.isArray(children) ? children : [children]
  const visibleAvatars = childrenArray.slice(0, max)
  const remainingCount = childrenArray.length - max

  return (
    <div className={`avatar-group avatar-group--${size} ${className}`}>
      {visibleAvatars}
      {remainingCount > 0 && (
        <div className={`avatar avatar--${size} avatar--count`}>
          <div className="avatar__fallback">+{remainingCount}</div>
        </div>
      )}
    </div>
  )
}
