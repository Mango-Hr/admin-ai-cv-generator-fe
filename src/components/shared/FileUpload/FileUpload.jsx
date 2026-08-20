import { useState, useRef } from 'react'
import { Upload, X, File, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'
import './FileUpload.css'

/**
 * FileUpload component with drag & drop
 * Supports file validation, preview, and multiple files
 */
export default function FileUpload({
  accept,
  maxSize = 5, // MB
  maxFiles = 1,
  multiple = false,
  onUpload,
  onRemove,
  disabled = false,
  helpText,
  error,
  className = '',
}) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const inputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB`
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      const fileType = file.type

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        return fileType.match(new RegExp(type.replace('*', '.*')))
      })

      if (!isAccepted) {
        return `File type not accepted. Allowed: ${accept}`
      }
    }

    return null
  }

  const handleFiles = (newFiles) => {
    setUploadError(null)

    // Check max files
    if (files.length + newFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`)
      return
    }

    const validatedFiles = []
    for (const file of newFiles) {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }

      const fileWithPreview = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          fileWithPreview.preview = reader.result
          setFiles(prev => [...prev, fileWithPreview])
        }
        reader.readAsDataURL(file)
      } else {
        validatedFiles.push(fileWithPreview)
      }
    }

    if (validatedFiles.length > 0) {
      setFiles(prev => [...prev, ...validatedFiles])
    }

    // Call onUpload callback
    if (onUpload) {
      onUpload(newFiles)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)

    if (onRemove) {
      const removedFile = files.find(f => f.id === fileId)
      onRemove(removedFile)
    }
  }

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon size={20} />
    if (fileType.includes('pdf')) return <FileText size={20} />
    return <File size={20} />
  }

  const wrapperClasses = [
    'file-upload',
    isDragging && 'file-upload--dragging',
    disabled && 'file-upload--disabled',
    (error || uploadError) && 'file-upload--error',
    className,
  ].filter(Boolean).join(' ')

  const hasError = error || uploadError

  return (
    <div className={wrapperClasses}>
      {/* Dropzone */}
      <div
        className="file-upload__dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple || maxFiles > 1}
          onChange={handleInputChange}
          disabled={disabled}
          className="file-upload__input"
          aria-label="File upload input"
        />

        <div className="file-upload__icon">
          <Upload size={32} />
        </div>

        <div className="file-upload__text">
          <p className="file-upload__title">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="file-upload__subtitle">
            {accept && `Accepted: ${accept}`}
            {accept && maxSize && ' • '}
            {maxSize && `Max size: ${maxSize}MB`}
          </p>
        </div>
      </div>

      {/* Help text */}
      {!hasError && helpText && (
        <p className="file-upload__help">{helpText}</p>
      )}

      {/* Error message */}
      {hasError && (
        <div className="file-upload__error">
          <AlertCircle className="file-upload__error-icon" />
          <span>{error || uploadError}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="file-upload__files">
          {files.map((file) => (
            <div key={file.id} className="file-upload__file">
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="file-upload__preview"
                />
              ) : (
                <div className="file-upload__file-icon">
                  {getFileIcon(file.type)}
                </div>
              )}

              <div className="file-upload__file-info">
                <p className="file-upload__file-name">{file.name}</p>
                <p className="file-upload__file-size">{formatFileSize(file.size)}</p>
              </div>

              <button
                type="button"
                className="file-upload__remove"
                onClick={() => handleRemove(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
