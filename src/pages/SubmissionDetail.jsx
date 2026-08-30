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
  Zap,
  Loader,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import Button from '../components/shared/Button'
import { default as Avatar } from '../components/shared/Avatar'
import { Select } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { fetchSubmissionById, updateSubmissionStatus, assignSubmission, unassignSubmission, deleteSubmission } from '../services/submissionsService'
import { fetchStaffList } from '../services/staffService'
import { getPrompts } from '../services/promptService'
import { triggerAIGeneration, getGenerationHistory, renderDocuments, getSubmissionDocuments, downloadDocument, formatTokenInfo, formatCost } from '../services/aiService'
import './SubmissionDetail.css'

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
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [assigningStaffId, setAssigningStaffId] = useState(null)
  const [glowingStatus, setGlowingStatus] = useState(null)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [generationHistory, setGenerationHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRenderingDocs, setIsRenderingDocs] = useState(false)
  const [aiModel, setAiModel] = useState('gpt-4o')
  const [selectedPrompt, setSelectedPrompt] = useState('auto')
  const [availablePrompts, setAvailablePrompts] = useState([])
  const [customInstructions, setCustomInstructions] = useState('')
  const [includeChatHistory, setIncludeChatHistory] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionData, staffData, historyData, docsData, promptsData] = await Promise.all([
        fetchSubmissionById(id),
        fetchStaffList(),
        getGenerationHistory(id),
        getSubmissionDocuments(id),
        getPrompts(),
      ])
      
      if (!submissionData) {
        toast.error('Submission not found')
        navigate('/admin/submissions')
        return
      }

      setSubmission(submissionData)
      setStaff(staffData.staff || [])
      setSelectedStatus(submissionData.status)
      setSelectedStaff(submissionData.assigned_to?.id || '')
      setGenerationHistory(historyData)
      setDocuments(docsData)
      setAvailablePrompts(promptsData || [])
    } catch (error) {
      toast.error('Failed to load submission details')
      console.error(error)
      navigate('/admin/submissions')
    } finally {
      setLoading(false)
    }
  }

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
      toast.error('Failed to assign submission')
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
      toast.success('Submission unassigned successfully')
    } catch (error) {
      toast.error('Failed to unassign submission')
      console.error(error)
    } finally {
      setAssigningStaffId(null)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedSubmission = await updateSubmissionStatus(id, newStatus)
      
      // Update local state instead of reloading
      setSubmission(updatedSubmission)
      setSelectedStatus(newStatus)
      
      // Add glow effect to the button for 2 seconds
      setGlowingStatus(newStatus)
      setTimeout(() => setGlowingStatus(null), 2000)
      
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    }
  }

  const handleGenerateCV = async () => {
    setIsGenerating(true)
    try {
      const generation = await triggerAIGeneration(id, {
        provider: 'openai',
        model: aiModel,
        prompt_id: selectedPrompt === 'auto' ? null : selectedPrompt,
        custom_instructions: customInstructions || null,
        include_chat_history: includeChatHistory,
      })
      
      setGenerationHistory(prev => [generation, ...prev])
      toast.success('AI CV generated successfully')
    } catch (error) {
      // Keep all detailed logging in console
      console.error('Full error object:', error)
      console.error('Error response:', error.response?.data)
      
      // Simple UI error message
      toast.error('Failed to generate CV. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRenderDocuments = async (generationId) => {
    console.log('[SubmissionDetail] Render Documents - Generation ID:', generationId)
    console.log('[SubmissionDetail] Generation ID type:', typeof generationId)
    
    setIsRenderingDocs(true)
    try {
      const rendered = await renderDocuments(id, generationId, ['pdf', 'docx'])
      setDocuments(prev => [...prev, ...rendered])
      toast.success('Documents rendered successfully')
    } catch (error) {
      toast.error('Failed to render documents')
      console.error(error)
    } finally {
      setIsRenderingDocs(false)
    }
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteSubmission(id)
      toast.success('Submission deleted successfully')
      navigate('/admin/submissions')
    } catch (error) {
      toast.error('Failed to delete submission')
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
            <div className="submission-detail__id">{submission.reference_id}</div>
            <h1 className="submission-detail__title">{submission.client.first_name} {submission.client.last_name}</h1>
            <div className="submission-detail__meta">
              <Badge variant={submission.status}>{submission.status}</Badge>
              <span>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}
              </span>
              {submission.priority && (
                <Badge variant={submission.priority}>{submission.priority} priority</Badge>
              )}
            </div>
          </div>
          <div className="submission-detail__actions">
            <Link to={`/admin/chat/${submission.reference_id}`} style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
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
            {/* Contact Information */}
            <Card>
              <Card.Header title="Contact Information" icon={<Mail />} />
              <Card.Body>
                <div className="info-grid">
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
                      <div className="info-item__value" style={{ color: 'var(--color-text-tertiary)' }}>Not provided</div>
                    )}
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Role</div>
                    <div className="info-item__value">{submission.target_position}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Target Company</div>
                    <div className="info-item__value">{submission.target_company || 'Not specified'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Submission Date</div>
                    <div className="info-item__value">
                      {format(parseISO(submission.created_at), 'PPP p')}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-item__label">Has Existing CV</div>
                    <div className="info-item__value">
                      {submission.existing_cv_url ? 'Yes' : 'No'}
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
                        .map((activity, index) => (
                          <div key={activity.id} className={`timeline__item timeline__item--${activity.activity_type === 'status_changed' ? 'progress' : activity.activity_type === 'assigned' ? 'assigned' : 'created'}`}>
                            <div className="timeline__icon">
                              {activity.activity_type === 'status_changed' ? (
                                <Play size={20} />
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

            {/* Files */}
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

                    {/* Generated Documents */}
                    {documents.map((doc) => (
                      <div key={doc.id} className="file-item">
                        <div className="file-item__icon">
                          <FileText size={20} />
                        </div>
                        <div className="file-item__info">
                          <div className="file-item__name">{doc.file_name}</div>
                          <div className="file-item__meta">
                            {doc.file_type.toUpperCase()} • v{doc.version} • {formatDistanceToNow(parseISO(doc.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Download />}
                          onClick={() => downloadDocument(id, doc.id, doc.file_name)}
                          title="Download"
                        />
                      </div>
                    ))}

                    {documents.length === 0 && !submission.existing_cv_url && (
                      <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>
                        No documents available. Generate AI CV first.
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="submission-detail__sidebar">
            {/* Assign Staff - Only visible to super_admin */}
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

            {/* AI Generation */}
            <Card>
              <Card.Header title="AI Generation" icon={<Zap />} />
              <Card.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      AI Model
                    </label>
                    <Select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </Select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      System Prompt
                    </label>
                    <Select
                      value={selectedPrompt}
                      onChange={(e) => setSelectedPrompt(e.target.value)}
                    >
                      <option value="auto">Auto-select (Recommended)</option>
                      {availablePrompts.filter(p => p.is_active).map(prompt => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.name} ({prompt.category.replace('_', ' ').toUpperCase()})
                        </option>
                      ))}
                    </Select>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                      {selectedPrompt === 'auto' 
                        ? 'The system will automatically select the best prompt for the target role'
                        : availablePrompts.find(p => p.id === selectedPrompt)?.description
                      }
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      Custom Instructions
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Add custom instructions for the AI..."
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: 'var(--space-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'inherit',
                        fontSize: 'var(--text-sm)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <input
                      type="checkbox"
                      id="includeChatHistory"
                      checked={includeChatHistory}
                      onChange={(e) => setIncludeChatHistory(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="includeChatHistory" style={{ fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                      Include chat history in generation
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    icon={isGenerating ? <Loader className="animate-spin" /> : <Zap />}
                    onClick={handleGenerateCV}
                    disabled={isGenerating}
                    loading={isGenerating}
                    style={{ width: '100%' }}
                  >
                    {isGenerating ? 'Generating...' : 'Generate CV'}
                  </Button>
                </div>

                {/* Generation History */}
                {generationHistory.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      Generation History
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {generationHistory.slice(0, 3).map((gen, idx) => {
                        const generationId = gen.ai_generation_id || gen.id
                        return (
                        <div key={idx} style={{
                          background: 'var(--color-bg-secondary)',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{gen.model}</span>
                            <Badge variant={gen.status === 'success' ? 'completed' : 'new'}>
                              {gen.status}
                            </Badge>
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            Tokens: {formatTokenInfo(gen.tokens)} • Cost: {formatCost(gen.cost)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRenderDocuments(generationId)}
                            disabled={isRenderingDocs}
                            loading={isRenderingDocs}
                            style={{ marginTop: '8px', width: '100%' }}
                          >
                            {isRenderingDocs ? 'Rendering...' : 'Render Documents'}
                          </Button>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Generated Documents */}
                {documents.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      Generated Documents
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {documents.map(doc => (
                        <div key={doc.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--color-bg-secondary)',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                              {doc.file_name}
                            </div>
                            <div style={{ color: 'var(--color-text-secondary)' }}>
                              {doc.file_type.toUpperCase()} • v{doc.version}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download size={14} />}
                            onClick={() => downloadDocument(id, doc.id, doc.file_name)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
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
                        } ${glowingStatus === option.value ? 'status-button--glow' : ''}`}
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
                    to={`/admin/chat/${submission.reference_id}`}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader title="Delete Submission" onClose={() => setDeleteModalOpen(false)} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete this submission from <strong>{submission?.client?.first_name} {submission?.client?.last_name}</strong>? This action cannot be undone.
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
