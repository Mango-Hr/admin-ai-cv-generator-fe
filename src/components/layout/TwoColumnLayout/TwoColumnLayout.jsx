import './TwoColumnLayout.css'

/**
 * TwoColumnLayout
 * Main content (70%) + Sidebar (30%)
 * Used for detail pages
 */
export default function TwoColumnLayout({ children, className = '' }) {
  return (
    <div className={`two-column-layout ${className}`}>
      {children}
    </div>
  )
}

export function TwoColumnMain({ children, className = '' }) {
  return (
    <div className={`two-column-layout__main ${className}`}>
      {children}
    </div>
  )
}

export function TwoColumnSidebar({ children, className = '' }) {
  return (
    <aside className={`two-column-layout__sidebar ${className}`}>
      {children}
    </aside>
  )
}
