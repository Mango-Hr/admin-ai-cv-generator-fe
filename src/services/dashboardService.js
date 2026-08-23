import authApi from './authService'

/**
 * Fetch dashboard stats
 * Returns scoped counts based on user role
 * super_admin → global counts
 * sub_admin → counts for their assigned submissions
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await authApi.get('/dashboard/stats')
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    console.error('Failed to fetch dashboard stats:', message)
    throw new Error(message)
  }
}

/**
 * Fetch recent submissions for dashboard
 * Paginated, filterable, searchable, and sortable
 */
export const fetchRecentSubmissions = async (options = {}) => {
  const {
    page = 1,
    limit = 5,
    search = '',
    status = '',
    assigned_to_id = '',
    sort_by = 'created_at',
    sort_order = 'desc',
  } = options

  try {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', limit)
    if (search) params.append('search', search)
    if (status) params.append('status', status)
    if (assigned_to_id) params.append('assigned_to_id', assigned_to_id)
    params.append('sort_by', sort_by)
    params.append('sort_order', sort_order)

    const response = await authApi.get(`/dashboard/recent-submissions?${params.toString()}`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    console.error('Failed to fetch recent submissions:', message)
    throw new Error(message)
  }
}

/**
 * Get total count of all submissions
 */
export const getTotalSubmissionsCount = async () => {
  try {
    const data = await fetchRecentSubmissions({ limit: 1 })
    return data.total || 0
  } catch (error) {
    console.error('Failed to get total submissions:', error)
    return 0
  }
}

/**
 * Get count of tasks (submissions assigned to current user)
 */
export const getMyTasksCount = async () => {
  try {
    const data = await fetchRecentSubmissions({ limit: 1, assigned_to_id: 'me' })
    return data.total || 0
  } catch (error) {
    console.error('Failed to get my tasks count:', error)
    return 0
  }
}
