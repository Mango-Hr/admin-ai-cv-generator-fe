/**
 * Build attachment proxy URL for admin side
 * @param {string} publicId - The attachment public_id from backend
 * @returns {string} Proxy URL for opening/downloading the attachment
 */
export const buildAdminAttachmentProxyUrl = (publicId) => {
  if (!publicId) return null
  return `/api/v1/admin/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
}

/**
 * Build attachment proxy URL for client side
 * @param {string} submissionId - The submission ID
 * @param {string} publicId - The attachment public_id from backend
 * @returns {string} Proxy URL for opening/downloading the attachment
 */
export const buildClientAttachmentProxyUrl = (submissionId, publicId) => {
  if (!publicId || !submissionId) return null
  return `/api/v1/public/submissions/${encodeURIComponent(submissionId)}/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
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
