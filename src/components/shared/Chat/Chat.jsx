import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, MessageCircle, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import chatService from '../../../services/chatService'
import './Chat.css'

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getInitials = (name) => {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'
}

export default function Chat({ submissionId, jwtToken, staffName = 'Support' }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [error, setError] = useState(null)
  const [readReceipt, setReadReceipt] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const unsubscribeMessageRef = useRef(null)
  const unsubscribeConnectionRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('[Chat] Initializing with submissionId:', submissionId, 'token present:', !!jwtToken)

        // Connect WebSocket
        await chatService.connect(submissionId, jwtToken)

        // Fetch message history
        const history = await chatService.fetchMessages(submissionId, jwtToken)
        console.log('[Chat] Loaded', history.length, 'messages')
        setMessages(history)

        // Mark as read
        await chatService.markMessagesAsRead(submissionId, jwtToken)

        // Subscribe to messages
        unsubscribeMessageRef.current = chatService.onMessage(handleWebSocketMessage)

        // Subscribe to connection changes
        unsubscribeConnectionRef.current = chatService.onConnectionChange(handleConnectionChange)

        setIsLoading(false)
      } catch (err) {
        console.error('[Chat] Initialization error:', err)
        const errorMessage = err.message || 'Failed to connect to chat'
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    initChat()

    // Cleanup on unmount
    return () => {
      if (unsubscribeMessageRef.current) unsubscribeMessageRef.current()
      if (unsubscribeConnectionRef.current) unsubscribeConnectionRef.current()
      chatService.disconnect()
    }
  }, [submissionId, jwtToken])

  const handleWebSocketMessage = useCallback((message) => {
    const { type, data } = message

    switch (type) {
      case 'new_message':
        setMessages(prev => [...prev, data])
        if (data.sender_type !== 'staff') {
          chatService.markMessagesAsRead(submissionId, jwtToken)
        }
        break

      case 'message_updated':
        setMessages(prev =>
          prev.map(msg => msg.id === data.id ? { ...msg, ...data } : msg)
        )
        break

      case 'message_deleted':
        setMessages(prev => prev.filter(msg => msg.id !== data.id))
        break

      case 'typing':
        if (data.sender_type !== 'staff') {
          setTypingUsers(prev => {
            if (data.is_typing) {
              return [...prev, data.sender_name]
            }
            return prev.filter(name => name !== data.sender_name)
          })
        }
        break

      case 'read_receipt':
        setReadReceipt(data)
        break

      default:
        break
    }
  }, [submissionId, jwtToken])

  const handleConnectionChange = useCallback((status) => {
    console.log('Connection status:', status)
    setIsConnected(status === 'connected')
    if (status === 'auth_failed') {
      setError('Authentication failed. Please log in again.')
    } else if (status === 'reconnect_failed') {
      setError('Failed to reconnect. Please refresh the page.')
    }
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() && selectedFiles.length === 0) {
      return
    }

    try {
      setIsSending(true)
      setError(null)

      await chatService.sendMessage(
        submissionId,
        jwtToken,
        inputMessage,
        selectedFiles.length > 0 ? selectedFiles : null
      )

      setInputMessage('')
      setSelectedFiles([])
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = (e) => {
    setInputMessage(e.target.value)

    // Send typing indicator
    chatService.sendTypingIndicator(true)

    // Debounce typing indicator off
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTypingIndicator(false)
    }, 1500)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="chat__loading">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="chat">
      {/* Header */}
      <div className="chat__header">
        <h3 className="chat__title">
          <MessageCircle size={20} style={{ display: 'inline-block', marginRight: '8px' }} />
          Chat with Client
        </h3>
        <div className="chat__status">
          <div className={`chat__status-indicator ${!isConnected ? 'chat__status-indicator--disconnected' : ''}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat__messages">
        {messages.length === 0 ? (
          <div className="chat__empty">
            <MessageCircle className="chat__empty-icon" />
            <p className="chat__empty-text">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  className={`chat__message ${msg.sender_type === 'staff' ? 'chat__message--own' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`chat__message-avatar ${msg.sender_type === 'staff' ? 'chat__message-avatar--staff' : ''}`}>
                    {getInitials(msg.sender_name)}
                  </div>

                  <div className="chat__message-content">
                    <div className="chat__message-header">
                      <span className="chat__message-sender">{msg.sender_name}</span>
                      <span className="chat__message-timestamp">{formatTime(msg.created_at)}</span>
                    </div>

                    <div className="chat__message-body">
                      {msg.message && (
                        <div className="chat__message-text">{msg.message}</div>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="chat__message-attachments">
                          {msg.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat__message-attachment"
                              download
                            >
                              <Paperclip className="chat__attachment-icon" />
                              <span className="chat__attachment-name">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {typingUsers.length > 0 && (
              <div className="chat__typing">
                <div className="chat__typing-dots">
                  <div className="chat__typing-dot" />
                  <div className="chat__typing-dot" />
                  <div className="chat__typing-dot" />
                </div>
                <span>{typingUsers.join(', ')} is typing...</span>
              </div>
            )}

            {readReceipt && (
              <div className="chat__typing">
                <span>{readReceipt.read_by_name || staffName} read all messages</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="chat__error">
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Connection Error:</strong> {error}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            <p>Check browser console (F12) for detailed error logs.</p>
            <p>Common issues:</p>
            <ul style={{ marginLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
              <li>Backend server not running</li>
              <li>Invalid JWT token</li>
              <li>CORS/WebSocket configuration issue</li>
              <li>Network connectivity problem</li>
            </ul>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat__input-area">
        {selectedFiles.length > 0 && (
          <div className="chat__file-preview">
            {selectedFiles.map((file, index) => (
              <div key={index} className="chat__file-item">
                <span className="chat__file-item-name" title={file.name}>
                  {file.name}
                </span>
                <span
                  className="chat__file-remove"
                  onClick={() => handleRemoveFile(index)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}

        <form className="chat__input-wrapper" onSubmit={handleSendMessage}>
          <div className="chat__input-field">
            <textarea
              className="chat__input-textarea"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleTyping}
              disabled={isSending || !isConnected}
              rows={1}
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
          </div>

          <div className="chat__input-actions">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="chat__file-input"
              onChange={handleFileSelect}
              disabled={isSending}
            />
            <button
              type="button"
              className="chat__file-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || !isConnected}
              title="Attach files"
            >
              <Paperclip size={18} />
            </button>

            <button
              type="submit"
              className="chat__send-button"
              disabled={isSending || !isConnected || (!inputMessage.trim() && selectedFiles.length === 0)}
              title="Send message"
            >
              {isSending ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
