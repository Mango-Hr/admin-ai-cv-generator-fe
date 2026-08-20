import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Clock,
  Eye,
  AlertCircle,
  Play,
  CheckCircle2,
  User,
  Calendar,
  Filter,
  RefreshCw,
  ListChecks,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import { default as Avatar } from '../components/shared/Avatar'
import Button from '../components/shared/Button'
import Skeleton from '../components/shared/Skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { tasksService } from '../services/mockData'
import './TaskManagement.css'

const COLUMNS = [
  { id: 'pending', title: 'To Do', icon: <AlertCircle />, color: 'pending' },
  { id: 'in_progress', title: 'In Progress', icon: <Play />, color: 'progress' },
  { id: 'review', title: 'Review', icon: <Eye />, color: 'review' },
  { id: 'completed', title: 'Done', icon: <CheckCircle2 />, color: 'done' },
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'my_tasks', label: 'My Tasks' },
  { value: 'high_priority', label: 'High Priority' },
  { value: 'overdue', label: 'Overdue' },
]

export default function TaskManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const tasksData = await tasksService.getAll()
      setTasks(tasksData)
    } catch (error) {
      toast.error('Failed to load tasks')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTasks = () => {
    let filtered = [...tasks]

    switch (filter) {
      case 'my_tasks':
        filtered = filtered.filter(t => t.assignedTo?.id === user?.id)
        break
      case 'high_priority':
        filtered = filtered.filter(t => t.priority === 'high')
        break
      case 'overdue':
        filtered = filtered.filter(t => isAfter(new Date(), t.dueDate))
        break
      default:
        break
    }

    return filtered
  }

  const getTasksByStatus = (status) => {
    const filtered = getFilteredTasks()
    return filtered.filter(task => task.status === status)
  }

  const getTaskDueStatus = (dueDate) => {
    const now = new Date()
    if (isAfter(now, dueDate)) {
      return 'overdue'
    }
    if (isBefore(dueDate, addDays(now, 2))) {
      return 'soon'
    }
    return 'normal'
  }

  const filteredTasks = getFilteredTasks()
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id)
  const overdueTasks = tasks.filter(t => isAfter(new Date(), t.dueDate))

  return (
    <AdminLayout>
      <div className="task-management">
        {/* Header */}
        <div className="task-management__header">
          <div className="task-management__title-section">
            <h1 className="task-management__title">Task Management</h1>
            <p className="task-management__subtitle">
              Organize and track your work across submissions
            </p>
          </div>
          <div className="task-management__actions">
            <Button variant="ghost" icon={<RefreshCw />} onClick={loadTasks}>
              Refresh
            </Button>
            <Button variant="primary" icon={<CheckSquare />}>
              New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="task-stats">
          <div className="task-stat task-stat--total">
            <div className="task-stat__icon">
              <ListChecks size={20} />
            </div>
            <div className="task-stat__info">
              <div className="task-stat__value">{filteredTasks.length}</div>
              <div className="task-stat__label">Total Tasks</div>
            </div>
          </div>
          <div className="task-stat task-stat--pending">
            <div className="task-stat__icon">
              <User size={20} />
            </div>
            <div className="task-stat__info">
              <div className="task-stat__value">{myTasks.length}</div>
              <div className="task-stat__label">My Tasks</div>
            </div>
          </div>
          <div className="task-stat task-stat--overdue">
            <div className="task-stat__icon">
              <AlertCircle size={20} />
            </div>
            <div className="task-stat__info">
              <div className="task-stat__value">{overdueTasks.length}</div>
              <div className="task-stat__label">Overdue</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="task-management__filters">
          {FILTER_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`filter-pill ${filter === option.value ? 'filter-pill--active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              <span className="filter-pill__count">
                {option.value === 'all' && filteredTasks.length}
                {option.value === 'my_tasks' && myTasks.length}
                {option.value === 'high_priority' && tasks.filter(t => t.priority === 'high').length}
                {option.value === 'overdue' && overdueTasks.length}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" height={400} />
            ))}
          </div>
        ) : (
          <motion.div
            className="task-board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.id)
              
              return (
                <div key={column.id} className={`task-column task-column--${column.color}`}>
                  <div className="task-column__header">
                    <div className="task-column__title-wrapper">
                      <span className="task-column__icon">{column.icon}</span>
                      <span className="task-column__title">{column.title}</span>
                    </div>
                    <span className="task-column__count">{columnTasks.length}</span>
                  </div>
                  <div className="task-column__body">
                    {columnTasks.length === 0 ? (
                      <div className="task-column__empty">
                        <CheckSquare className="task-column__empty-icon" />
                        <div className="task-column__empty-text">No tasks in this column</div>
                      </div>
                    ) : (
                      columnTasks.map((task, index) => {
                        const dueStatus = getTaskDueStatus(task.dueDate)
                        
                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={`/admin/submissions/${task.submissionId}`}
                              className="task-card"
                            >
                              <div className="task-card__header">
                                <div className="task-card__submission">{task.submissionId}</div>
                                <div className={`task-card__priority task-card__priority--${task.priority}`}>
                                  {task.priority}
                                </div>
                              </div>
                              
                              <div className="task-card__title">{task.title}</div>
                              
                              <div className="task-card__description">
                                {task.description}
                              </div>

                              <div className="task-card__client">
                                <User className="task-card__client-icon" />
                                {task.clientName}
                              </div>
                              
                              <div className="task-card__footer">
                                <div className="task-card__assignee">
                                  <Avatar
                                    fallback={task.assignedTo.name}
                                    size="xs"
                                  />
                                  <span>{task.assignedTo.name.split(' ')[0]}</span>
                                </div>
                                <div className={`task-card__due task-card__due--${dueStatus}`}>
                                  <Clock size={12} />
                                  {format(task.dueDate, 'MMM d')}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
