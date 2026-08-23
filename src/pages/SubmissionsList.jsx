import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import { Input } from '../components/shared/Input'
import { Select } from '../components/shared/Input'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { fetchSubmissions } from '../services/submissionsService'
import './SubmissionsList.css'

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status', icon: <FileStack />, count: 0 },
  { value: 'new', label: 'New', icon: <AlertCircle />, count: 0 },
  { value: 'in_progress', label: 'In Progress', icon: <Clock />, count: 0 },
  { value: 'review', label: 'Review', icon: <Filter />, count: 0 },
  { value: 'completed', label: 'Completed', icon: <CheckCircle2 />, count: 0 },
]

const ITEMS_PER_PAGE = 10

export default function SubmissionsList() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, submissionId: null, submissionName: '' })
  const [deletingId, setDeletingId] = useState(null)
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    assignedTo: 'all',
  })

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    new: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [submissions, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchSubmissions()
      const submissionsData = data.submissions || []
      
      setSubmissions(submissionsData)
      
      // Calculate status counts
      const counts = {
        all: submissionsData.length,
        new: submissionsData.filter(s => s.status === 'new').length,
        in_progress: submissionsData.filter(s => s.status === 'in_progress').length,
        review: submissionsData.filter(s => s.status === 'review').length,
        completed: submissionsData.filter(s => s.status === 'completed').length,
      }
      setStatusCounts(counts)
    } catch (error) {
      toast.error('Failed to load submissions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...submissions]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        s =>
          `${s.client.first_name} ${s.client.last_name}`.toLowerCase().includes(search) ||
          s.client.email.toLowerCase().includes(search) ||
          s.reference_id.toLowerCase().includes(search) ||
          s.target_position.toLowerCase().includes(search) ||
          (s.target_company?.toLowerCase() || '').includes(search)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status)
    }

    // Assigned filter
    if (filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(s => !s.assigned_to)
      } else {
        result = result.filter(s => s.assigned_to?.id === filters.assignedTo)
      }
    }

    setFilteredSubmissions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      assignedTo: 'all',
    })
  }

  const handleRefresh = () => {
    loadData()
    toast.success('Data refreshed')
  }

  const handleDelete = (submissionId, clientName) => {
    setDeleteModal({
      isOpen: true,
      submissionId,
      submissionName: clientName,
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.submissionId) return

    setDeletingId(deleteModal.submissionId)
    try {
      // TODO: Replace with actual API call
      // await deleteSubmission(deleteModal.submissionId)
      toast.success('Submission deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete submission')
      console.error(error)
    } finally {
      setDeletingId(null)
      setDeleteModal({ isOpen: false, submissionId: null, submissionName: '' })
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <AdminLayout>
      <div className="submissions-list">
        {/* Header */}
        <div className="submissions-list__header">
          <div className="submissions-list__title-section">
            <h1 className="submissions-list__title">Submissions</h1>
            <p className="submissions-list__subtitle">
              Manage all CV requests and track their progress
            </p>
          </div>
          <div className="submissions-list__actions">
            <Button
              variant="ghost"
              icon={<RefreshCw />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button variant="ghost" icon={<Download />}>
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="submissions-list__filters">
          <div className="submissions-list__filters-row">
            <div className="filter-group">
              <label className="filter-group__label">Search</label>
              <Input
                placeholder="Search by name, email, ID, role..."
                icon={<Search />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-group__label">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            <div className="filter-group">
              <label className="filter-group__label">Assigned To</label>
              <Select
                value={filters.assignedTo}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              >
                <option value="all">All Staff</option>
                <option value="unassigned">Unassigned</option>
                {submissions
                  .filter(s => s.assigned_to)
                  .map(s => s.assigned_to)
                  .filter((staff, index, self) => self.findIndex(s => s.id === staff.id) === index)
                  .map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="filter-group filter-group__clear">
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="submissions-list__stats">
          {STATUS_FILTERS.map((status) => (
            <div
              key={status.value}
              className={`stat-pill ${filters.status === status.value ? 'stat-pill--active' : ''}`}
              onClick={() => handleFilterChange('status', status.value)}
            >
              <span className="stat-pill__icon">{status.icon}</span>
              <span className="stat-pill__label">{status.label}</span>
              <span className="stat-pill__count">{statusCounts[status.value]}</span>
            </div>
          ))}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="submissions-list__loading">
            <Skeleton variant="table" rows={10} />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="submissions-list__empty">
            <EmptyState
              icon={<FileStack />}
              title="No submissions found"
              description="Try adjusting your filters or search query"
              action={
                <Button variant="primary" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : (
          <motion.div
            className="submissions-table-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <table className="submissions-data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Reference ID</th>
                  <th>Target Position</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="table-cell-client">
                        <div className="table-cell-client__name">
                          {submission.client.first_name} {submission.client.last_name}
                        </div>
                        <div className="table-cell-client__email">
                          {submission.client.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-id">{submission.reference_id}</div>
                    </td>
                    <td>
                      <div className="table-cell-role">
                        <div className="table-cell-role__title">
                          {submission.target_position}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-company">
                        {submission.target_company || '—'}
                      </div>
                    </td>
                    <td>
                      <Badge variant={submission.status}>{submission.status}</Badge>
                    </td>
                    <td>
                      {submission.assigned_to ? (
                        <div className="table-cell-assigned">
                          <div className="table-cell-assigned__names">
                            <div className="table-cell-assigned__name-bold">
                              {submission.assigned_to.first_name}
                            </div>
                            <div className="table-cell-assigned__name-bold">
                              {submission.assigned_to.last_name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-cell-time">
                        {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-actions">
                        <Link to={`/admin/submissions/${submission.id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye />}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="submissions-list__pagination">
              <div className="submissions-list__pagination-info">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} of{' '}
                {filteredSubmissions.length} submissions
              </div>
              <div className="submissions-list__pagination-controls">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                <span style={{ padding: '0 var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, submissionId: null, submissionName: '' })}
        size="sm"
      >
        <ModalHeader title="Delete Submission" onClose={() => setDeleteModal({ isOpen: false, submissionId: null, submissionName: '' })} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete this submission from <strong>{deleteModal.submissionName}</strong>? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ isOpen: false, submissionId: null, submissionName: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deletingId === deleteModal.submissionId}
            disabled={deletingId === deleteModal.submissionId}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </AdminLayout>
  )
}

