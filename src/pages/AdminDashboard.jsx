import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileStack,
  Clock,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Users,
  FileCode,
  BarChart3,
  Eye,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import Button from '../components/shared/Button'
import { default as Avatar } from '../components/shared/Avatar'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { fetchDashboardStats, fetchRecentSubmissions, getTotalSubmissionsCount, getMyTasksCount } from '../services/dashboardService'
import './AdminDashboard.css'

const STAT_CARDS = [
  {
    key: 'new_requests',
    icon: <FileStack />,
    label: 'New Requests',
    color: 'new',
    footer: 'Awaiting processing',
  },
  {
    key: 'in_progress',
    icon: <Clock />,
    label: 'In Progress',
    color: 'progress',
    footer: 'Currently being worked on',
  },
  {
    key: 'completed',
    icon: <CheckCircle2 />,
    label: 'Completed',
    color: 'completed',
    footer: 'Successfully finished',
  },
  {
    key: 'active_chats',
    icon: <MessageSquare />,
    label: 'Active Conversations',
    color: 'chats',
    footer: 'Ongoing client chats',
  },
]

const QUICK_ACTIONS = [
  {
    title: 'View All Submissions',
    description: 'Manage and track all CV requests',
    icon: <FileStack />,
    link: '/admin/submissions',
    color: 'blue',
    badgeKey: 'totalSubmissions',
    roles: ['super_admin', 'sub_admin'],
  },
  {
    title: 'My Tasks',
    description: 'Review assigned tasks and deadlines',
    icon: <CheckCircle2 />,
    link: '/admin/tasks',
    color: 'orange',
    badgeKey: 'myTasks',
    roles: ['super_admin', 'sub_admin'],
  },
  {
    title: 'Manage Staff',
    description: 'View team members and assignments',
    icon: <Users />,
    link: '/admin/staff',
    color: 'purple',
    roles: ['super_admin'], // Only super_admin can manage staff
  },
  {
    title: 'AI Prompts',
    description: 'Configure CV generation templates',
    icon: <FileCode />,
    link: '/admin/prompts',
    color: 'teal',
    roles: ['super_admin'], // Only super_admin can manage prompts
  },
]

export default function AdminDashboard({ userRole }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [myTasks, setMyTasks] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [statsData, submissionsData, totalCount, tasksCount] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentSubmissions({ limit: 5 }),
          getTotalSubmissionsCount(),
          getMyTasksCount(),
        ])
        setStats(statsData)
        setRecentSubmissions(submissionsData.submissions || [])
        setTotalSubmissions(totalCount)
        setMyTasks(tasksCount)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="admin-dashboard__header">
          <div className="admin-dashboard__title-row">
            <div>
              <h1 className="admin-dashboard__title">Dashboard</h1>
              <p className="admin-dashboard__greeting">
                {getGreeting()}!, {user?.name}Here's what's happening today.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-dashboard__stats">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="card" height={160} />
              ))}
            </>
          ) : stats ? (
            STAT_CARDS.map((card, index) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`stat-card stat-card--${card.color}`}>
                  <div className="stat-card__header">
                    <div className="stat-card__icon">{card.icon}</div>
                  </div>
                  <div className="stat-card__body">
                    <div className="stat-card__value">{stats[card.key] || 0}</div>
                    <div className="stat-card__label">{card.label}</div>
                  </div>
                  <div className="stat-card__footer">{card.footer}</div>
                </div>
              </motion.div>
            ))
          ) : null}
        </div>

        {/* Main Content Grid */}
        <div className="admin-dashboard__content">
          {/* Recent Submissions */}
          <div className="admin-dashboard__submissions">
            <Card>
              <Card.Header
                title="Recent Submissions"
                icon={<FileStack />}
                action={
                  <Link to="/admin/submissions" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowRight />}
                      iconPosition="right"
                    >
                      View All
                    </Button>
                  </Link>
                }
              />
              <Card.Body>
                {loading ? (
                  <Skeleton variant="table" rows={5} />
                ) : recentSubmissions.length === 0 ? (
                  <EmptyState
                    icon={<FileStack />}
                    title="No submissions yet"
                    description="New CV requests will appear here"
                  />
                ) : (
                  <>
                    <div className="submissions-table">
                      {recentSubmissions.map((submission) => (
                        <div key={submission.id} className="submissions-table__row">
                          <div className="submissions-table__client">
                            <div className="submissions-table__name">
                              {submission.client.first_name} {submission.client.last_name}
                            </div>
                            <div className="submissions-table__id">{submission.reference_id}</div>
                          </div>

                          <div className="submissions-table__role">
                            {submission.target_position}
                          </div>

                          <Badge variant={submission.status}>{submission.status}</Badge>

                          <div className="submissions-table__assigned">
                            {submission.assigned_to ? (
                              <>
                                <Avatar
                                  fallback={`${submission.assigned_to.first_name} ${submission.assigned_to.last_name}`}
                                  size="xs"
                                />
                                <span>{submission.assigned_to.first_name}</span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--color-text-tertiary)' }}>
                                Unassigned
                              </span>
                            )}
                          </div>

                          <div className="submissions-table__actions">
                            <Link to={`/admin/submissions/${submission.reference_id}`} style={{ textDecoration: 'none' }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Eye />}
                              >
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="submissions-table__footer">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                        Showing {recentSubmissions.length} recent submissions
                      </span>
                      <Link
                        to="/admin/submissions"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-deco-blue)',
                          fontWeight: 500,
                        }}
                      >
                        View all submissions →
                      </Link>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Card>
              <Card.Header title="Quick Actions" icon={<BarChart3 />} />
              <Card.Body>
                {QUICK_ACTIONS.filter(action => action.roles.includes(userRole || user?.role)).map((action, index) => {
                  let badge = null
                  if (action.badgeKey === 'totalSubmissions') {
                    badge = totalSubmissions > 0 ? `${totalSubmissions} total` : null
                  } else if (action.badgeKey === 'myTasks') {
                    badge = myTasks > 0 ? `${myTasks} pending` : null
                  }

                  return (
                    <Link
                      key={index}
                      to={action.link}
                      className={`action-card action-card--${action.color}`}
                    >
                      <div className="action-card__header">
                        <div className="action-card__icon">{action.icon}</div>
                        {badge && (
                          <div className="action-card__badge">{badge}</div>
                        )}
                      </div>
                      <div className="action-card__title">{action.title}</div>
                      <div className="action-card__description">{action.description}</div>
                    </Link>
                  )
                })}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
