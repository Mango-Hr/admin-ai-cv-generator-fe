import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Mail,
  Briefcase,
  FileText,
  UserPlus,
  MessageSquare,
  Download,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import Button from '../components/shared/Button'
import { default as Avatar } from '../components/shared/Avatar'
import Skeleton from '../components/shared/Skeleton'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { fetchSubmissionById, assignSubmission, unassignSubmission, deleteSubmission } from '../services/submissionsService'
import { fetchStaffList } from '../services/staffService'
import { getSubmissionDocuments, downloadDocument } from '../services/aiService'
import { classifyDocument, buildDownloadName } from '../utils/documentNames'
import './SubmissionDetail.css'

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [assigningStaffId, setAssigningStaffId] = useState(null)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [documents, setDocuments] = useState([])
  const [documentFilter, setDocumentFilter] = useState('word')
  const [showAllDocuments, setShowAllDocuments] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionData, staffData, docsData] = await Promise.all([
        fetchSubmissionById(id),
        fetchStaffList(),
        getSubmissionDocuments(id),
      ])

      if (!submissionData) {
        toast.error('Client not found')
        navigate('/admin/submissions')
        return
      }

      setSubmission(submissionData)
      setStaff(staffData.staff || [])
      setSelectedStaff(submissionData.assigned_to?.id || '')
      setDocuments(Array.isArray(docsData) ? docsData : [])
    } catch (error) {
      toast.error('Failed to load client details')
      console.error(error)
      navigate('/admin/submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member')
      return
    }

    setAssigningStaffId(selectedStaff)

    try {
      const updatedSubmission = await assignSubmission(id, selectedStaff)
      const staffMember = staff.find(s => s.id === selectedStaff)

      // Update local state instead of reloading
      setSubmission(updatedSubmission)
      toast.success(`Assigned to ${staffMember.first_name} ${staffMember.last_name}`)
    } catch (error) {
      toast.error('Failed to assign client')
      console.error(error)
    } finally {
      setAssigningStaffId(null)
    }
  }

  const handleUnassign = async () => {
    setAssigningStaffId('unassign')

    try {
      const updatedSubmission = await unassignSubmission(id)

      // Update local state instead of reloading
      setSubmission(updatedSubmission)
      setSelectedStaff('')
      toast.success('Client unassigned successfully')
    } catch (error) {
      toast.error('Failed to unassign client')
      console.error(error)
    } finally {
      setAssigningStaffId(null)
    }
  }

  const handleDownloadDoc = (doc) => {
    const firstName = submission?.client?.first_name || 'Client'
    downloadDocument(id, doc.id, buildDownloadName(doc, classifyDocument(doc), firstName))
      .then(() => toast.success('Download started'))
      .catch(error => {
        console.error('Download failed:', error)
        toast.error('Failed to download the document')
      })
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteSubmission(id)
      toast.success('Client deleted successfully')
      navigate('/admin/submissions')
    } catch (error) {
      toast.error('Failed to delete client')
      console.error(error)
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="submission-detail">
          <Skeleton variant="text" width={200} height={40} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Skeleton variant="card" height={400} />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!submission) {
    return null
  }

  const firstName = submission.client.first_name
  const lastName = submission.client.last_name
  const fullName = `${firstName} ${lastName}`
  const clientDOB = submission.client.date_of_birth || submission.client.dob

  return (
    <AdminLayout>
      <div className="submission-detail">
        {/* Back Link */}
        <Link to="/admin/submissions" className="submission-detail__back">
          <ArrowLeft size={16} />
          Back to Clients
        </Link>

        {/* Header — the "Tailor Resume" action comes first */}
        <div className="submission-detail__header">
          <div className="submission-detail__title-section">
            <div className="submission-detail__id">{submission.reference_id}</div>
            <h1 className="submission-detail__title">{fullName}</h1>
            <div className="submission-detail__meta">
              <span>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Client since {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}
              </span>
              {submission.priority && (
                <Badge variant={submission.priority}>{submission.priority} priority</Badge>
              )}
            </div>
          </div>
          <div className="submission-detail__actions">
            <Link to={`/admin/submissions/${submission.id}/tailor`} style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles />}
              >
                Tailor Resume
              </Button>
            </Link>
            <Link to={`/admin/chat/${submission.reference_id}`} style={{ textDecoration: 'none' }}>
              <Button
                variant="secondary"
                icon={<MessageSquare />}
              >
                Open Chat
              </Button>
            </Link>
            {submission.existing_cv_url && (
              <a href={submission.existing_cv_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  icon={<Download />}
                >
                  View CV
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <motion.div
          className="submission-detail__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main Content */}
          <div className="submission-detail__main">
            {/* Client Profile (submitted profile info) */}
            <Card>
              <Card.Header title="Client Profile" icon={<Mail />} />
              <Card.Body>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-item__label">Full Name</div>
                    <div className="info-item__value">{fullName}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Email Address</div>
                    <a
                      href={`mailto:${submission.client.email}`}
                      className="info-item__value info-item__value--link"
                    >
                      {submission.client.email}
                    </a>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Phone Number</div>
                    {submission.client.phone ? (
                      <a
                        href={`tel:${submission.client.phone}`}
                        className="info-item__value info-item__value--link"
                      >
                        {submission.client.phone}
                      </a>
                    ) : (
                      <div className="info-item__value info-item__value--muted">Not provided</div>
                    )}
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Date of Birth</div>
                    <div className="info-item__value">
                      {clientDOB ? format(parseISO(clientDOB), 'PPP') : <span className="info-item__value--muted">Not provided</span>}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Role</div>
                    <div className="info-item__value">{submission.target_position}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Company</div>
                    <div className="info-item__value">{submission.target_company || 'Not specified'}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <Card.Header title="Activity Timeline" icon={<Calendar />} />
              <Card.Body>
                <div className="timeline">
                  {submission.activities && submission.activities.length > 0 ? (
                    <>
                      {submission.activities
                        .filter(activity => {
                          // Everyone can see "Submission Created" event
                          if (activity.activity_type === 'created') return true

                          // Super admin sees all activities
                          if (user?.role === 'super_admin') return true

                          // Sub admin only sees their own activities (plus the creation event)
                          if (user?.role === 'sub_admin') {
                            return activity.actor_id === user.id
                          }

                          return false
                        })
                        .slice(0, showAllActivities ? submission.activities.length : 4)
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className={`timeline__item timeline__item--${activity.activity_type === 'status_changed' ? 'progress' : activity.activity_type === 'assigned' ? 'assigned' : 'created'}`}
                          >
                            <div className="timeline__icon">
                              {activity.activity_type === 'status_changed' ? (
                                <FileText size={20} />
                              ) : activity.activity_type === 'assigned' ? (
                                <UserPlus size={20} />
                              ) : (
                                <FileText size={20} />
                              )}
                            </div>
                            <div className="timeline__content">
                              <div className="timeline__title">{activity.title}</div>
                              <div className="timeline__description">{activity.description}</div>
                              <div className="timeline__meta">
                                {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })} •{' '}
                                {format(parseISO(activity.created_at), 'PPP p')}
                                {activity.actor_name && ` • by ${activity.actor_name}`}
                              </div>
                            </div>
                          </div>
                        ))}

                      {submission.activities.filter(activity => {
                        if (activity.activity_type === 'created') return true
                        if (user?.role === 'super_admin') return true
                        if (user?.role === 'sub_admin') return activity.actor_id === user.id
                        return false
                      }).length > 4 && (
                        <div className="timeline__toggle">
                          <button
                            className="timeline__toggle-btn"
                            onClick={() => setShowAllActivities(!showAllActivities)}
                          >
                            {showAllActivities ? '↑ Show Less' : '↓ Show More'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      No activities yet
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Job Description */}
            {submission.job_description && (
              <Card>
                <Card.Header title="Job Description" icon={<Briefcase />} />
                <Card.Body>
                  <div style={{ fontSize: 'var(--text-sm)', lineHeight: '1.6', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {submission.job_description}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Documents (CVs submitted for this client) */}
            {(submission.existing_cv_url || documents.length > 0) && (
              <Card>
                <Card.Header title="Documents" icon={<FileText />} />
                <Card.Body>
                  <div className="files-list">
                    {/* Original CV Upload */}
                    {submission.existing_cv_url && (
                      <div className="file-item">
                        <div className="file-item__icon">
                          <FileText size={20} />
                        </div>
                        <div className="file-item__info">
                          <div className="file-item__name">Original CV</div>
                          <div className="file-item__meta">Uploaded {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}</div>
                        </div>
                        <a href={submission.existing_cv_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" icon={<Download />} title="Download" />
                        </a>
                      </div>
                    )}

                    {/* Generated Documents Filter */}
                    {documents.length > 0 && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
                        <button
                          onClick={() => {
                            setDocumentFilter('word')
                            setShowAllDocuments(false)
                          }}
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            border: documentFilter === 'word' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: documentFilter === 'word' ? 'var(--color-primary-light)' : 'transparent',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: documentFilter === 'word' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        >
                          Word
                        </button>
                        <button
                          onClick={() => {
                            setDocumentFilter('pdf')
                            setShowAllDocuments(false)
                          }}
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            border: documentFilter === 'pdf' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: documentFilter === 'pdf' ? 'var(--color-primary-light)' : 'transparent',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: documentFilter === 'pdf' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        >
                          PDF
                        </button>
                      </div>
                    )}

                    {/* Filtered & Sorted Documents */}
                    {(() => {
                      const filteredDocs = documents
                        .filter(doc => {
                          if (documentFilter === 'word') return (doc.file_type || '').toLowerCase() === 'docx'
                          if (documentFilter === 'pdf') return (doc.file_type || '').toLowerCase() === 'pdf'
                          return true
                        })
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

                      const displayedDocs = showAllDocuments ? filteredDocs : filteredDocs.slice(0, 5)

                      return (
                        <>
                          {displayedDocs.map((doc) => (
                            <div key={doc.id} className="file-item">
                              <div className="file-item__icon">
                                <FileText size={20} />
                              </div>
                              <div className="file-item__info">
                                <div className="file-item__name">{doc.file_name}</div>
                                <div className="file-item__meta">
                                  {(doc.file_type || '').toUpperCase()} • v{doc.version} • {formatDistanceToNow(parseISO(doc.created_at), { addSuffix: true })}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Download size={16} />}
                                  onClick={() => handleDownloadDoc(doc)}
                                  title="Download"
                                />
                              </div>
                            </div>
                          ))}

                          {filteredDocs.length > 5 && (
                            <button
                              onClick={() => setShowAllDocuments(!showAllDocuments)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                color: 'var(--color-primary)',
                                padding: 'var(--space-2)',
                                textAlign: 'center',
                                marginTop: 'var(--space-1)',
                                width: '100%',
                              }}
                            >
                              {showAllDocuments ? '↑ See Less' : `↓ See More (${filteredDocs.length - 5} more)`}
                            </button>
                          )}

                          {filteredDocs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>
                              No {documentFilter.toUpperCase()} documents available.
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="submission-detail__sidebar">
            {/* Assign Staff - Only visible to main admin */}
            {user?.role === 'super_admin' && (
              <Card>
                <Card.Header title="Assignment" icon={<UserPlus />} />
                <Card.Body>
                  <div className="assign-section">
                    {submission.assigned_to ? (
                      <div className="assign-current">
                        <Avatar fallback={`${submission.assigned_to.first_name} ${submission.assigned_to.last_name}`} size="md" />
                        <div className="assign-current__info">
                          <div className="assign-current__name">{submission.assigned_to.first_name} {submission.assigned_to.last_name}</div>
                          <div className="assign-current__role">{submission.assigned_to.role}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="assign-empty">
                        Not assigned yet
                      </div>
                    )}
                    <div className="assign-form">
                      <div className="staff-dropdown">
                        <label className="staff-dropdown__label">Assign to Staff Member</label>
                        <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="staff-dropdown__select"
                        >
                          <option value="">Select a staff member...</option>
                          {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.first_name} {member.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAssign}
                          disabled={!selectedStaff || assigningStaffId}
                          loading={assigningStaffId === selectedStaff}
                          style={{ flex: 1 }}
                        >
                          Assign
                        </Button>
                        {submission.assigned_to && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleUnassign}
                            disabled={assigningStaffId}
                            loading={assigningStaffId === 'unassign'}
                          >
                            Unassign
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <Card.Header title="Quick Actions" icon={<Briefcase />} />
              <Card.Body>
                <div className="quick-actions-list">
                  <Link
                    to={`/admin/submissions/${submission.id}/tailor`}
                    className="quick-action-btn quick-action-btn--orange"
                  >
                    <Sparkles className="quick-action-btn__icon" />
                    Tailor Resume
                  </Link>
                  <Link
                    to={`/admin/chat/${submission.reference_id}`}
                    className="quick-action-btn quick-action-btn--blue"
                  >
                    <MessageSquare className="quick-action-btn__icon" />
                    Chat with Client
                  </Link>
                  <button
                    className="quick-action-btn quick-action-btn--red"
                    onClick={handleDelete}
                  >
                    <Trash2 className="quick-action-btn__icon" />
                    Delete Client
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader title="Delete Client" onClose={() => setDeleteModalOpen(false)} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete this client and all their records? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setDeleteModalOpen(false)}
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
    </AdminLayout>
  )
}
