import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack,
  MessageSquare,
  ArrowRight,
  CheckSquare,
  Users,
  FileCode,
  BarChart3,
  Eye,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { fetchDashboardStats, fetchRecentSubmissions, getTotalSubmissionsCount, getMyTasksCount } from '../services/dashboardService'
import './AdminDashboard.css'

const QUICK_ACTIONS = [
  {
    title: 'View All Clients',
    description: 'Open a client and tailor their resume',
    icon: <FileStack />,
    link: '/admin/submissions',
    color: 'blue',
    badgeKey: 'clients',
    roles: ['super_admin', 'sub_admin'],
  },
  {
    title: 'My Tasks',
    description: 'Review assigned tasks and deadlines',
    icon: <CheckSquare />,
    link: '/admin/tasks',
    color: 'orange',
    badgeKey: 'tasks',
    roles: ['super_admin', 'sub_admin'],
  },
  {
    title: 'Manage Staff',
    description: 'View the team and client loads',
    icon: <Users />,
    link: '/admin/staff',
    color: 'purple',
    roles: ['super_admin'],
  },
  {
    title: 'AI Prompts',
    description: 'Review and edit prompt templates',
    icon: <FileCode />,
    link: '/admin/prompts',
    color: 'teal',
    roles: ['super_admin'],
  },
]

export default function AdminDashboard({ userRole }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [totalClients, setTotalClients] = useState(0)
  const [myTasks, setMyTasks] = useState(0)

  const isSubAdmin = user?.role === 'sub_admin'
  const role = userRole || user?.role

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
        setTotalClients(totalCount)
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

  const adminName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || ''

  // Stat cards — client-focused, no pipeline stages
  const statCards = []
  if (stats && typeof stats.active_chats === 'number') {
    statCards.push({
      key: 'active_chats',
      icon: <MessageSquare />,
      label: 'Active Conversations',
      value: stats.active_chats,
      footer: 'Ongoing client chats',
      color: 'chats',
    })
  }
  statCards.unshift({
    key: 'clients',
    icon: <FileStack />,
    label: isSubAdmin ? 'My Clients' : 'Total Clients',
    value: totalClients,
    footer: isSubAdmin ? 'Assigned to you' : 'Across the team',
    color: 'blue',
  })

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="admin-dashboard__header">
          <div className="admin-dashboard__title-row">
            <div>
              <h1 className="admin-dashboard__title">Dashboard</h1>
              <p className="admin-dashboard__greeting">
                {getGreeting()}{adminName ? `, ${adminName}` : ''} — here's what's happening today.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-dashboard__stats">
          {loading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} variant="card" height={160} />
              ))}
            </>
          ) : statCards.length > 0 ? (
            statCards.map((card, index) => (
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
                    <div className="stat-card__value">{card.value || 0}</div>
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
          {/* Recent Clients */}
          <div className="admin-dashboard__submissions">
            <Card>
              <Card.Header
                title="Recent Clients"
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
                    title={isSubAdmin ? 'No clients assigned to you yet' : 'No clients yet'}
                    description={isSubAdmin
                      ? 'Clients assigned to you by the main admin will appear here'
                      : 'New client requests will appear here'}
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

                          <div className="submissions-table__role">
                            {submission.target_company || '—'}
                          </div>

                          <div className="submissions-table__time">
                            {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}
                          </div>

                          <div className="submissions-table__actions">
                            <Link to={`/admin/submissions/${submission.id}/tailor`} style={{ textDecoration: 'none' }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Sparkles />}
                              >
                                Tailor
                              </Button>
                            </Link>
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
                        Showing {recentSubmissions.length} recent clients
                      </span>
                      <Link
                        to="/admin/submissions"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-deco-blue)',
                          fontWeight: 500,
                        }}
                      >
                        View all clients →
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
                {QUICK_ACTIONS.filter(action => action.roles.includes(role)).map((action, index) => {
                  let badge = null
                  if (action.badgeKey === 'clients') {
                    badge = totalClients > 0 ? `${totalClients} total` : null
                  } else if (action.badgeKey === 'tasks') {
                    badge = myTasks > 0 ? `${myTasks} assigned` : null
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
