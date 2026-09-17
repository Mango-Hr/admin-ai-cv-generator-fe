const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

/**
 * MIME types for common Cloudinary resource formats.
 */
const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

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
 * Extract a filename from a Cloudinary public_id.
 * e.g. "ai_cv_generator/chat_attachments/stream_j964ly" → "stream_j964ly"
 * e.g. "ai_cv_generator/chat_attachments/my_resume.pdf" → "my_resume.pdf"
 */
function filenameFromPublicId(publicId) {
  if (!publicId) return null
  const parts = publicId.split('/')
  return parts[parts.length - 1] || null
}

/**
 * Parse a filename from a Content-Disposition header value.
 * e.g. "attachment; filename=\"report.pdf\"" → "report.pdf"
 */
function filenameFromContentDisposition(header) {
  if (!header) return null
  const match = header.match(/filename\*?=(?:UTF-8''|"?)([^"\s;]+)/i)
  return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null
}

/**
 * Fetch an attachment as a blob with auth headers.
 * Returns the blob plus any filename discovered from the response.
 *
 * @param {string} proxyUrl - The proxy URL to fetch from
 * @param {string} token - The JWT auth token
 * @param {string} [format] - Optional file format from the attachment object (e.g. 'pdf', 'docx')
 * @returns {Promise<{ blob: Blob, fileName: string|null }>} The blob and inferred filename
 */
async function fetchAttachmentBlob(proxyUrl, token, format) {
  const response = await fetch(proxyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load attachment: ${response.status}`)
  }

  const rawBlob = await response.blob()

  // If the server returned text/html (error page) or no useful content-type,
  // and we know the real format, re-wrap the blob with the correct MIME type.
  const serverType = response.headers.get('content-type') || ''
  const knownMime = format && MIME_TYPES[format.toLowerCase()]
  const blob = (knownMime && !serverType.includes(knownMime))
    ? new Blob([rawBlob], { type: knownMime })
    : rawBlob

  // Try to extract a filename from the Content-Disposition header
  const cd = response.headers.get('content-disposition')
  const headerName = filenameFromContentDisposition(cd)

  return { blob, fileName: headerName }
}

/**
 * Open an attachment for viewing.
 * For PDFs and images: opens in a full-screen overlay so the browser renders it natively.
 * For other files (docx, etc): falls back to download since browsers can't display them.
 *
 * @param {string} publicId - The attachment public_id from backend
 * @param {string} [format] - Optional file format from attachment (e.g. 'pdf')
 * @param {string} [token] - Optional JWT token; falls back to localStorage 'admin_token'
 */
export async function openAttachment(publicId, format, token) {
  const proxyUrl = buildAdminAttachmentProxyUrl(publicId)
  if (!proxyUrl) return

  const authToken = token || localStorage.getItem('admin_token')
  if (!authToken) {
    console.error('[AttachmentProxy] No auth token available')
    return
  }

  try {
    const { blob } = await fetchAttachmentBlob(proxyUrl, authToken, format)
    const objectUrl = URL.createObjectURL(blob)
    const ext = (format || '').toLowerCase()

    // PDFs and images can be rendered natively — use an overlay for best UX
    if (ext === 'pdf' || MIME_TYPES[ext]?.startsWith('image/')) {
      openInOverlay(objectUrl, ext)
    } else {
      // Other formats: download directly since browsers can't display them
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filenameFromPublicId(publicId) || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    }
  } catch (error) {
    console.error('[AttachmentProxy] Failed to open attachment:', error)
  }
}

/**
 * Render a blob URL in a full-screen overlay (iframe for PDFs, img for images).
 */
function openInOverlay(objectUrl, ext) {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  })

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '\u2715 Close'
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 16px',
    background: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: '1',
  })
  closeBtn.onclick = () => {
    document.body.removeChild(overlay)
    URL.revokeObjectURL(objectUrl)
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay)
      URL.revokeObjectURL(objectUrl)
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)

  if (ext === 'pdf') {
    const iframe = document.createElement('iframe')
    iframe.src = objectUrl
    Object.assign(iframe.style, {
      width: '90vw',
      height: '90vh',
      border: 'none',
      borderRadius: '8px',
      background: 'white',
    })
    overlay.appendChild(closeBtn)
    overlay.appendChild(iframe)
  } else {
    const img = document.createElement('img')
    img.src = objectUrl
    Object.assign(img.style, {
      maxWidth: '90vw',
      maxHeight: '85vh',
      borderRadius: '8px',
      objectFit: 'contain',
    })
    overlay.appendChild(closeBtn)
    overlay.appendChild(img)
  }

  document.body.appendChild(overlay)
}

/**
 * Download an attachment by fetching it as a blob and triggering a download.
 * Filename priority: explicit fileName param → Content-Disposition header → public_id fallback.
 *
 * @param {string} publicId - The attachment public_id from backend
 * @param {string} [fileName] - Optional filename; extracted from public_id if omitted
 * @param {string} [format] - Optional file format from attachment (e.g. 'pdf')
 * @param {string} [token] - Optional JWT token; falls back to localStorage 'admin_token'
 */
export async function downloadAttachment(publicId, fileName, format, token) {
  const proxyUrl = buildAdminAttachmentProxyUrl(publicId)
  if (!proxyUrl) return

  const authToken = token || localStorage.getItem('admin_token')
  if (!authToken) {
    console.error('[AttachmentProxy] No auth token available')
    return
  }

  try {
    const { blob, fileName: headerFileName } = await fetchAttachmentBlob(proxyUrl, authToken, format)
    // Pick best available name: explicit param → header → last segment of public_id
    let downloadName = fileName || headerFileName || filenameFromPublicId(publicId) || 'download'

    // Ensure the file has the correct extension
    if (format && !downloadName.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
      downloadName = `${downloadName}.${format.toLowerCase()}`
    }

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
