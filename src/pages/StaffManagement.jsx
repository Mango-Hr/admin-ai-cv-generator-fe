import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { default as Avatar } from '../components/shared/Avatar'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import InviteAdminModal from '../components/shared/InviteAdminModal'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { fetchStaffList, deleteStaffMember } from '../services/staffService'
import { listAdminInvitations, revokeAdminInvitation } from '../services/authService'
import './StaffManagement.css'

export default function StaffManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('staff') // 'staff' or 'invitations'
  const [staff, setStaff] = useState([])
  const [invitations, setInvitations] = useState([])
  const [stats, setStats] = useState({ total_staff: 0, active_members: 0, avg_workload: 0 })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, staffId: null, staffName: '' })
  const [deleting, setDeleting] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [revoking, setRevoking] = useState(null)

  useEffect(() => {
    loadStaff()
    loadInvitations()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const data = await fetchStaffList()
      setStaff(data.staff || [])
      setStats(data.stats || { total_staff: 0, active_members: 0, avg_workload: 0 })
    } catch (error) {
      toast.error('Failed to load staff')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const data = await listAdminInvitations()
      setInvitations(data || [])
    } catch (error) {
      console.error('Failed to load invitations:', error)
      // Don't show error toast as it's not critical
    }
  }

  const handleRefresh = () => {
    loadStaff()
    loadInvitations()
    toast.success('Data refreshed')
  }

  const handleAddStaff = () => {
    setIsInviteModalOpen(true)
  }

  const handleRevokeInvitation = async (invitationId) => {
    setRevoking(invitationId)
    try {
      await revokeAdminInvitation(invitationId)
      toast.success('Invitation revoked successfully')
      loadInvitations()
    } catch (error) {
      toast.error('Failed to revoke invitation')
      console.error(error)
    } finally {
      setRevoking(null)
    }
  }

  const handleEdit = (member) => {
    toast.info(`Edit ${member.first_name} - Coming soon`)
  }

  const handleDelete = (member) => {
    setDeleteModal({
      isOpen: true,
      staffId: member.id,
      staffName: `${member.first_name} ${member.last_name}`,
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.staffId) return

    setDeleting(true)
    try {
      await deleteStaffMember(deleteModal.staffId)
      toast.success('Staff member deleted successfully')
      loadStaff()
    } catch (error) {
      toast.error('Failed to delete staff member')
      console.error(error)
    } finally {
      setDeleting(false)
      setDeleteModal({ isOpen: false, staffId: null, staffName: '' })
    }
  }

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
            <Button variant="ghost" icon={<RefreshCw />} onClick={handleRefresh} disabled={loading}>
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
              <div className="staff-stat__value">{stats.total_staff}</div>
              <div className="staff-stat__label">Total Staff</div>
            </div>
          </div>
          <div className="staff-stat staff-stat--active">
            <div className="staff-stat__icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="staff-stat__info">
              <div className="staff-stat__value">{stats.active_members}</div>
              <div className="staff-stat__label">Active Members</div>
            </div>
          </div>
          <div className="staff-stat staff-stat--workload">
            <div className="staff-stat__icon">
              <BarChart3 size={24} />
            </div>
            <div className="staff-stat__info">
              <div className="staff-stat__value">{stats.avg_workload.toFixed(1)}</div>
              <div className="staff-stat__label">Avg. Workload</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="staff-management__tabs">
          <button
            className={`staff-management__tab ${activeTab === 'staff' ? 'staff-management__tab--active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={18} />
            Staff Members
          </button>
          <button
            className={`staff-management__tab ${activeTab === 'invitations' ? 'staff-management__tab--active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            <Mail size={18} />
            Pending Invitations
            {invitations.length > 0 && (
              <span className="staff-management__tab-badge">{invitations.length}</span>
            )}
          </button>
        </div>

        {/* Staff Grid */}
        {activeTab === 'staff' && (
          <>
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
                            fallback={`${member.first_name} ${member.last_name}`}
                            size="xl"
                            color="yellow"
                          />
                        </div>
                        <div className="staff-card__name">{member.first_name} {member.last_name}</div>
                        <div className="staff-card__email">{member.email}</div>
                      </div>

                      {/* Body */}
                      <div className="staff-card__body">
                        {/* Role Badge */}
                        <div className="staff-card__role">
                          <Shield size={16} />
                          {member.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
                        </div>

                        {/* Stats */}
                        <div className="staff-card__stats">
                          <div className="staff-card__stat">
                            <div className="staff-card__stat-value">
                              {member.active_count || 0}
                            </div>
                            <div className="staff-card__stat-label">Active</div>
                          </div>
                          <div className="staff-card__stat">
                            <div className="staff-card__stat-value">
                              {member.completed_count || 0}
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
                          {member.phone && (
                            <div className="staff-card__info-item">
                              <Phone className="staff-card__info-icon" />
                              {member.phone}
                            </div>
                          )}
                          <div className="staff-card__info-item">
                            Status: {member.is_active ? (
                              <Badge variant="completed">Active</Badge>
                            ) : (
                              <Badge variant="review">Inactive</Badge>
                            )}
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
          </>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="invitations-section">
            {invitations.length === 0 ? (
              <div className="staff-management__empty">
                <EmptyState
                  icon={<Mail />}
                  title="No pending invitations"
                  description="Send invitations to new team members to get started"
                  action={
                    <Button variant="primary" icon={<UserPlus />} onClick={handleAddStaff}>
                      Send Invitation
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="invitations-table">
                {invitations.map((invite) => (
                  <motion.div
                    key={invite.id}
                    className="invitations-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="invitations-row__content">
                      <div className="invitations-row__email">
                        <Mail size={18} />
                        <div>
                          <div className="invitations-row__email-label">{invite.email}</div>
                          <div className="invitations-row__email-role">
                            Role: {invite.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
                          </div>
                        </div>
                      </div>

                      <div className="invitations-row__status">
                        <div className="invitations-row__badge-container">
                          <Badge
                            variant={
                              invite.status === 'pending' ? 'review' :
                              invite.status === 'accepted' ? 'completed' :
                              invite.status === 'declined' ? 'rejected' :
                              'review'
                            }
                          >
                            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="invitations-row__date">
                          <Clock size={14} />
                          {invite.created_at ? format(parseISO(invite.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>

                      <div className="invitations-row__expires">
                        <span className="invitations-row__label">Expires:</span>
                        {invite.expires_at ? format(parseISO(invite.expires_at), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </div>

                    {invite.status === 'pending' && (
                      <div className="invitations-row__actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<X />}
                          loading={revoking === invite.id}
                          disabled={revoking !== null}
                          onClick={() => handleRevokeInvitation(invite.id)}
                          style={{ color: '#ef4444' }}
                        >
                          Revoke
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })}
        size="sm"
      >
        <ModalHeader title="Delete Staff Member" onClose={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete <strong>{deleteModal.staffName}</strong>? Any submissions assigned to them will be unassigned. This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            disabled={deleting}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Invite Admin Modal */}
      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={loadStaff}
      />
    </AdminLayout>
  )
}
