import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import { Input } from '../components/shared/Input'
import { Select } from '../components/shared/Input'
import Button from '../components/shared/Button'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal/Modal'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { fetchSubmissions } from '../services/submissionsService'
import './SubmissionsList.css'

const ITEMS_PER_PAGE = 10

export default function SubmissionsList() {
  const { toast } = useToast()
  const { user } = useAuth()
  const isSubAdmin = user?.role === 'sub_admin'
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, submissionId: null, submissionName: '' })
  const [deletingId, setDeletingId] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    assignedTo: 'all',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchSubmissions()
      const submissionsData = data.submissions || []

      setSubmissions(submissionsData)
    } catch (error) {
      toast.error('Failed to load clients')
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

    // Assigned filter (main admin only)
    if (!isSubAdmin && filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(s => !s.assigned_to)
      } else {
        result = result.filter(s => s.assigned_to?.id === filters.assignedTo)
      }
    }

    setFilteredSubmissions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters()
  }, [submissions, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
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
      toast.success('Client deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete client')
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
            <h1 className="submissions-list__title">Clients</h1>
            <p className="submissions-list__subtitle">
              {isSubAdmin
                ? 'Clients assigned to you'
                : 'All clients and their tailoring activity'}
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

            {!isSubAdmin && (
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
            )}

            <div className="filter-group filter-group__clear">
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
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
              title={isSubAdmin ? 'No clients assigned to you yet' : 'No clients found'}
              description={isSubAdmin
                ? 'Clients assigned to you by the main admin will appear here'
                : 'Try adjusting your filters or search query'}
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
                  {!isSubAdmin && <th>Assigned To</th>}
                  <th>Added</th>
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
                    {!isSubAdmin && (
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
                    )}
                    <td>
                      <div className="table-cell-time">
                        {formatDistanceToNow(parseISO(submission.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-actions">
                        <Link to={`/admin/submissions/${submission.id}/tailor`} style={{ textDecoration: 'none' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Sparkles />}
                            title="Tailor Resume"
                          />
                        </Link>
                        <Link to={`/admin/submissions/${submission.id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye />}
                            title="View Client"
                          />
                        </Link>
                        {!isSubAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 />}
                            title="Delete"
                            onClick={() => handleDelete(submission.id, `${submission.client.first_name} ${submission.client.last_name}`)}
                          />
                        )}
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
                {filteredSubmissions.length} clients
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
        <ModalHeader title="Delete Client" onClose={() => setDeleteModal({ isOpen: false, submissionId: null, submissionName: '' })} />
        <ModalBody>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete <strong>{deleteModal.submissionName}</strong> and all their records? This action cannot be undone.
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
