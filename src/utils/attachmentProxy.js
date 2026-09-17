const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

/**
 * Build attachment proxy URL for admin side
 * @param {string} publicId - The attachment public_id from backend
 * @returns {string} Full proxy URL pointing at the backend
 */
export const buildAdminAttachmentProxyUrl = (publicId) => {
  if (!publicId) return null
  return `${API_BASE_URL}/api/v1/admin/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
}

/**
 * Fetch an attachment as a blob with auth headers.
 * @param {string} proxyUrl - The proxy URL to fetch from
 * @param {string} token - The JWT auth token
 * @returns {Promise<Blob>} The file as a Blob
 */
async function fetchAttachmentBlob(proxyUrl, token) {
  const response = await fetch(proxyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load attachment: ${response.status}`)
  }

  return response.blob()
}

/**
 * Open an attachment in a new tab by fetching it as a blob first
 * (the proxy endpoint requires an auth header, so we can't use a direct URL).
 *
 * @param {string} publicId - The attachment public_id from backend
 * @param {string} [token] - Optional JWT token; falls back to localStorage 'admin_token'
 */
export async function openAttachment(publicId, token) {
  const proxyUrl = buildAdminAttachmentProxyUrl(publicId)
  if (!proxyUrl) return

  const authToken = token || localStorage.getItem('admin_token')
  if (!authToken) {
    console.error('[AttachmentProxy] No auth token available')
    return
  }

  try {
    const blob = await fetchAttachmentBlob(proxyUrl, authToken)
    const objectUrl = URL.createObjectURL(blob)
    window.open(objectUrl, '_blank')
    // Revoke after a short delay to allow the browser to open it
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch (error) {
    console.error('[AttachmentProxy] Failed to open attachment:', error)
  }
}

/**
 * Download an attachment by fetching it as a blob and triggering a download.
 *
 * @param {string} publicId - The attachment public_id from backend
 * @param {string} [fileName] - Optional filename; extracted from public_id if omitted
 * @param {string} [token] - Optional JWT token; falls back to localStorage 'admin_token'
 */
export async function downloadAttachment(publicId, fileName, token) {
  const proxyUrl = buildAdminAttachmentProxyUrl(publicId)
  if (!proxyUrl) return

  const authToken = token || localStorage.getItem('admin_token')
  if (!authToken) {
    console.error('[AttachmentProxy] No auth token available')
    return
  }

  try {
    const blob = await fetchAttachmentBlob(proxyUrl, authToken)
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName || publicId.split('/').pop()
    a.click()
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('[AttachmentProxy] Failed to download attachment:', error)
  }
}

/**
 * Build attachment proxy URL for client side
 * @param {string} submissionId - The submission ID
 * @param {string} publicId - The attachment public_id from backend
 * @returns {string} Full proxy URL pointing at the backend
 */
export const buildClientAttachmentProxyUrl = (submissionId, publicId) => {
  if (!publicId || !submissionId) return null
  return `${API_BASE_URL}/api/v1/public/submissions/${encodeURIComponent(submissionId)}/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
}

/**
 * Get the attachment proxy URL based on context
 * @param {Object} attachment - Attachment object with public_id and other fields
 * @param {string} context - Either 'admin' or 'client'
 * @param {string} submissionId - Required for client context
 * @returns {string} Proxy URL
 */
export const getAttachmentProxyUrl = (attachment, context = 'admin', submissionId = null) => {
  if (!attachment || !attachment.public_id) return null
  
  if (context === 'client') {
    return buildClientAttachmentProxyUrl(submissionId, attachment.public_id)
  }
  
  return buildAdminAttachmentProxyUrl(attachment.public_id)
}
