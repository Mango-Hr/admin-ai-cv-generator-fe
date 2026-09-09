import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  CheckCircle2,
  MessageSquare,
  Send,
  Lightbulb,
  Bot,
  User,
  Loader2,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'

import Button from '../components/shared/Button'
import ProgressiveLoadingButton from '../components/shared/ProgressiveLoadingButton'
import { Select, Textarea } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { useToast } from '../contexts/ToastContext'
import {
  fetchSubmissionById,
  saveResumeText,
  updateJobDescription,
  tailorResume,
  getAvailableModels,
  getAvailablePrompts,
} from '../services/submissionsService'
import { getSubmissionDocuments, downloadDocument, askAIQuestion } from '../services/aiService'
import { classifyDocument, buildDownloadName } from '../utils/documentNames'
import './TailorResume.css'

export default function TailorResume() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [documents, setDocuments] = useState([])
  const [models, setModels] = useState([])
  const [modelsSource, setModelsSource] = useState('openai_api')
  const [prompts, setPrompts] = useState([])

  // Core tailoring inputs
  const [resumeText, setResumeText] = useState('')
  const [resumeSaveState, setResumeSaveState] = useState('saved') // saving | saved | error
  const [jobDescription, setJobDescription] = useState('')
  const [jdSaveState, setJdSaveState] = useState('saved') // saving | saved | error
  const [instructions, setInstructions] = useState('')

  // Model selection
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [selectedPromptId, setSelectedPromptId] = useState('auto') // 'auto' for smart selection, or specific prompt ID

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)

  // Documents produced by the latest /tailor call (Cloudinary URLs)
  const [latestDocs, setLatestDocs] = useState([])

  // AI follow-up chat
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const chatEndRef = useRef(null)

  // Track whether initial load has hydrated from server
  const hydratedRef = useRef(false)

  const firstName = submission?.client?.first_name || ''

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [submissionData, modelsResponse, docsData, promptsData] = await Promise.all([
          fetchSubmissionById(id),
          getAvailableModels().catch(() => null),
          getSubmissionDocuments(id).catch(() => []),
          getAvailablePrompts().catch(() => []),
        ])

        if (!submissionData) {
          toast.error('Client not found')
          navigate('/admin/submissions')
          return
        }

        setSubmission(submissionData)
        setDocuments(Array.isArray(docsData) ? docsData : [])
        setPrompts(Array.isArray(promptsData) ? promptsData : [])

        // Models
        if (modelsResponse) {
          setModels(modelsResponse.models || [])
          setModelsSource(modelsResponse.source || 'openai_api')
          // Default to the recommended model
          const recommended = (modelsResponse.models || []).find(m => m.tier === 'recommended')
          if (recommended) setSelectedModel(recommended.id)
        }

        // Pre-fill from server-side saved values
        const serverResume = submissionData.saved_resume_text || ''
        const serverJD = submissionData.job_description || ''
        setResumeText(serverResume)
        setJobDescription(serverJD)
        hydratedRef.current = true
      } catch (error) {
        console.error('Failed to load tailoring data:', error)
        toast.error('Failed to load client data')
        navigate('/admin/submissions')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Auto-scroll follow-up chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isAsking])

  // ------------------------------------------------------------------
  // Save resume text to server (debounced — PATCH /resume-text)
  // ------------------------------------------------------------------
  const saveResumeToServer = useCallback(async (text) => {
    if (!hydratedRef.current) return
    if (!text.trim()) return
    setResumeSaveState('saving')
    try {
      await saveResumeText(id, text)
      setResumeSaveState('saved')
    } catch (error) {
      console.error('Failed to save resume text:', error)
      setResumeSaveState('error')
    }
  }, [id])

  // Debounced auto-save for resume text
  const resumeTimerRef = useRef(null)
  const handleResumeChange = useCallback((e) => {
    const value = e.target.value
    setResumeText(value)
    setResumeSaveState('saving')

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      saveResumeToServer(value)
    }, 800)
  }, [saveResumeToServer])

  // ------------------------------------------------------------------
  // Save job description to server — on blur (PATCH /job-description)
  // ------------------------------------------------------------------
  const saveJDToServer = useCallback(async (text) => {
    if (!hydratedRef.current) return
    setJdSaveState('saving')
    try {
      await updateJobDescription(id, text || null)
      setJdSaveState('saved')
    } catch (error) {
      console.error('Failed to save job description:', error)
      setJdSaveState('error')
    }
  }, [id])

  const handleJDChange = useCallback((e) => {
    setJobDescription(e.target.value)
    setJdSaveState('unsaved')
  }, [])

  const handleJDBlur = useCallback(() => {
    if (jdSaveState === 'unsaved') {
      saveJDToServer(jobDescription)
    }
  }, [jdSaveState, jobDescription, saveJDToServer])

  // ------------------------------------------------------------------
  // Tailor Resume — POST /submissions/{id}/tailor (one-click generation)
  // ------------------------------------------------------------------
  const handleTailor = async () => {
    if (!resumeText.trim()) {
      toast.error("Paste the client's resume first — it is saved for the next job too")
      return
    }
    if (!jobDescription.trim()) {
      toast.error('Paste the job description you are tailoring for')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setLatestDocs([])

    try {
      // Ensure both fields are persisted to the server before tailoring
      await Promise.all([
        saveResumeToServer(resumeText),
        saveJDToServer(jobDescription),
      ])

      const result = await tailorResume(id, {
        provider: 'openai',
        model: selectedModel,
        prompt_id: selectedPromptId === 'auto' ? null : selectedPromptId,
        custom_instructions: instructions || null,
        include_chat_history: true,
      })

      const docs = result?.documents || []
      setLatestDocs(docs)
      setDocuments(prev => [...docs, ...prev])

      toast.success(`Resume tailored — ${docs.length} file(s) ready for download`)
    } catch (error) {
      console.error('Tailoring failed:', error)
      const message = error.message || 'Failed to tailor the resume'
      const status = error.status

      if (status === 400) {
        setGenerationError('No resume content found. Save the resume text before tailoring.')
      } else if (status === 503) {
        setGenerationError('AI service is not configured. Contact your system administrator.')
      } else {
        setGenerationError(message)
      }
      toast.error('Tailoring failed — see details below')
    } finally {
      setIsGenerating(false)
    }
  }

  // ------------------------------------------------------------------
  // Download
  // ------------------------------------------------------------------
  const handleDownloadDoc = (doc) => {
    const name = buildDownloadName(doc, classifyDocument(doc), firstName)
    downloadDocument(id, doc.id, name)
      .then(() => toast.success('Download started'))
      .catch(error => {
        console.error('Download failed:', error)
        toast.error('Failed to download the document')
      })
  }

  // ------------------------------------------------------------------
  // Done — clear job description, keep resume
  // ------------------------------------------------------------------
  const handleDone = async () => {
    setJobDescription('')
    setInstructions('')
    setLatestDocs([])
    setGenerationError(null)
    setChatMessages([])
    setChatInput('')

    // Clear the JD on the server (PATCH /job-description with null)
    try {
      await updateJobDescription(id, null)
      setJdSaveState('saved')
    } catch (error) {
      console.error('Failed to clear job description on server:', error)
      // Still clear locally — the server failure is non-blocking for the UX
    }

    toast.success('Ready for the next job — the resume text is saved')
  }

  // ------------------------------------------------------------------
  // AI follow-up chat
  // ------------------------------------------------------------------
  const handleAsk = async () => {
    const question = chatInput.trim()
    if (!question || isAsking) return

    setChatMessages(prev => [...prev, { role: 'user', content: question }])
    setChatInput('')
    setIsAsking(true)

    try {
      const result = await askAIQuestion(id, {
        question,
        resume_text: resumeText,
        job_description: jobDescription,
      })
      const answer = result?.answer || result?.response || result?.message || 'No answer returned.'
      setChatMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (error) {
      console.error('AI follow-up question failed:', error)
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'The AI follow-up assistant is not available yet — the server endpoint has not been implemented. The resume and job description are ready to send once it is.',
        },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------
  const sortedDocs = [...documents].sort((a, b) => {
    const va = a.version || 0
    const vb = b.version || 0
    if (vb !== va) return vb - va
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })

  const resumeDocs = sortedDocs.filter(d => classifyDocument(d) === 'resume')
  const coverDocs = sortedDocs.filter(d => classifyDocument(d) === 'cover')

  const latestResumePdf = latestDocs.find(d => classifyDocument(d) === 'resume' && d.file_type === 'pdf')
    || resumeDocs.find(d => d.file_type === 'pdf')
  const latestResumeDocx = latestDocs.find(d => classifyDocument(d) === 'resume' && d.file_type === 'docx')
    || resumeDocs.find(d => d.file_type === 'docx')
  const latestCoverPdf = latestDocs.find(d => classifyDocument(d) === 'cover' && d.file_type === 'pdf')
    || coverDocs.find(d => d.file_type === 'pdf')
  const latestCoverDocx = latestDocs.find(d => classifyDocument(d) === 'cover' && d.file_type === 'docx')
    || coverDocs.find(d => d.file_type === 'docx')

  const resumeSaved = resumeText.trim().length > 0
  const canTailor = resumeSaved && jobDescription.trim().length > 0 && !isGenerating

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <AdminLayout>
        <div className="tailor-resume">
          <Skeleton variant="text" width={200} height={40} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Skeleton variant="card" height={700} />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!submission) return null

  return (
    <AdminLayout>
      <div className="tailor-resume">
        {/* Header */}
        <div className="tailor-resume__header">
          <div className="tailor-resume__header-left">
            <Link to={`/admin/submissions/${submission.id}`} className="tailor-resume__back">
              <ArrowLeft size={16} />
              Back to Client
            </Link>
            <h1 className="tailor-resume__title">Tailor Resume</h1>
            <p className="tailor-resume__subtitle">
              Tailor {firstName ? `${firstName}'s` : "the client's"} resume to a specific job — one click generates both a resume and cover letter in PDF and Word.
            </p>
          </div>
          <Button variant="secondary" size="md" icon={<CheckCircle2 />} onClick={handleDone}>
            Done — Next Job
          </Button>
        </div>

        <motion.div
          className="tailor-resume__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main workflow */}
          <div className="tailor-resume__main">
            <Card>
              <Card.Header
                title={`Tailor ${firstName || 'Client'}`}
                icon={<Sparkles />}
                action={
                  <span className="tailor-resume__client-ref">{submission.reference_id}</span>
                }
              />
              <Card.Body>
                <form
                  className="tailor-form"
                  onSubmit={(e) => { e.preventDefault(); handleTailor() }}
                >
                  {/* 1. Resume text (saved once — PATCH /resume-text) */}
                  <div className="tailor-form__step">
                    <div className="tailor-form__step-number">1</div>
                    <div className="tailor-form__step-body">
                      <div className="tailor-form__label-row">
                        <label className="tailor-form__label">Client's Resume</label>
                        <span className={`tailor-form__save-state ${resumeSaveState === 'saving' ? 'tailor-form__save-state--saving' : ''} ${resumeSaveState === 'error' ? 'tailor-form__save-state--error' : ''}`}>
                          {resumeSaveState === 'saving' ? 'Saving…' : resumeSaveState === 'error' ? 'Save failed — retry' : 'Saved ✓'}
                        </span>
                      </div>
                      <p className="tailor-form__hint">
                        Paste the client's resume once — it is saved permanently and reused for every job, so you never re-paste it.
                      </p>
                      <Textarea
                        value={resumeText}
                        onChange={handleResumeChange}
                        placeholder="Paste the client's full resume here…"
                        rows={10}
                      />
                    </div>
                  </div>

                  {/* 2. Job description (cycle-specific — PATCH /job-description) */}
                  <div className="tailor-form__step">
                    <div className="tailor-form__step-number">2</div>
                    <div className="tailor-form__step-body">
                      <div className="tailor-form__label-row">
                        <label className="tailor-form__label">Job Description</label>
                        {jdSaveState === 'saving' && (
                          <span className="tailor-form__save-state tailor-form__save-state--saving">Saving…</span>
                        )}
                        {jdSaveState === 'unsaved' && (
                          <span className="tailor-form__save-state tailor-form__save-state--saving">Unsaved changes</span>
                        )}
                      </div>
                      <p className="tailor-form__hint">
                        Paste the job posting fresh for each application — this box clears after each job.
                      </p>
                      <Textarea
                        value={jobDescription}
                        onChange={handleJDChange}
                        onBlur={handleJDBlur}
                        placeholder="Paste the job description here…"
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* 3. Additional instructions */}
                  <div className="tailor-form__step">
                    <div className="tailor-form__step-number">3</div>
                    <div className="tailor-form__step-body">
                      <label className="tailor-form__label">
                        Additional Instructions <span className="tailor-form__optional">(Optional)</span>
                      </label>
                      <p className="tailor-form__hint">
                        Free text for the AI — e.g. emphasize specific skills, keep to one page, tone preferences.
                      </p>
                      <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Any specific requirements for this application…"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 4. Prompt template selector */}
                  <div className="tailor-form__step">
                    <div className="tailor-form__step-number">4</div>
                    <div className="tailor-form__step-body">
                      <label className="tailor-form__label">AI Prompt Template</label>
                      <p className="tailor-form__hint">
                        Choose a prompt template to guide the AI tailoring. Select "Auto" to let the AI smart-match based on the job title.
                      </p>
                      {prompts.length > 0 || true ? (
                        <Select
                          value={selectedPromptId}
                          onChange={(e) => setSelectedPromptId(e.target.value)}
                        >
                          <option value="auto">
                            Auto — Smart role matching (recommended)
                          </option>
                          <optgroup label="Custom Prompts">
                            {prompts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.title || p.name} {p.category ? `— ${p.category}` : ''} ({p.usage_count || 0} uses)
                              </option>
                            ))}
                          </optgroup>
                        </Select>
                      ) : (
                        <div className="tailor-form__empty-prompt">
                          No custom prompts created yet. Using auto-selection.
                        </div>
                      )}
                      <div className="tailor-form__tip" style={{ marginTop: 'var(--space-3)' }}>
                        <Zap size={14} />
                        <span>Auto mode reads the job title and selects the best matching prompt automatically.</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. AI Model selector */}
                  <div className="tailor-form__step">
                    <div className="tailor-form__step-number">5</div>
                    <div className="tailor-form__step-body">
                      <label className="tailor-form__label">AI Model</label>
                      <p className="tailor-form__hint">
                        Choose the model for this generation run.
                      </p>
                      {models.length > 0 ? (
                        <>
                          <Select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                          >
                            {models.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.label} — {m.note}{m.tier === 'recommended' ? ' ⭐' : ''}
                              </option>
                            ))}
                          </Select>
                          {modelsSource === 'curated' && (
                            <div className="tailor-form__tip" style={{ marginTop: 'var(--space-2)' }}>
                              <AlertTriangle size={14} />
                              <span>Live model list was unavailable — showing a curated fallback list.</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="tailor-form__empty-prompt">
                          No models available. The server may be unreachable.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send */}
                  <div className="tailor-form__actions">
                    <ProgressiveLoadingButton
                      isLoading={isGenerating}
                      onClick={handleTailor}
                      icon={Sparkles}
                      size="lg"
                      style={{ flex: 1, minWidth: 220 }}
                      disabled={!canTailor}
                    >
                      {isGenerating ? 'Generating…' : 'Tailor Resume'}
                    </ProgressiveLoadingButton>
                  </div>

                  {!resumeSaved && (
                    <div className="tailor-form__tip tailor-form__tip--warning">
                      <AlertTriangle size={14} />
                      <span>Paste the client's resume above first — the server requires it before tailoring.</span>
                    </div>
                  )}
                  {resumeSaved && !jobDescription.trim() && !isGenerating && (
                    <div className="tailor-form__tip">
                      <Lightbulb size={14} />
                      <span>Paste a job description and hit Tailor — both a resume and cover letter will be generated in PDF and Word.</span>
                    </div>
                  )}

                  {/* Generation error */}
                  {generationError && (
                    <div className="tailor-form__error">
                      <AlertTriangle size={16} />
                      <div>
                        <div className="tailor-form__error-title">Tailoring failed</div>
                        <div className="tailor-form__error-message">{generationError}</div>
                      </div>
                    </div>
                  )}
                </form>
              </Card.Body>
            </Card>

            {/* Downloads */}
            <Card>
              <Card.Header title="Downloads" icon={<Download />} />
              <Card.Body>
                {documents.length === 0 ? (
                  <div className="tailor-resume__empty">
                    <FileText size={40} />
                    <p>No documents yet. Generate once and the files will appear here.</p>
                  </div>
                ) : (
                  <div className="tailor-downloads">
                    {/* Latest run — Resume + Cover Letter */}
                    <div className="tailor-downloads__run">
                      {/* Resume row */}
                      <div className="tailor-downloads__row">
                        <div className="tailor-downloads__kind">
                          <span className="tailor-downloads__kind-icon tailor-downloads__kind-icon--resume"><FileText size={18} /></span>
                          <div>
                            <div className="tailor-downloads__kind-title">Resume</div>
                            <div className="tailor-downloads__kind-meta">
                              {resumeDocs.length > 0
                                ? `v${resumeDocs[0].version || 1} — ${resumeDocs[0].file_type?.toUpperCase()}`
                                : 'Not generated yet'}
                            </div>
                          </div>
                        </div>
                        <div className="tailor-downloads__buttons">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Download />}
                            disabled={!latestResumePdf}
                            onClick={() => latestResumePdf && handleDownloadDoc(latestResumePdf)}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Download />}
                            disabled={!latestResumeDocx}
                            onClick={() => latestResumeDocx && handleDownloadDoc(latestResumeDocx)}
                          >
                            Word
                          </Button>
                        </div>
                      </div>

                      {/* Cover letter row */}
                      <div className="tailor-downloads__row">
                        <div className="tailor-downloads__kind">
                          <span className="tailor-downloads__kind-icon tailor-downloads__kind-icon--cover"><FileText size={18} /></span>
                          <div>
                            <div className="tailor-downloads__kind-title">Cover Letter</div>
                            <div className="tailor-downloads__kind-meta">
                              {coverDocs.length > 0
                                ? `v${coverDocs[0].version || 1} — ${coverDocs[0].file_type?.toUpperCase()}`
                                : 'Generated together with the resume'}
                            </div>
                          </div>
                        </div>
                        <div className="tailor-downloads__buttons">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Download />}
                            disabled={!latestCoverPdf}
                            onClick={() => latestCoverPdf && handleDownloadDoc(latestCoverPdf)}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Download />}
                            disabled={!latestCoverDocx}
                            onClick={() => latestCoverDocx && handleDownloadDoc(latestCoverDocx)}
                          >
                            Word
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Earlier documents */}
                    {sortedDocs.length > 4 && (
                      <div className="tailor-downloads__past-title">Earlier documents</div>
                    )}
                    {sortedDocs.slice(4).map(doc => (
                      <div key={doc.id} className="file-item">
                        <div className="file-item__icon"><FileText size={18} /></div>
                        <div className="file-item__info">
                          <div className="file-item__name">{doc.file_name}</div>
                          <div className="file-item__meta">
                            {classifyDocument(doc) === 'cover' ? 'Cover Letter' : 'Resume'} • {doc.file_type?.toUpperCase()} • v{doc.version || 1}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download size={16} />}
                          title="Download"
                          onClick={() => handleDownloadDoc(doc)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* AI follow-up chat */}
            <Card>
              <Card.Header title="Ask the AI about this application" icon={<MessageSquare />} />
              <Card.Body>
                <p className="tailor-form__hint" style={{ marginBottom: 'var(--space-3)' }}>
                  Ask application-related questions. Answers are grounded in the tailored resume and the job description above.
                </p>
                <div className="tailor-chat">
                  <div className="tailor-chat__messages">
                    {chatMessages.length === 0 && (
                      <div className="tailor-chat__empty">
                        <Bot size={28} />
                        <p>Ask anything — e.g. "What should I mention in the interview?", "Is this resume missing any keyword from the job description?"</p>
                      </div>
                    )}
                    {chatMessages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`tailor-chat__bubble ${
                          message.role === 'user' ? 'tailor-chat__bubble--user' : 'tailor-chat__bubble--assistant'
                        }`}
                      >
                        <span className="tailor-chat__avatar">
                          {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </span>
                        <div className="tailor-chat__content">{message.content}</div>
                      </div>
                    ))}
                    {isAsking && (
                      <div className="tailor-chat__bubble tailor-chat__bubble--assistant">
                        <span className="tailor-chat__avatar"><Bot size={14} /></span>
                        <div className="tailor-chat__content tailor-chat__thinking">
                          <Loader2 size={14} className="tailor-chat__spinner" />
                          Thinking…
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="tailor-chat__input-row">
                    <textarea
                      className="tailor-chat__input"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAsk()
                        }
                      }}
                      placeholder="Ask a question about this application…"
                      rows={1}
                    />
                    <Button
                      variant="primary"
                      icon={<Send />}
                      disabled={!chatInput.trim() || isAsking}
                      loading={isAsking}
                      onClick={handleAsk}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="tailor-resume__sidebar">
            {/* Client summary */}
            <Card>
              <Card.Header title="Client" icon={<FileText />} />
              <Card.Body>
                <div className="tailor-resume__client-name">
                  {submission.client.first_name} {submission.client.last_name}
                </div>
                <div className="tailor-resume__client-detail">
                  <span>Target role</span>
                  <strong>{submission.target_position || '—'}</strong>
                </div>
                <div className="tailor-resume__client-detail">
                  <span>Company</span>
                  <strong>{submission.target_company || 'Not specified'}</strong>
                </div>
              </Card.Body>
            </Card>

            {/* Resume saved indicator */}
            <div className="tailor-resume__done-card">
              <CheckCircle2 size={22} />
              <div>
                <div className="tailor-resume__done-title">Finished this application?</div>
                <p>Hit "Done" to clear the job description and start the next one. The client's resume stays saved on the server.</p>
              </div>
            </div>



            <div className="tailor-resume__note">
              Output is delivered as PDF and Word only, formatted to the fixed CV template.
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
