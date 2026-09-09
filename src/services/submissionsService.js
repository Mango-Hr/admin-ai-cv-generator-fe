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
    const response = await authApi.patch(`/submissions/${id}/status`, { status })
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

/**
 * Unassign submission from staff
 */
export const unassignSubmission = async (id) => {
  try {
    const response = await authApi.patch(`/submissions/${id}/unassign`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Delete a submission
 */
export const deleteSubmission = async (id) => {
  try {
    const response = await authApi.delete(`/submissions/${id}`)
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.message || error.message
    throw new Error(message)
  }
}

// ------------------------------------------------------------------
// v3 — Tailor Resume workflow
// ------------------------------------------------------------------

/**
 * Save the candidate's plain-text resume permanently on the submission.
 * Called once per submission (or again when the resume changes).
 * PATCH /submissions/{id}/resume-text
 */
export const saveResumeText = async (submissionId, savedResumeText) => {
  try {
    const response = await authApi.patch(
      `/submissions/${submissionId}/resume-text`,
      { saved_resume_text: savedResumeText }
    )
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Update or clear the job description for the current tailoring cycle.
 * Pass null or empty string to clear after clicking Done.
 * PATCH /submissions/{id}/job-description
 */
export const updateJobDescription = async (submissionId, jobDescription) => {
  try {
    const response = await authApi.patch(
      `/submissions/${submissionId}/job-description`,
      { job_description: jobDescription || null }
    )
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * One-click Tailor Resume — generates CV + cover letter, renders 4 files,
 * uploads to Cloudinary, returns all download links.
 * POST /submissions/{id}/tailor
 */
export const tailorResume = async (submissionId, params = {}) => {
  try {
    const payload = {
      provider: params.provider || 'openai',
      model: params.model || null,
      prompt_id: params.prompt_id || null,
      custom_instructions: params.custom_instructions || null,
      include_chat_history: params.include_chat_history !== undefined ? params.include_chat_history : true,
    }

    const response = await authApi.post(
      `/submissions/${submissionId}/tailor`,
      payload
    )
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    const status = error.response?.status
    const err = new Error(message)
    err.status = status
    throw err
  }
}

/**
 * Get available AI models for the Tailor Resume dropdown.
 * GET /ai/models
 */
export const getAvailableModels = async () => {
  try {
    const response = await authApi.get('/ai/models')
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Request a password reset magic link.
 * POST /auth/forgot-password — always returns 200 (no enumeration).
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await authApi.post('/auth/forgot-password', { email })
    return response.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Submit a new password with a magic-link token.
 * POST /auth/reset-password — returns fresh access_token.
 */
export const submitPasswordReset = async (token, newPassword) => {
  try {
    const response = await authApi.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    })
    return response.data.data
  } catch (error) {
    const message = error.response?.data?.detail?.message || error.response?.data?.message || error.message
    throw new Error(message)
  }
}

/**
 * Get available prompts for the Tailor Resume prompt selector.
 * Fetches active prompts only for the dropdown.
 * GET /prompts?is_active=true
 */
export const getAvailablePrompts = async () => {
  try {
    const response = await authApi.get('/prompts?is_active=true')
    let prompts = response.data.data || []
    
    // Handle different response structures
    if (prompts && typeof prompts === 'object' && !Array.isArray(prompts)) {
      prompts = prompts.prompts || prompts.data || []
    }
    
    // Ensure prompts is an array
    return Array.isArray(prompts) ? prompts : []
  } catch (error) {
    console.error('Failed to fetch available prompts:', error)
    return []
  }
}
