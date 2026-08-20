import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FileText,
  UserPlus,
  CheckCircle2,
  Play,
  MessageSquare,
  Download,
  Trash2,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import Button from '../components/shared/Button'
import { default as Avatar } from '../components/shared/Avatar'
import { Select } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { submissionsService, staffService } from '../services/mockData'
import './SubmissionDetail.css'

// Mock activity timeline
const MOCK_TIMELINE = [
  {
    type: 'created',
    title: 'Submission Created',
    description: 'Client submitted CV request through the form',
    timestamp: new Date('2024-01-15T10:30:00'),
    icon: <FileText />,
  },
  {
    type: 'assigned',
    title: 'Assigned to Sarah Johnson',
    description: 'Submission assigned for review and processing',
    timestamp: new Date('2024-01-15T11:15:00'),
    icon: <UserPlus />,
  },
  {
    type: 'progress',
    title: 'Status Changed to In Progress',
    description: 'Work started on CV generation and optimization',
    timestamp: new Date('2024-01-15T14:20:00'),
    icon: <Play />,
  },
]

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'new' },
  { value: 'in_progress', label: 'In Progress', color: 'progress' },
  { value: 'review', label: 'Review', color: 'review' },
  { value: 'completed', label: 'Completed', color: 'completed' },
]

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionData, staffData] = await Promise.all([
        submissionsService.getById(id),
        staffService.getAll(),
      ])
      
      if (!submissionData) {
        toast.error('Submission not found')
        navigate('/admin/submissions')
        return
      }

      setSubmission(submissionData)
      setStaff(staffData)
      setSelectedStatus(submissionData.status)
      setSelectedStaff(submissionData.assignedTo?.id?.toString() || '')
    } catch (error) {
      toast.error('Failed to load submission')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member')
      return
    }

    try {
      const staffMember = staff.find(s => s.id === parseInt(selectedStaff))
      await submissionsService.update(id, { assignedTo: staffMember })
      toast.success(`Assigned to ${staffMember.name}`)
      loadData()
    } catch (error) {
      toast.error('Failed to assign submission')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await submissionsService.update(id, { status: newStatus })
      setSelectedStatus(newStatus)
      toast.success('Status updated successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return
    }

    try {
      await submissionsService.delete(id)
      toast.success('Submission deleted successfully')
      navigate('/admin/submissions')
    } catch (error) {
      toast.error('Failed to delete submission')
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

  return (
    <AdminLayout>
      <div className="submission-detail">
        {/* Back Link */}
        <Link to="/admin/submissions" className="submission-detail__back">
          <ArrowLeft size={16} />
          Back to Submissions
        </Link>

        {/* Header */}
        <div className="submission-detail__header">
          <div className="submission-detail__title-section">
            <div className="submission-detail__id">{submission.id}</div>
            <h1 className="submission-detail__title">{submission.clientName}</h1>
            <div className="submission-detail__meta">
              <Badge variant={submission.status}>{submission.status}</Badge>
              <span>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
              </span>
              {submission.priority && (
                <Badge variant={submission.priority}>{submission.priority} priority</Badge>
              )}
            </div>
          </div>
          <div className="submission-detail__actions">
            <Link to={`/chat/${submission.id}`} style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
                icon={<MessageSquare />}
              >
                Open Chat
              </Button>
            </Link>
            <Link to={`/download/${submission.id}`} style={{ textDecoration: 'none' }}>
              <Button
                variant="secondary"
                icon={<Download />}
              >
                View CV
              </Button>
            </Link>
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
            {/* Contact Information */}
            <Card>
              <Card.Header title="Contact Information" icon={<Mail />} />
              <Card.Body>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-item__label">Email Address</div>
                    <a
                      href={`mailto:${submission.email}`}
                      className="info-item__value info-item__value--link"
                    >
                      {submission.email}
                    </a>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Phone Number</div>
                    <a
                      href={`tel:${submission.phone}`}
                      className="info-item__value info-item__value--link"
                    >
                      {submission.phone}
                    </a>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Role</div>
                    <div className="info-item__value">{submission.targetRole}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Company</div>
                    <div className="info-item__value">{submission.targetCompany}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Submission Date</div>
                    <div className="info-item__value">
                      {format(submission.submittedAt, 'PPP p')}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Has Existing CV</div>
                    <div className="info-item__value">
                      {submission.hasExistingCV ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <Card.Header title="Activity Timeline" icon={<Calendar />} />
              <Card.Body>
                <div className="timeline">
                  {MOCK_TIMELINE.map((activity, index) => (
                    <div key={index} className={`timeline__item timeline__item--${activity.type}`}>
                      <div className="timeline__icon">{activity.icon}</div>
                      <div className="timeline__content">
                        <div className="timeline__title">{activity.title}</div>
                        <div className="timeline__description">{activity.description}</div>
                        <div className="timeline__meta">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })} •{' '}
                          {format(activity.timestamp, 'PPP p')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Files */}
            {submission.hasExistingCV && (
              <Card>
                <Card.Header title="Attached Files" icon={<FileText />} />
                <Card.Body>
                  <div className="files-list">
                    <div className="file-item">
                      <div className="file-item__icon">
                        <FileText size={20} />
                      </div>
                      <div className="file-item__info">
                        <div className="file-item__name">existing-cv.pdf</div>
                        <div className="file-item__meta">2.4 MB • Uploaded {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}</div>
                      </div>
                      <Button variant="ghost" size="sm" icon={<Download />} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="submission-detail__sidebar">
            {/* Assign Staff */}
            <Card>
              <Card.Header title="Assignment" icon={<UserPlus />} />
              <Card.Body>
                <div className="assign-section">
                  {submission.assignedTo ? (
                    <div className="assign-current">
                      <Avatar fallback={submission.assignedTo.name} size="md" />
                      <div className="assign-current__info">
                        <div className="assign-current__name">{submission.assignedTo.name}</div>
                        <div className="assign-current__role">
                          {submission.assignedTo.name.includes('Admin') ? 'admin' : 'sub_admin'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                      Not assigned yet
                    </div>
                  )}
                  <div className="assign-form">
                    <Select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Staff</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                    <Button variant="primary" size="sm" onClick={handleAssign}>
                      Assign
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Status Update */}
            <Card>
              <Card.Header title="Status" icon={<CheckCircle2 />} />
              <Card.Body>
                <div className="status-section">
                  <div className="status-current">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      Current Status
                    </span>
                    <Badge variant={submission.status}>{submission.status}</Badge>
                  </div>
                  <div className="status-buttons">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`status-button status-button--${option.color} ${
                          selectedStatus === option.value ? 'status-button--active' : ''
                        }`}
                        onClick={() => handleStatusChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Header title="Quick Actions" icon={<Briefcase />} />
              <Card.Body>
                <div className="quick-actions-list">
                  <Link
                    to={`/chat/${submission.id}`}
                    className="quick-action-btn quick-action-btn--blue"
                  >
                    <MessageSquare className="quick-action-btn__icon" />
                    Chat with Client
                  </Link>
                  <Link
                    to={`/admin/generate/${submission.id}`}
                    className="quick-action-btn quick-action-btn--orange"
                  >
                    <FileText className="quick-action-btn__icon" />
                    Generate CV
                  </Link>
                  <Link
                    to={`/download/${submission.id}`}
                    className="quick-action-btn quick-action-btn--purple"
                  >
                    <Download className="quick-action-btn__icon" />
                    Download CV
                  </Link>
                  <button
                    className="quick-action-btn quick-action-btn--red"
                    onClick={handleDelete}
                  >
                    <Trash2 className="quick-action-btn__icon" />
                    Delete Submission
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
