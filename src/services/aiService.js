import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

/**
 * Trigger AI generation for a submission
 * @param {string} submissionId
 * @param {Object} generationParams
 * @returns {Promise<Object>}
 */
export const triggerAIGeneration = async (submissionId, generationParams = {}) => {
  try {
    const token = localStorage.getItem('admin_token')
    const payload = {
      provider: generationParams.provider || 'openai',
      model: generationParams.model || 'gpt-4o',
      include_chat_history: generationParams.include_chat_history !== undefined ? generationParams.include_chat_history : true,
    }

    // Only add optional fields if they have values
    if (generationParams.prompt_id !== undefined && generationParams.prompt_id !== 'auto') {
      payload.prompt_id = generationParams.prompt_id
    } else {
      payload.prompt_id = null
    }

    if (generationParams.custom_instructions) {
      payload.custom_instructions = generationParams.custom_instructions
    } else {
      payload.custom_instructions = null
    }

    console.log('[AIService] Sending payload to backend:', JSON.stringify(payload, null, 2))

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/generate`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[AIService] Failed to trigger AI generation:', error)
    if (error.response) {
      console.error('[AIService] Response status:', error.response.status)
      console.error('[AIService] Response data:', error.response.data)
    }
    throw error
  }
}

/**
 * Get AI generation history for a submission
 * @param {string} submissionId
 * @returns {Promise<Array>}
 */
export const getGenerationHistory = async (submissionId) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/generations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[AIService] Failed to fetch generation history:', error)
    throw error
  }
}

/**
 * Render documents (PDF/DOCX) from AI generation
 * @param {string} submissionId
 * @param {string} aiGenerationId
 * @param {Array} formats - ['pdf', 'docx']
 * @returns {Promise<Array>}
 */
export const renderDocuments = async (submissionId, aiGenerationId, formats = ['pdf', 'docx']) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/documents/render`,
      {
        ai_generation_id: aiGenerationId,
        formats,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[AIService] Failed to render documents:', error)
    throw error
  }
}

/**
 * Get submission documents
 * @param {string} submissionId
 * @returns {Promise<Array>}
 */
export const getSubmissionDocuments = async (submissionId) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/documents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('[AIService] Failed to fetch documents:', error)
    throw error
  }
}

/**
 * Download document binary file
 * @param {string} submissionId
 * @param {string} documentId
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export const downloadDocument = async (submissionId, documentId, fileName) => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    )

    // Create blob and trigger download
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', fileName || 'document')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('[AIService] Failed to download document:', error)
    throw error
  }
}

/**
 * Format token info for display
 * @param {Object} tokens
 * @returns {string}
 */
export const formatTokenInfo = (tokens) => {
  if (!tokens) return 'N/A'
  return `${tokens.total_tokens} (in: ${tokens.input_tokens} / out: ${tokens.output_tokens})`
}

/**
 * Format cost for display
 * @param {number} cost
 * @returns {string}
 */
export const formatCost = (cost) => {
  return `$${cost.toFixed(4)}`
}
