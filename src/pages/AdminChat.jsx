import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import Chat from '../components/shared/Chat'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { fetchSubmissions } from '../services/submissionsService'
import './AdminChat.css'

export default function AdminChat() {
  const { referenceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setLoading(true)
        const data = await fetchSubmissions()
        const submissionsData = data.submissions || []
        
        // Find submission by reference_id
        const found = submissionsData.find(s => s.reference_id === referenceId)
        
        if (!found) {
          toast.error('Submission not found')
          navigate('/admin/submissions')
          return
        }
        
        setSubmission(found)
      } catch (error) {
        console.error('Failed to load submission:', error)
        toast.error('Failed to load submission')
        navigate('/admin/submissions')
      } finally {
        setLoading(false)
      }
    }

    loadSubmission()
  }, [referenceId, navigate, toast])

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-chat__loading">
          <div className="admin-chat__spinner" />
          <p>Loading chat...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!submission) {
    return null
  }

  return (
    <AdminLayout>
      <div className="admin-chat">
        {/* Header */}
        <div className="admin-chat__header">
          <Link to={`/admin/submissions/${submission.id}`} className="admin-chat__back">
            <ArrowLeft size={16} />
            Back to Submission
          </Link>
          <h1 className="admin-chat__title">
            Chat with {submission.client.first_name} {submission.client.last_name}
          </h1>
          <p className="admin-chat__subtitle">{submission.reference_id}</p>
        </div>

        {/* Chat Container */}
        <div className="admin-chat__container">
          {user && (
            <Chat 
              submissionId={submission.id}
              jwtToken={localStorage.getItem('admin_token')}
              staffName={`${user.first_name} ${user.last_name}`}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
