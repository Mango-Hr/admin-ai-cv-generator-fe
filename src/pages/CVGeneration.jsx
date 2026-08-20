import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  FileCode,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import { Input, Select, Textarea } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { submissionsService, promptsService } from '../services/mockData'
import './CVGeneration.css'

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF', icon: <FileText /> },
  { value: 'docx', label: 'Word', icon: <FileText /> },
  { value: 'latex', label: 'LaTeX', icon: <FileCode /> },
]

export default function CVGeneration() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [prompts, setPrompts] = useState([])
  const [generationStatus, setGenerationStatus] = useState('idle') // idle, processing, success, error
  
  const [formData, setFormData] = useState({
    promptId: '',
    format: 'pdf',
    additionalInstructions: '',
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionData, promptsData] = await Promise.all([
        submissionsService.getById(id),
        promptsService.getAll(),
      ])
      
      if (!submissionData) {
        toast.error('Submission not found')
        navigate('/admin/submissions')
        return
      }

      setSubmission(submissionData)
      setPrompts(promptsData.filter(p => p.isActive))
      
      // Pre-select first active prompt
      if (promptsData.filter(p => p.isActive).length > 0) {
        setFormData(prev => ({ ...prev, promptId: promptsData.filter(p => p.isActive)[0].id.toString() }))
      }
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormatSelect = (format) => {
    setFormData(prev => ({ ...prev, format }))
  }

  const handleGenerate = async () => {
    if (!formData.promptId) {
      toast.error('Please select a prompt template')
      return
    }

    setGenerationStatus('processing')
    
    // Simulate AI generation with delay
    setTimeout(() => {
      setGenerationStatus('success')
      toast.success('CV generated successfully!')
    }, 3000)
  }

  const handleDownload = () => {
    toast.success(`Downloading CV as ${formData.format.toUpperCase()}`)
    // In real app, this would trigger actual file download
  }

  const selectedPrompt = prompts.find(p => p.id === parseInt(formData.promptId))

  if (loading) {
    return (
      <AdminLayout>
        <div className="cv-generation">
          <Skeleton variant="text" width={200} height={40} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Skeleton variant="card" height={600} />
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
      <div className="cv-generation">
        {/* Header */}
        <div className="cv-generation__header">
          <Link to={`/admin/submissions/${id}`} className="cv-generation__back">
            <ArrowLeft size={16} />
            Back to Submission
          </Link>
          <h1 className="cv-generation__title">Generate CV</h1>
          <p className="cv-generation__subtitle">
            Use AI to create a professional CV for {submission.clientName}
          </p>
        </div>

        {/* Content Grid */}
        <motion.div
          className="cv-generation__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main Form */}
          <div className="cv-generation__main">
            <Card>
              <Card.Header title="Configuration" icon={<Sparkles />} />
              <Card.Body>
                <form className="generation-form">
                  {/* Prompt Selection */}
                  <div className="form-section">
                    <label className="form-section__title">AI Prompt Template</label>
                    <Select
                      name="promptId"
                      value={formData.promptId}
                      onChange={handleChange}
                    >
                      <option value="">Select a prompt...</option>
                      {prompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.name} ({prompt.category})
                        </option>
                      ))}
                    </Select>
                    {selectedPrompt && (
                      <div className="prompt-preview">
                        {selectedPrompt.template}
                      </div>
                    )}
                  </div>

                  {/* Format Selection */}
                  <div className="form-section">
                    <label className="form-section__title">Output Format</label>
                    <div className="options-grid">
                      {FORMAT_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={`option-card ${
                            formData.format === option.value ? 'option-card--selected' : ''
                          }`}
                          onClick={() => handleFormatSelect(option.value)}
                        >
                          <div className="option-card__icon">{option.icon}</div>
                          <div className="option-card__label">{option.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div className="form-section">
                    <label className="form-section__title">
                      Additional Instructions (Optional)
                    </label>
                    <Textarea
                      name="additionalInstructions"
                      placeholder="Add any specific requirements or customizations..."
                      rows={4}
                      value={formData.additionalInstructions}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Actions */}
                  <div className="generation-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={generationStatus === 'processing' ? <Loader2 /> : <Sparkles />}
                      onClick={handleGenerate}
                      disabled={generationStatus === 'processing' || !formData.promptId}
                      style={{ flex: 1 }}
                    >
                      {generationStatus === 'processing' ? 'Generating...' : 'Generate CV'}
                    </Button>
                    {generationStatus === 'success' && (
                      <Button
                        variant="secondary"
                        size="lg"
                        icon={<Download />}
                        onClick={handleDownload}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="cv-generation__sidebar">
            {/* Status */}
            <Card>
              <Card.Header title="Generation Status" icon={<Sparkles />} />
              <Card.Body>
                <div className={`generation-status generation-status--${generationStatus}`}>
                  <div className="generation-status__icon">
                    {generationStatus === 'idle' && <Sparkles size={32} />}
                    {generationStatus === 'processing' && (
                      <Loader2 size={32} className="generation-status__spinner" />
                    )}
                    {generationStatus === 'success' && <CheckCircle2 size={32} />}
                    {generationStatus === 'error' && <AlertCircle size={32} />}
                  </div>
                  <div className="generation-status__title">
                    {generationStatus === 'idle' && 'Ready to Generate'}
                    {generationStatus === 'processing' && 'Generating CV...'}
                    {generationStatus === 'success' && 'Generation Complete'}
                    {generationStatus === 'error' && 'Generation Failed'}
                  </div>
                  <div className="generation-status__message">
                    {generationStatus === 'idle' && 'Configure settings and click generate'}
                    {generationStatus === 'processing' && 'AI is creating a professional CV...'}
                    {generationStatus === 'success' && 'Your CV is ready to download'}
                    {generationStatus === 'error' && 'Please try again or contact support'}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Info Cards */}
            <div className="info-cards">
              <div className="info-card info-card--tip">
                <Lightbulb className="info-card__icon" />
                <div className="info-card__content">
                  <div className="info-card__title">Pro Tip</div>
                  <div className="info-card__text">
                    Choose a template that matches the target role for best results.
                  </div>
                </div>
              </div>
              <div className="info-card info-card--warning">
                <AlertTriangle className="info-card__icon" />
                <div className="info-card__content">
                  <div className="info-card__title">Review Required</div>
                  <div className="info-card__text">
                    Always review AI-generated content before sending to client.
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Info */}
            <Card>
              <Card.Header title="Submission Details" icon={<FileText />} />
              <Card.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                      Client
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {submission.clientName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                      Target Role
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {submission.targetRole}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                      Company
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {submission.targetCompany}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
