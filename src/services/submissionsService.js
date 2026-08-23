import authApi from './authService'

/**
 * Fetch all submissions
 * Super_admin gets ALL submissions
 * Sub_admin gets ONLY assigned submissions
 */
export const fetchSubmissions = async () => {
  try {
    const response = await authApi.get('/submissions')
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Get count of new submissions
 */
export const getNewSubmissionsCount = async () => {
  try {
    const data = await fetchSubmissions()
    const submissions = data.submissions || []
    return submissions.filter(s => s.status === 'new').length
  } catch (error) {
    console.error('Failed to get new submissions count:', error)
    return 0
  }
}

/**
 * Fetch single submission by ID
 */
export const fetchSubmissionById = async (id) => {
  try {
    const response = await authApi.get(`/submissions/${id}`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (id, status) => {
  try {
    const response = await authApi.patch(`/submissions/${id}`, { status })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Assign submission to staff
 */
export const assignSubmission = async (id, staffId) => {
  try {
    const response = await authApi.patch(`/submissions/${id}/assign`, { assigned_to_id: staffId })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}
