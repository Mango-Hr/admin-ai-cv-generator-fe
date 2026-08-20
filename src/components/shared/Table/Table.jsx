import { ChevronUp, ChevronDown } from 'lucide-react'
import './Table.css'

/**
 * Table component
 * Data table with hover rows, sticky header, responsive
 */
export function Table({ children, striped = false, hover = true, bordered = false, className = '' }) {
  const classes = [
    'table-container',
    className,
  ].filter(Boolean).join(' ')

  const tableClasses = [
    'table',
    striped && 'table--striped',
    hover && 'table--hover',
    bordered && 'table--bordered',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <table className={tableClasses}>
        {children}
      </table>
    </div>
  )
}

/**
 * Table Header
 */
export function TableHeader({ children, sticky = true, className = '' }) {
  const classes = [
    'table__header',
    sticky && 'table__header--sticky',
    className,
  ].filter(Boolean).join(' ')

  return (
    <thead className={classes}>
      {children}
    </thead>
  )
}

/**
 * Table Body
 */
export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`table__body ${className}`}>
      {children}
    </tbody>
  )
}

/**
 * Table Row
 */
export function TableRow({ children, onClick, selected = false, className = '' }) {
  const classes = [
    'table__row',
    onClick && 'table__row--clickable',
    selected && 'table__row--selected',
    className,
  ].filter(Boolean).join(' ')

  return (
    <tr className={classes} onClick={onClick}>
      {children}
    </tr>
  )
}

/**
 * Table Head cell (for header)
 */
export function TableHead({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left',
  className = '',
}) {
  const classes = [
    'table__head',
    `table__head--${align}`,
    sortable && 'table__head--sortable',
    className,
  ].filter(Boolean).join(' ')

  const handleSort = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  return (
    <th className={classes} onClick={handleSort}>
      <div className="table__head-content">
        <span>{children}</span>
        {sortable && (
          <span className="table__sort-icon" aria-hidden="true">
            {sortDirection === 'asc' ? (
              <ChevronUp size={16} />
            ) : sortDirection === 'desc' ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronDown size={16} style={{ opacity: 0.3 }} />
            )}
          </span>
        )}
      </div>
    </th>
  )
}

/**
 * Table Cell
 */
export function TableCell({ children, align = 'left', className = '' }) {
  const classes = [
    'table__cell',
    `table__cell--${align}`,
    className,
  ].filter(Boolean).join(' ')

  return <td className={classes}>{children}</td>
}
