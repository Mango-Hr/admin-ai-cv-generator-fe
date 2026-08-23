import authApi from './authService'

/**
 * Fetch all staff members with analytics
 */
export const fetchStaffList = async () => {
  try {
    const response = await authApi.get('/staff')
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    console.error('Failed to fetch staff list:', message)
    throw new Error(message)
  }
}

/**
 * Create a new staff member
 */
export const createStaffMember = async (staffData) => {
  try {
    const response = await authApi.post('/staff', {
      first_name: staffData.first_name,
      last_name: staffData.last_name,
      email: staffData.email,
      password: staffData.password,
      role: staffData.role,
      phone: staffData.phone,
      gender: staffData.gender,
    })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Delete a staff member
 */
export const deleteStaffMember = async (staffId) => {
  try {
    const response = await authApi.delete(`/staff/${staffId}`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}
