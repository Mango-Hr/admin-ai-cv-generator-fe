import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  RefreshCw,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  Edit,
  Trash2,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { default as Avatar } from '../components/shared/Avatar'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { staffService } from '../services/mockData'
import './StaffManagement.css'

export default function StaffManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState([])

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const staffData = await staffService.getAll()
      setStaff(staffData)
    } catch (error) {
      toast.error('Failed to load staff')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadStaff()
    toast.success('Data refreshed')
  }

  const handleAddStaff = () => {
    toast.info('Add staff feature coming soon')
  }

  const handleEdit = (member) => {
    toast.info(`Edit ${member.name} - Coming soon`)
  }

  const handleDelete = (member) => {
    toast.warning(`Delete ${member.name} - Coming soon`)
  }

  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.status === 'active').length
  const totalActiveSubmissions = staff.reduce((sum, s) => sum + s.activeSubmissions, 0)
  const avgWorkload = totalStaff > 0 ? (totalActiveSubmissions / totalStaff).toFixed(1) : 0

  return (
    <AdminLayout>
      <div className="staff-management">
        {/* Header */}
        <div className="staff-management__header">
          <div className="staff-management__title-section">
            <h1 className="staff-management__title">Staff Management</h1>
            <p className="staff-management__subtitle">
              Manage team members and track their workload
            </p>
          </div>
          <div className="staff-management__actions">
            <Button variant="ghost" icon={<RefreshCw />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="primary" icon={<UserPlus />} onClick={handleAddStaff}>
              Add Staff
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="staff-stats">
          <div className="staff-stat staff-stat--total">
            <div className="staff-stat__icon">
              <Users size={24} />
            </div>
            <div className="staff-stat__info">
              <div className="staff-stat__value">{totalStaff}</div>
              <div className="staff-stat__label">Total Staff</div>
            </div>
          </div>
          <div className="staff-stat staff-stat--active">
            <div className="staff-stat__icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="staff-stat__info">
              <div className="staff-stat__value">{activeStaff}</div>
              <div className="staff-stat__label">Active Members</div>
            </div>
          </div>
          <div className="staff-stat staff-stat--workload">
            <div className="staff-stat__icon">
              <BarChart3 size={24} />
            </div>
            <div className="staff-stat__info">
              <div className="staff-stat__value">{avgWorkload}</div>
              <div className="staff-stat__label">Avg. Workload</div>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="staff-grid">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="card" height={400} />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="staff-management__empty">
            <EmptyState
              icon={<Users />}
              title="No staff members"
              description="Add your first staff member to get started"
              action={
                <Button variant="primary" icon={<UserPlus />} onClick={handleAddStaff}>
                  Add Staff Member
                </Button>
              }
            />
          </div>
        ) : (
          <div className="staff-grid">
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`staff-card staff-card--${member.role}`}>
                  {/* Header */}
                  <div className="staff-card__header">
                    <div className="staff-card__avatar-wrapper">
                      <Avatar
                        fallback={member.name}
                        src={member.avatar}
                        size="xl"
                        color="yellow"
                      />
                    </div>
                    <div className="staff-card__name">{member.name}</div>
                    <div className="staff-card__email">{member.email}</div>
                  </div>

                  {/* Body */}
                  <div className="staff-card__body">
                    {/* Role Badge */}
                    <div className="staff-card__role">
                      <Shield size={16} />
                      {member.role === 'admin' ? 'Administrator' : 'Sub-Admin'}
                    </div>

                    {/* Stats */}
                    <div className="staff-card__stats">
                      <div className="staff-card__stat">
                        <div className="staff-card__stat-value">
                          {member.activeSubmissions}
                        </div>
                        <div className="staff-card__stat-label">Active</div>
                      </div>
                      <div className="staff-card__stat">
                        <div className="staff-card__stat-value">
                          {member.completedSubmissions}
                        </div>
                        <div className="staff-card__stat-label">Completed</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="staff-card__info">
                      <div className="staff-card__info-item">
                        <Mail className="staff-card__info-icon" />
                        <a
                          href={`mailto:${member.email}`}
                          style={{
                            color: 'var(--color-deco-blue)',
                            textDecoration: 'none',
                          }}
                        >
                          {member.email}
                        </a>
                      </div>
                      <div className="staff-card__info-item">
                        <Calendar className="staff-card__info-icon" />
                        Joined {format(member.joinedAt, 'MMM yyyy')}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="staff-card__footer">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit />}
                      onClick={() => handleEdit(member)}
                      style={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 />}
                      onClick={() => handleDelete(member)}
                      style={{ color: '#ef4444' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
