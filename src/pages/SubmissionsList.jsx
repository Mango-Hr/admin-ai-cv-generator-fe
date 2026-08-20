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
import { formatDistanceToNow } from 'date-fns'
import AdminLayout from '../components/layout/AdminLayout'
import { Input } from '../components/shared/Input'
import { Select } from '../components/shared/Input'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import Skeleton from '../components/shared/Skeleton'
import EmptyState from '../components/shared/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { submissionsService, staffService } from '../services/mockData'
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
  const [staff, setStaff] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  
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
      const [submissionsData, staffData] = await Promise.all([
        submissionsService.getAll(),
        staffService.getAll(),
      ])
      
      setSubmissions(submissionsData)
      setStaff(staffData)
      
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
          s.clientName.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.id.toLowerCase().includes(search) ||
          s.targetRole.toLowerCase().includes(search) ||
          s.targetCompany.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status)
    }

    // Assigned filter
    if (filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(s => !s.assignedTo)
      } else {
        result = result.filter(s => s.assignedTo?.id === parseInt(filters.assignedTo))
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      await submissionsService.delete(id)
      toast.success('Submission deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete submission')
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
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
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
                  <th>ID</th>
                  <th>Target Role</th>
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
                          {submission.clientName}
                        </div>
                        <div className="table-cell-client__email">
                          {submission.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-id">{submission.id}</div>
                    </td>
                    <td>
                      <div className="table-cell-role">
                        <div className="table-cell-role__title">
                          {submission.targetRole}
                        </div>
                        <div className="table-cell-role__company">
                          {submission.targetCompany}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={submission.status}>{submission.status}</Badge>
                    </td>
                    <td>
                      {submission.assignedTo ? (
                        <div className="table-cell-assigned">
                          <div className="table-cell-assigned__names">
                            <div className="table-cell-assigned__name-bold">
                              {submission.assignedTo.name.split(' ')[0]}
                            </div>
                            <div className="table-cell-assigned__name-bold">
                              {submission.assignedTo.name.split(' ')[1] || ''}
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
                        {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={() => handleDelete(submission.id)}
                        />
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
    </AdminLayout>
  )
}

