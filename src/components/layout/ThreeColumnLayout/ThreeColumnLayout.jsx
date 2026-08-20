import './ThreeColumnLayout.css'

/**
 * ThreeColumnLayout
 * Left panel (20%) + Center (50%) + Right panel (30%)
 * Used for CV generation page
 */
export default function ThreeColumnLayout({ children, className = '' }) {
  return (
    <div className={`three-column-layout ${className}`}>
      {children}
    </div>
  )
}

export function ThreeColumnLeft({ children, className = '' }) {
  return (
    <aside className={`three-column-layout__left ${className}`}>
      {children}
    </aside>
  )
}

export function ThreeColumnCenter({ children, className = '' }) {
  return (
    <div className={`three-column-layout__center ${className}`}>
      {children}
    </div>
  )
}

export function ThreeColumnRight({ children, className = '' }) {
  return (
    <aside className={`three-column-layout__right ${className}`}>
      {children}
    </aside>
  )
}
