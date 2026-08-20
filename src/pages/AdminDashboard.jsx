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
import { formatDistanceToNow } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import Button from '../components/shared/Button'
import { default as Avatar } from '../components/shared/Avatar'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/mockData'
import './AdminDashboard.css'

const STAT_CARDS = [
  {
    key: 'newRequests',
    icon: <FileStack />,
    label: 'New Requests',
    color: 'new',
    trend: { value: '+12%', direction: 'up' },
    footer: 'From last week',
  },
  {
    key: 'inProgress',
    icon: <Clock />,
    label: 'In Progress',
    color: 'progress',
    trend: { value: '+8%', direction: 'up' },
    footer: 'Active this week',
  },
  {
    key: 'completed',
    icon: <CheckCircle2 />,
    label: 'Completed',
    color: 'completed',
    trend: { value: '+24%', direction: 'up' },
    footer: 'This month',
  },
  {
    key: 'activeChats',
    icon: <MessageSquare />,
    label: 'Active Chats',
    color: 'chats',
    trend: { value: '-5%', direction: 'down' },
    footer: 'Response time: 2.3hrs',
  },
]

const QUICK_ACTIONS = [
  {
    title: 'View All Submissions',
    description: 'Manage and track all CV requests',
    icon: <FileStack />,
    link: '/admin/submissions',
    color: 'blue',
    badge: '12 total',
  },
  {
    title: 'My Tasks',
    description: 'Review assigned tasks and deadlines',
    icon: <CheckCircle2 />,
    link: '/admin/tasks',
    color: 'orange',
    badge: '5 pending',
  },
  {
    title: 'Manage Staff',
    description: 'View team members and assignments',
    icon: <Users />,
    link: '/admin/staff',
    color: 'purple',
  },
  {
    title: 'AI Prompts',
    description: 'Configure CV generation templates',
    icon: <FileCode />,
    link: '/admin/prompts',
    color: 'teal',
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentSubmissions, setRecentSubmissions] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, submissionsData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentSubmissions(5),
        ])
        setStats(statsData)
        setRecentSubmissions(submissionsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
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
                {getGreeting()}, {user?.name}! Here's what's happening today.
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
          ) : (
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
                    <div className={`stat-card__trend stat-card__trend--${card.trend.direction}`}>
                      {card.trend.direction === 'up' ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {card.trend.value}
                    </div>
                  </div>
                  <div className="stat-card__body">
                    <div className="stat-card__value">{stats[card.key]}</div>
                    <div className="stat-card__label">{card.label}</div>
                  </div>
                  <div className="stat-card__footer">{card.footer}</div>
                </div>
              </motion.div>
            ))
          )}
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
                              {submission.clientName}
                            </div>
                            <div className="submissions-table__id">{submission.id}</div>
                          </div>

                          <div className="submissions-table__role">
                            {submission.targetRole}
                          </div>

                          <Badge variant={submission.status}>{submission.status}</Badge>

                          <div className="submissions-table__assigned">
                            {submission.assignedTo ? (
                              <>
                                <Avatar
                                  fallback={submission.assignedTo.name}
                                  size="xs"
                                />
                                <span>{submission.assignedTo.name.split(' ')[0]}</span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--color-text-tertiary)' }}>
                                Unassigned
                              </span>
                            )}
                          </div>

                          <div className="submissions-table__actions">
                            <Link to={`/admin/submissions/${submission.id}`} style={{ textDecoration: 'none' }}>
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
                        Showing {recentSubmissions.length} of {stats?.totalSubmissions || 0} submissions
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
                {QUICK_ACTIONS.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`action-card action-card--${action.color}`}
                  >
                    <div className="action-card__header">
                      <div className="action-card__icon">{action.icon}</div>
                      {action.badge && (
                        <div className="action-card__badge">{action.badge}</div>
                      )}
                    </div>
                    <div className="action-card__title">{action.title}</div>
                    <div className="action-card__description">{action.description}</div>
                  </Link>
                ))}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
