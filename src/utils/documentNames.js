/**
 * Helpers for classifying rendered documents (resume vs cover letter) and for
 * building download file names.
 *
 * Naming convention (product requirement): delivered files are named after the
 * client's first name, e.g. "Roland_Resume.pdf" / "Roland_Cover_Letter.docx".
 */

/**
 * Decide whether a rendered document is a resume or a cover letter.
 * Prefers an explicit document_type field from the server and falls back
 * to inspecting the file name.
 */
export function classifyDocument(doc) {
  const type = (doc.document_type || doc.doc_type || '').toLowerCase()
  if (type.includes('cover') || type.includes('letter')) return 'cover'
  if (type.includes('resume') || type.includes('cv')) return 'resume'

  const name = (doc.file_name || '').toLowerCase()
  if (name.includes('cover') || name.includes('letter')) return 'cover'
  return 'resume'
}

/**
 * Build a clean download file name, e.g. "Roland_Resume.pdf".
 * @param {Object} doc  - document record from the API
 * @param {'resume'|'cover'} kind
 * @param {string} firstName - client's first name
 */
export function buildDownloadName(doc, kind, firstName) {
  const ext = (doc.file_name || '').split('.').pop() || (doc.file_type === 'pdf' ? 'pdf' : 'docx')
  const label = kind === 'cover' ? 'Cover_Letter' : 'Resume'
  return `${firstName || 'Client'}_${label}.${ext}`
}
