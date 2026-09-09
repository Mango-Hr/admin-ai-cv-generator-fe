import axios from 'axios'

const BASE_URL = 'https://ai-cv-generator-be-production.up.railway.app/api/v1/admin'

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for non-auth endpoints
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * Create a new admin account
 */
export const createAdmin = async (userData) => {
  try {
    const response = await authApi.post('/auth/create-admin', {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      gender: userData.gender,
      role: 'sub_admin', // Currently creating as super_admin with full admin permissions
    })
    
    console.log('[createAdmin Response]', response.data.data) // Debug log
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Login admin user
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await authApi.post('/auth/login', {
      email,
      password,
    })
    
    const { access_token, ...adminData } = response.data.data
    
    console.log('[loginAdmin Response]', adminData) // Debug log
    
    // Store token and user data
    localStorage.setItem('admin_token', access_token)
    localStorage.setItem('admin_user', JSON.stringify(adminData))
    
    return adminData
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Get current admin profile
 */
export const getAdminProfile = async () => {
  try {
    const response = await authApi.get('/auth/profile')
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Logout admin user
 */
export const logoutAdmin = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}

/**
 * Check if user is authenticated
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('admin_token')
}

/**
 * Get stored admin user
 */
export const getStoredAdminUser = () => {
  const user = localStorage.getItem('admin_user')
  return user ? JSON.parse(user) : null
}

/**
 * Send invitation to a new admin
 * POST /api/v1/admin/invitations
 * Restricted to super_admin
 */
export const sendAdminInvitation = async (email, role) => {
  try {
    const response = await authApi.post('/invitations', {
      email,
      role,
    })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * List all admin invitations
 * GET /api/v1/admin/invitations
 * Restricted to super_admin
 */
export const listAdminInvitations = async () => {
  try {
    const response = await authApi.get('/invitations')
    return response.data.data || []
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Revoke an invitation
 * PATCH /api/v1/admin/invitations/{invitation_id}/revoke
 * Restricted to super_admin
 */
export const revokeAdminInvitation = async (invitationId) => {
  try {
    const response = await authApi.patch(`/invitations/${invitationId}/revoke`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Verify invitation token
 * GET /api/v1/admin/invitations/verify?token={token}
 * No authentication required
 */
export const verifyInvitationToken = async (token) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/invitations/verify?token=${encodeURIComponent(token)}`
    )
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Accept invitation
 * POST /api/v1/admin/invitations/accept
 * No authentication required
 */
export const acceptAdminInvitation = async (invitationData) => {
  try {
    const response = await axios.post(`${BASE_URL}/invitations/accept`, {
      token: invitationData.token,
      first_name: invitationData.first_name,
      last_name: invitationData.last_name,
      password: invitationData.password,
      phone: invitationData.phone,
      gender: invitationData.gender,
    })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Decline invitation
 * POST /api/v1/admin/invitations/decline
 * No authentication required
 */
export const declineAdminInvitation = async (invitationData) => {
  try {
    const response = await axios.post(`${BASE_URL}/invitations/decline`, {
      token: invitationData.token,
    })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

export default authApi
