import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

/**
 * Get prompt management dashboard statistics
 * @returns {Promise<Object>}
 */
export const getPromptStats = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_BASE_URL}/api/v1/admin/prompts/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to fetch prompt stats:', error)
    throw error
  }
}

/**
 * Get all prompts with optional filters
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
export const getPrompts = async (filters = {}) => {
  try {
    const token = localStorage.getItem('admin_token')
    const params = new URLSearchParams()

    if (filters.is_active !== undefined) params.append('is_active', filters.is_active)
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)

    const url = `${API_BASE_URL}/api/v1/admin/prompts${params.toString() ? '?' + params.toString() : ''}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to fetch prompts:', error)
    throw error
  }
}

/**
 * Create a new system prompt
 * @param {Object} promptData
 * @returns {Promise<Object>}
 */
export const createPrompt = async (promptData) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.post(`${API_BASE_URL}/api/v1/admin/prompts`, promptData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to create prompt:', error)
    throw error
  }
}

/**
 * Update a system prompt
 * @param {string} promptId
 * @param {Object} promptData
 * @returns {Promise<Object>}
 */
export const updatePrompt = async (promptId, promptData) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/prompts/${promptId}`,
      promptData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to update prompt:', error)
    throw error
  }
}

/**
 * Activate a prompt
 * @param {string} promptId
 * @returns {Promise<Object>}
 */
export const activatePrompt = async (promptId) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/admin/prompts/${promptId}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to activate prompt:', error)
    throw error
  }
}

/**
 * Deactivate a prompt
 * @param {string} promptId
 * @returns {Promise<Object>}
 */
export const deactivatePrompt = async (promptId) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/admin/prompts/${promptId}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[PromptService] Failed to deactivate prompt:', error)
    throw error
  }
}

/**
 * Delete a prompt
 * @param {string} promptId
 * @returns {Promise<void>}
 */
export const deletePrompt = async (promptId) => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('[PromptService] Failed to delete prompt:', error)
    throw error
  }
}
