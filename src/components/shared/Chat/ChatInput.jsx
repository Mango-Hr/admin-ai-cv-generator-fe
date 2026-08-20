import { useState, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import Button from '../Button'
import './Chat.css'

/**
 * ChatInput component
 * Text input with send button and file attachment
 */
export default function ChatInput({
  onSend,
  onFileAttach,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 2000,
  className = '',
}) {
  const [message, setMessage] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSend = () => {
    if (!message.trim() && !attachedFile) return

    onSend({
      message: message.trim(),
      attachment: attachedFile,
    })

    setMessage('')
    setAttachedFile(null)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setMessage(e.target.value)

    // Auto-expand textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
      if (onFileAttach) {
        onFileAttach(file)
      }
    }
  }

  const removeAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`chat-input ${className}`}>
      {/* Attached file preview */}
      {attachedFile && (
        <div className="chat-input__attachment-preview">
          <div className="chat-input__attachment-info">
            <Paperclip size={14} />
            <span>{attachedFile.name}</span>
          </div>
          <button
            className="chat-input__attachment-remove"
            onClick={removeAttachment}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="chat-input__row">
        {/* File attachment button */}
        <button
          className="chat-input__attach-btn"
          onClick={handleFileClick}
          disabled={disabled}
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="chat-input__file-input"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />

        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          className="chat-input__textarea"
          placeholder={placeholder}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
        />

        {/* Send button */}
        <Button
          variant="primary"
          size="sm"
          icon={<Send />}
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !attachedFile)}
          aria-label="Send message"
        />
      </div>
    </div>
  )
}
