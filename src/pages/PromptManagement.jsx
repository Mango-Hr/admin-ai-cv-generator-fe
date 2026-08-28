import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { Input, Select } from '../components/shared/Input'
import Skeleton from '../components/shared/Skeleton'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { getPrompts, getPromptStats, createPrompt, updatePrompt, activatePrompt, deactivatePrompt, deletePrompt } from '../services/promptService'
import './PromptManagement.css'

const CATEGORIES = ['technology', 'executive', 'marketing_sales', 'general', 'creative']

export default function PromptManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState([])
  const [stats, setStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showNewPromptForm, setShowNewPromptForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    content: '',
    is_active: true,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Don't call loadData() - stats should stay constant
    // Filtering happens locally via filteredPrompts
  }, [selectedCategory, searchTerm])

  const loadData = async () => {
    setLoading(true)
    try {
      const [promptsData, statsData] = await Promise.all([
        getPrompts(),
        getPromptStats(),
      ])
      setPrompts(promptsData)
      setStats(statsData)
    } catch (error) {
      toast.error('Failed to load prompts')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Prompt name is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      content: '',
      is_active: true,
    })
    setErrors({})
    setEditingPrompt(null)
    setShowNewPromptForm(false)
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      let result
      if (editingPrompt) {
        result = await updatePrompt(editingPrompt.id, formData)
        setPrompts(prev => prev.map(p => (p.id === editingPrompt.id ? result : p)))
        toast.success('Prompt updated successfully')
      } else {
        result = await createPrompt(formData)
        setPrompts(prev => [result, ...prev])
        toast.success('Prompt created successfully')
      }
      resetForm()
    } catch (error) {
      toast.error(editingPrompt ? 'Failed to update prompt' : 'Failed to create prompt')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (prompt) => {
    try {
      if (prompt.is_active) {
        await deactivatePrompt(prompt.id)
        toast.success('Prompt deactivated')
      } else {
        await activatePrompt(prompt.id)
        toast.success('Prompt activated')
      }
      setPrompts(prev =>
        prev.map(p => (p.id === prompt.id ? { ...p, is_active: !p.is_active } : p))
      )
    } catch (error) {
      toast.error('Failed to toggle prompt status')
      console.error(error)
    }
  }

  const handleDeleteConfirm = async (promptId) => {
    try {
      await deletePrompt(promptId)
      setPrompts(prev => prev.filter(p => p.id !== promptId))
      toast.success('Prompt deleted successfully')
      setDeleteConfirmId(null)
    } catch (error) {
      toast.error('Failed to delete prompt')
      console.error(error)
    }
  }

  const handleEditPrompt = (prompt) => {
    setFormData({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      content: prompt.content,
      is_active: prompt.is_active,
    })
    setEditingPrompt(prompt)
    setErrors({})
    setShowNewPromptForm(true)
  }

  const filteredPrompts = prompts.filter(p => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="prompt-management">
          {/* Header Skeleton */}
          <div className="prompt-management__header">
            <div className="prompt-management__title-section">
              <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="60%" height={16} />
            </div>
            <Skeleton width={140} height={40} />
          </div>

          {/* Stats Skeleton */}
          <div className="prompt-management__stats">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="stat-card">
                <Skeleton width="70%" height={14} style={{ marginBottom: 'var(--space-2)' }} />
                <Skeleton width="40%" height={32} />
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="prompt-management__filters">
            <div className="filter-group">
              <Skeleton width="60px" height={14} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="100%" height={40} />
            </div>
            <div className="filter-group">
              <Skeleton width="60px" height={14} style={{ marginBottom: 'var(--space-2)' }} />
              <Skeleton width="100%" height={40} />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="prompts-table-wrapper">
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ 
                padding: 'var(--space-4)', 
                borderBottom: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 0.5fr 0.5fr 0.5fr',
                gap: 'var(--space-3)'
              }}>
                <Skeleton width="80%" height={18} />
                <Skeleton width="70%" height={18} />
                <Skeleton width="90%" height={18} />
                <Skeleton width="60%" height={18} />
                <Skeleton width="40%" height={18} />
                <Skeleton width="50%" height={18} />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="prompt-management">
        {/* Header */}
        <div className="prompt-management__header">
          <div className="prompt-management__title-section">
            <h1 className="prompt-management__title">System Prompts</h1>
            <p className="prompt-management__subtitle">
              Manage AI prompt templates for CV generation
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={() => {
              setEditingPrompt(null)
              setFormData({
                name: '',
                description: '',
                category: 'general',
                content: '',
                is_active: true,
              })
              setErrors({})
              setShowNewPromptForm(true)
            }}
          >
            Create Prompt
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="prompt-management__stats">
            <div className="stat-card">
              <div className="stat-card__label">Total Prompts</div>
              <div className="stat-card__value">{stats.total_prompts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Active</div>
              <div className="stat-card__value">{stats.active_prompts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Total Usage</div>
              <div className="stat-card__value">{stats.total_usage}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="prompt-management__filters">
          <div className="filter-group">
            <label className="filter-group__label">Search</label>
            <Input
              placeholder="Search by name or description..."
              icon={<Search />}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-group__label">Category</label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Prompts Table */}
        <motion.div
          className="prompts-table-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <table className="prompts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Usage</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-tertiary)' }}>
                    No prompts found
                  </td>
                </tr>
              ) : (
                filteredPrompts.map(prompt => (
                  <tr key={prompt.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {prompt.name}
                      </div>
                    </td>
                    <td>
                      <Badge variant="ghost">
                        {prompt.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {prompt.description || '-'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {prompt.usage_count}
                    </td>
                    <td>
                      <button
                        className="status-toggle"
                        onClick={() => handleToggleActive(prompt)}
                        title={prompt.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {prompt.is_active ? (
                          <ToggleRight size={20} style={{ color: '#10B981' }} />
                        ) : (
                          <ToggleLeft size={20} style={{ color: '#6B7280' }} />
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 />}
                          onClick={() => handleEditPrompt(prompt)}
                          title="Edit prompt"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={() => setDeleteConfirmId(prompt.id)}
                          title="Delete prompt"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Create/Edit Prompt Form Modal */}
        {showNewPromptForm && (
          <div className="prompt-modal-overlay" onClick={resetForm}>
            <motion.div
              className="prompt-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="prompt-form-header">
                <h2>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</h2>
                <button 
                  className="prompt-form-close"
                  onClick={resetForm}
                  title="Close form"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="prompt-modal-body">
                <form onSubmit={handleCreateOrUpdate} className="prompt-form">
                  <div className="form-group">
                    <label>Prompt Name *</label>
                    <Input
                      placeholder="e.g., Tech Engineering Master Prompt"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <Select
                        value={formData.category}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </Select>
                      {errors.category && (
                        <div className="form-error">{errors.category}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <Input
                      placeholder="Brief description of this prompt"
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Content *</label>
                    <textarea
                      placeholder="Enter the prompt content..."
                      value={formData.content}
                      onChange={(e) => handleFieldChange('content', e.target.value)}
                      className={errors.content ? 'textarea-error' : ''}
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: 'var(--space-3)',
                        border: errors.content ? '2px solid #EF4444' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'monospace',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg)',
                      }}
                    />
                    {errors.content && (
                      <div className="form-error">{errors.content}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="ghost"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : (editingPrompt ? 'Update Prompt' : 'Create Prompt')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <Modal
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            size="sm"
          >
            <ModalHeader
              title="Delete Prompt"
              onClose={() => setDeleteConfirmId(null)}
            />
            <ModalBody>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <AlertCircle size={24} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ marginBottom: 'var(--space-2)' }}>
                    Are you sure you want to delete this prompt?
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
              >
                Delete Prompt
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </AdminLayout>
  )
}
