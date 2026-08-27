import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  GripVertical,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { Input, Select } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { getTasks, getTaskMetrics, createTask, updateTaskStatus, updateTask, deleteTask } from '../services/tasksService'
import './TaskManagement.css'

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done']
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'normal', label: 'Normal', color: '#3B82F6' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
]

export default function TaskManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    status: 'todo',
    due_date: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, metricsData] = await Promise.all([
        getTasks(),
        getTaskMetrics(),
      ])
      setTasks(tasksData)
      setMetrics(metricsData)
    } catch (error) {
      toast.error('Failed to load tasks')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    if (!draggedTask) return

    try {
      await updateTaskStatus(draggedTask.id, newStatus)
      setTasks(prev =>
        prev.map(t => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
      )
      toast.success(`Task moved to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update task status')
      console.error(error)
    } finally {
      setDraggedTask(null)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const createdTask = await createTask(newTaskData)
      setTasks(prev => [...prev, createdTask])
      setNewTaskData({
        title: '',
        description: '',
        priority: 'normal',
        status: 'todo',
        due_date: '',
      })
      setShowNewTaskForm(false)
      toast.success('Task created successfully')
    } catch (error) {
      toast.error('Failed to create task')
      console.error(error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted successfully')
    } catch (error) {
      toast.error('Failed to delete task')
      console.error(error)
    }
  }

  const getFilteredTasks = (status) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
      return matchesStatus && matchesSearch && matchesPriority
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return '#3B82F6'
      case 'in_progress':
        return '#F59E0B'
      case 'review':
        return '#8B5CF6'
      case 'done':
        return '#10B981'
      default:
        return '#6B7280'
    }
  }

  const getPriorityColor = (priority) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority)
    return option?.color || '#6B7280'
  }

  // Return with AdminLayout but show only task-specific skeleton
  if (loading) {
    return (
      <AdminLayout>
        <div className="task-management" style={{ paddingTop: 0 }}>
          {/* Header Skeleton */}
          <div className="task-management__header">
            <div className="task-management__title-section">
              <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="60%" height={16} />
            </div>
            <Skeleton width={100} height={40} />
          </div>

          {/* Metrics Skeleton */}
          <div className="task-management__metrics">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="metric-card">
                <Skeleton width="70%" height={14} style={{ marginBottom: 'var(--space-2)' }} />
                <Skeleton width="40%" height={32} />
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="task-management__filters">
            <div className="filter-group">
              <Skeleton width="60px" height={14} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="100%" height={40} />
            </div>
            <div className="filter-group">
              <Skeleton width="60px" height={14} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="100%" height={40} />
            </div>
          </div>

          {/* Kanban Board Skeleton */}
          <div className="kanban-board">
            {[...Array(4)].map((_, colIndex) => (
              <div key={colIndex} className="kanban-column">
                <div className="kanban-column__header">
                  <Skeleton width="80%" height={24} />
                </div>
                <div className="kanban-column__content">
                  {[...Array(3)].map((_, cardIndex) => (
                    <div key={cardIndex} style={{ 
                      padding: 'var(--space-3)', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: 'var(--radius-md)', 
                      marginBottom: 'var(--space-2)',
                      background: 'var(--color-bg-secondary)'
                    }}>
                      <Skeleton width="90%" height={18} style={{ marginBottom: 'var(--space-2)' }} />
                      <Skeleton width="100%" height={14} style={{ marginBottom: 'var(--space-2)' }} />
                      <Skeleton width="60%" height={14} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="task-management">
        {/* Header */}
        <div className="task-management__header">
          <div className="task-management__title-section">
            <h1 className="task-management__title">Task Board</h1>
            <p className="task-management__subtitle">
              Manage and track CV fulfillment tasks
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={() => setShowNewTaskForm(true)}
          >
            New Task
          </Button>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="task-management__metrics">
            <div className="metric-card">
              <div className="metric-card__label">Total Tasks</div>
              <div className="metric-card__value">{metrics.total_tasks}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Overdue</div>
              <div className="metric-card__value" style={{ color: '#EF4444' }}>
                {metrics.overdue_tasks}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">To Do</div>
              <div className="metric-card__value">{metrics.by_status.todo}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">In Progress</div>
              <div className="metric-card__value">{metrics.by_status.in_progress}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Review</div>
              <div className="metric-card__value">{metrics.by_status.review}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Done</div>
              <div className="metric-card__value">{metrics.by_status.done}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="task-management__filters">
          <div className="filter-group">
            <label className="filter-group__label">Search</label>
            <Input
              placeholder="Search tasks..."
              icon={<Search />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-group__label">Priority</label>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              {PRIORITY_OPTIONS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="kanban-board">
          {STATUS_OPTIONS.map(status => {
            const statusTasks = getFilteredTasks(status)
            const statusLabel = status.replace('_', ' ').toUpperCase()
            
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column__header">
                  <h3 className="kanban-column__title">
                    {statusLabel}
                    <span className="kanban-column__count">{statusTasks.length}</span>
                  </h3>
                </div>

                <div
                  className="kanban-column__content"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {statusTasks.length === 0 ? (
                    <div className="kanban-column__empty">
                      No tasks
                    </div>
                  ) : (
                    statusTasks.map(task => (
                      <motion.div
                        key={task.id}
                        className="kanban-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="kanban-card__header">
                          <div className="kanban-card__title">{task.title}</div>
                          <button
                            className="kanban-card__delete"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {task.description && (
                          <div className="kanban-card__description">
                            {task.description}
                          </div>
                        )}

                        <div className="kanban-card__footer">
                          <Badge
                            size="sm"
                            style={{
                              background: getPriorityColor(task.priority),
                              color: 'white',
                            }}
                          >
                            {task.priority}
                          </Badge>
                          {task.submission?.reference_id && (
                            <Badge
                              size="sm"
                              variant="ghost"
                              style={{ fontSize: '10px' }}
                            >
                              {task.submission.reference_id}
                            </Badge>
                          )}
                        </div>

                        {task.is_overdue && (
                          <div className="kanban-card__overdue">
                            <AlertCircle size={12} />
                            Overdue
                          </div>
                        )}

                        {task.due_date && (
                          <div className="kanban-card__due-date">
                            <Clock size={12} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}

                        {task.assigned_to && (
                          <div className="kanban-card__assignee">
                            Assigned to: {task.assigned_to.first_name}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* New Task Form Modal */}
        {showNewTaskForm && (
          <div className="modal-overlay" onClick={() => setShowNewTaskForm(false)}>
            <Card className="new-task-modal">
              <Card.Header title="Create New Task" />
              <Card.Body>
                <form onSubmit={handleCreateTask} className="new-task-form">
                  <div className="form-group">
                    <label>Task Title *</label>
                    <Input
                      placeholder="Enter task title..."
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Enter task description..."
                      value={newTaskData.description}
                      onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: 'var(--space-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority</label>
                      <Select
                        value={newTaskData.priority}
                        onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                      >
                        {PRIORITY_OPTIONS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </Select>
                    </div>

                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="datetime-local"
                        value={newTaskData.due_date}
                        onChange={(e) => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: 'var(--space-2)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewTaskForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Create Task
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
