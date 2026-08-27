import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../components/layout/AdminLayout'
import Card from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import { Input, Select } from '../components/shared/Input'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { getPrompts, getPromptStats, createPrompt, updatePrompt, activatePrompt, deactivatePrompt, deletePrompt } from '../services/promptService'
import './PromptManagement.css'

const CATEGORIES = ['tech', 'executive', 'marketing_sales', 'general', 'creative']

export default function PromptManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState([])
  const [stats, setStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showNewPromptForm, setShowNewPromptForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    target_position: '',
    category: 'general',
    prompt_text: '',
    description: '',
    is_active: true,
    is_default: false,
  })

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      const [promptsData, statsData] = await Promise.all([
        getPrompts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm,
        }),
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
    // Debounce search
    setTimeout(() => loadData(), 300)
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.prompt_text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

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

      setFormData({
        title: '',
        target_position: '',
        category: 'general',
        prompt_text: '',
        description: '',
        is_active: true,
        is_default: false,
      })
      setEditingPrompt(null)
      setShowNewPromptForm(false)
      loadData()
    } catch (error) {
      toast.error(editingPrompt ? 'Failed to update prompt' : 'Failed to create prompt')
      console.error(error)
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

  const handleDelete = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return

    try {
      await deletePrompt(promptId)
      setPrompts(prev => prev.filter(p => p.id !== promptId))
      toast.success('Prompt deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete prompt')
      console.error(error)
    }
  }

  const handleEditPrompt = (prompt) => {
    setFormData({
      title: prompt.title,
      target_position: prompt.target_position,
      category: prompt.category,
      prompt_text: prompt.prompt_text,
      description: prompt.description,
      is_active: prompt.is_active,
      is_default: prompt.is_default,
    })
    setEditingPrompt(prompt)
    setShowNewPromptForm(true)
  }

  const filteredPrompts = prompts.filter(p =>
    searchTerm === '' || 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: 'var(--space-6)' }}>Loading prompts...</div>
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
                title: '',
                target_position: '',
                category: 'general',
                prompt_text: '',
                description: '',
                is_active: true,
                is_default: false,
              })
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
              placeholder="Search by title or description..."
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
                <th>Title</th>
                <th>Category</th>
                <th>Target Position</th>
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
                        {prompt.title}
                        {prompt.is_default && (
                          <Badge size="sm" variant="new" style={{ marginLeft: 'var(--space-2)' }}>
                            Default
                          </Badge>
                        )}
                      </div>
                      {prompt.description && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          {prompt.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant="ghost">
                        {prompt.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {prompt.target_position}
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
                          onClick={() => handleDelete(prompt.id)}
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

        {/* New/Edit Prompt Modal */}
        <Modal
          isOpen={showNewPromptForm}
          onClose={() => {
            setShowNewPromptForm(false)
            setEditingPrompt(null)
          }}
          size="lg"
        >
          <ModalHeader
            title={editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            onClose={() => {
              setShowNewPromptForm(false)
              setEditingPrompt(null)
            }}
          />
          <ModalBody>
            <form onSubmit={handleCreateOrUpdate} className="prompt-form">
              <div className="form-group">
                <label>Prompt Title *</label>
                <Input
                  placeholder="e.g., Tech Engineering Master Prompt"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="form-group">
                  <label>Target Position</label>
                  <Input
                    placeholder="e.g., Software Engineer, DevOps Engineer"
                    value={formData.target_position}
                    onChange={(e) => setFormData({ ...formData, target_position: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <Input
                  placeholder="Brief description of this prompt"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Prompt Text *</label>
                <textarea
                  placeholder="Enter the system prompt instructions..."
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-actions">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewPromptForm(false)
                    setEditingPrompt(null)
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      </div>
    </AdminLayout>
  )
}
