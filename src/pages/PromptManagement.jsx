import { useState, useEffect } from 'react'
import {
  FileCode,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  Clock,
  List,
  CheckCircle2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { promptsService } from '../services/mockData'
import './PromptManagement.css'

export default function PromptManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState([])

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const promptsData = await promptsService.getAll()
      setPrompts(promptsData)
    } catch (error) {
      toast.error('Failed to load prompts')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadPrompts()
    toast.success('Data refreshed')
  }

  const handleAddPrompt = () => {
    toast.info('Add prompt feature coming soon')
  }

  const handleEdit = (prompt) => {
    toast.info(`Edit "${prompt.name}" - Coming soon`)
  }

  const handleDuplicate = (prompt) => {
    toast.success(`Duplicated "${prompt.name}"`)
  }

  const handleDelete = (prompt) => {
    toast.warning(`Delete "${prompt.name}" - Coming soon`)
  }

  const handleToggleActive = (prompt) => {
    toast.success(`${prompt.name} ${prompt.isActive ? 'deactivated' : 'activated'}`)
  }

  const formatTemplate = (template) => {
    // Highlight placeholders like {role}, {company}, etc.
    return template.replace(/\{([^}]+)\}/g, (match, p1) => {
      return `{${p1}}`
    })
  }

  const totalPrompts = prompts.length
  const activePrompts = prompts.filter(p => p.isActive).length
  const totalUsage = prompts.reduce((sum, p) => sum + p.usageCount, 0)

  const getCategoryIcon = (category) => {
    const icons = {
      Technology: <FileCode size={20} />,
      Product: <TrendingUp size={20} />,
      Executive: <CheckCircle2 size={20} />,
      Marketing: <List size={20} />,
    }
    return icons[category] || <FileCode size={20} />
  }

  return (
    <AdminLayout>
      <div className="prompt-management">
        {/* Header */}
        <div className="prompt-management__header">
          <div className="prompt-management__title-section">
            <h1 className="prompt-management__title">Prompt Management</h1>
            <p className="prompt-management__subtitle">
              Configure AI templates for CV generation
            </p>
          </div>
          <div className="prompt-management__actions">
            <Button variant="ghost" icon={<RefreshCw />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="primary" icon={<Plus />} onClick={handleAddPrompt}>
              New Prompt
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="prompt-stats">
          <div className="prompt-stat prompt-stat--total">
            <div className="prompt-stat__icon">
              <FileCode size={20} />
            </div>
            <div className="prompt-stat__info">
              <div className="prompt-stat__value">{totalPrompts}</div>
              <div className="prompt-stat__label">Total Prompts</div>
            </div>
          </div>
          <div className="prompt-stat prompt-stat--active">
            <div className="prompt-stat__icon">
              <CheckCircle2 size={20} />
            </div>
            <div className="prompt-stat__info">
              <div className="prompt-stat__value">{activePrompts}</div>
              <div className="prompt-stat__label">Active</div>
            </div>
          </div>
          <div className="prompt-stat prompt-stat--usage">
            <div className="prompt-stat__icon">
              <TrendingUp size={20} />
            </div>
            <div className="prompt-stat__info">
              <div className="prompt-stat__value">{totalUsage}</div>
              <div className="prompt-stat__label">Total Usage</div>
            </div>
          </div>
        </div>

        {/* Prompt List */}
        {loading ? (
          <div className="prompt-list">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" height={300} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="prompt-management__empty">
            <EmptyState
              icon={<FileCode />}
              title="No prompts yet"
              description="Create your first AI prompt template"
              action={
                <Button variant="primary" icon={<Plus />} onClick={handleAddPrompt}>
                  Create Prompt
                </Button>
              }
            />
          </div>
        ) : (
          <div className="prompt-list">
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`prompt-card prompt-card--${prompt.category.toLowerCase()}`}>
                  {/* Header */}
                  <div className="prompt-card__header">
                    <div className="prompt-card__title-section">
                      <div className="prompt-card__top">
                        <div className="prompt-card__icon">
                          {getCategoryIcon(prompt.category)}
                        </div>
                        <h3 className="prompt-card__name">{prompt.name}</h3>
                      </div>
                      <p className="prompt-card__description">{prompt.description}</p>
                      <div className="prompt-card__meta">
                        <div className="prompt-card__category">{prompt.category}</div>
                        <div className="prompt-card__usage">
                          <TrendingUp size={12} />
                          {prompt.usageCount} uses
                        </div>
                        <div className="prompt-card__updated">
                          <Clock size={12} />
                          Updated {format(prompt.updatedAt, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="prompt-card__actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit />}
                        onClick={() => handleEdit(prompt)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy />}
                        onClick={() => handleDuplicate(prompt)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 />}
                        onClick={() => handleDelete(prompt)}
                        style={{ color: '#ef4444' }}
                      />
                    </div>
                  </div>

                  {/* Body - Template */}
                  <div className="prompt-card__body">
                    <div className="prompt-card__template">
                      {formatTemplate(prompt.template)}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="prompt-card__footer">
                    <div className="prompt-card__toggle">
                      <div
                        className={`toggle-switch ${prompt.isActive ? 'toggle-switch--active' : ''}`}
                        onClick={() => handleToggleActive(prompt)}
                      >
                        <div className="toggle-switch__slider" />
                      </div>
                      <span>{prompt.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <Badge variant={prompt.isActive ? 'completed' : 'new'}>
                      {prompt.isActive ? 'In Use' : 'Disabled'}
                    </Badge>
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
