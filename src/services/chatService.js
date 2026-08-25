/**
 * Chat Service - Admin Side
 * Handles WebSocket connections and REST API calls for real-time messaging
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

console.log('[ChatService] Initialized with API_BASE_URL:', API_BASE_URL)

class ChatService {
  constructor() {
    this.ws = null
    this.messageListeners = []
    this.connectionListeners = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.pingInterval = null
  }

  /**
   * Connect to WebSocket for real-time messaging
   * @param {string} submissionId - The submission ID
   * @param {string} jwtToken - The admin JWT token
   * @returns {Promise<void>}
   */
  connect(submissionId, jwtToken) {
    return new Promise((resolve, reject) => {
      try {
        if (!submissionId || !jwtToken) {
          const error = `Missing required parameters: submissionId=${submissionId}, jwtToken=${jwtToken ? 'present' : 'missing'}`
          console.error('[ChatService] Connection Error:', error)
          reject(new Error(error))
          return
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = API_BASE_URL.replace('https://', '').replace('http://', '').split('/')[0]
        const wsUrl = `${wsProtocol}//${host}/api/v1/admin/submissions/${submissionId}/ws?token=${jwtToken}`
        
        console.log('[ChatService] Connecting to:', wsUrl)
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('[ChatService] WebSocket connected successfully')
          this.reconnectAttempts = 0
          this.startPingInterval()
          this.notifyConnectionListeners('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('[ChatService] Message received:', data.event)
            this.handleMessage(data)
          } catch (error) {
            console.error('[ChatService] Error parsing WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('[ChatService] WebSocket error:', error)
          this.notifyConnectionListeners('error')
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log('[ChatService] WebSocket closed:', event.code, event.reason)
          this.stopPingInterval()
          this.notifyConnectionListeners('closed')

          // Handle reconnection based on close code
          if (event.code === 4001) {
            // Authentication failed - don't retry
            console.error('[ChatService] Authentication failed (code 4001)')
            this.notifyConnectionListeners('auth_failed')
          } else if (event.code !== 1000) {
            // Unexpected close - attempt reconnection
            console.warn('[ChatService] Unexpected close, attempting reconnection')
            this.attemptReconnect(submissionId, jwtToken)
          }
        }
      } catch (error) {
        console.error('[ChatService] Connection setup error:', error)
        reject(error)
      }
    })
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect(submissionId, jwtToken) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.notifyConnectionListeners('reconnect_failed')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect(submissionId, jwtToken).catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Send a ping to keep the connection alive
   */
  sendPing() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }))
    }
  }

  /**
   * Start ping interval to keep connection alive
   */
  startPingInterval() {
    this.stopPingInterval()
    this.pingInterval = setInterval(() => {
      this.sendPing()
    }, 45000) // Ping every 45 seconds
  }

  /**
   * Stop ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  /**
   * Send typing indicator
   * @param {boolean} isTyping - Whether user is typing
   */
  sendTypingIndicator(isTyping) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }))
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { event, data: eventData } = data

    switch (event) {
      case 'pong':
        // Pong response to keep-alive ping
        break

      case 'new_message':
        this.notifyMessageListeners({
          type: 'new_message',
          data: eventData
        })
        break

      case 'message_updated':
        this.notifyMessageListeners({
          type: 'message_updated',
          data: eventData
        })
        break

      case 'message_deleted':
        this.notifyMessageListeners({
          type: 'message_deleted',
          data: eventData
        })
        break

      case 'typing':
        this.notifyMessageListeners({
          type: 'typing',
          data: eventData
        })
        break

      case 'read_receipt':
        this.notifyMessageListeners({
          type: 'read_receipt',
          data: eventData
        })
        break

      case 'submission_status_changed':
        this.notifyMessageListeners({
          type: 'submission_status_changed',
          data: eventData
        })
        break

      case 'submission_assigned':
        this.notifyMessageListeners({
          type: 'submission_assigned',
          data: eventData
        })
        break

      default:
        console.warn('Unknown event type:', event)
    }
  }

  /**
   * Subscribe to message events
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  onMessage(listener) {
    this.messageListeners.push(listener)
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener)
    }
  }

  /**
   * Subscribe to connection events
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  onConnectionChange(listener) {
    this.connectionListeners.push(listener)
    
    // If already connected, notify immediately
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      listener('connected')
    }
    
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all message listeners
   */
  notifyMessageListeners(message) {
    this.messageListeners.forEach(listener => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in message listener:', error)
      }
    })
  }

  /**
   * Notify all connection listeners
   */
  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close(1000)
      this.ws = null
    }
  }

  /**
   * Fetch message history
   * @param {string} submissionId - The submission ID
   * @param {string} jwtToken - The admin JWT token
   * @returns {Promise<Array>} Array of messages
   */
  async fetchMessages(submissionId, jwtToken) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/messages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const result = await response.json()
      return result.data?.messages || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  /**
   * Send a message
   * @param {string} submissionId - The submission ID
   * @param {string} jwtToken - The admin JWT token
   * @param {string} message - Message content
   * @param {FileList} files - Files to attach (optional)
   * @returns {Promise<Object>} The sent message
   */
  async sendMessage(submissionId, jwtToken, message, files = null) {
    try {
      const formData = new FormData()

      if (message) {
        formData.append('message', message)
      }

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i])
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Edit a message
   * @param {string} submissionId - The submission ID
   * @param {string} messageId - The message ID
   * @param {string} jwtToken - The admin JWT token
   * @param {string} message - Updated message content
   * @returns {Promise<Object>} The updated message
   */
  async editMessage(submissionId, messageId, jwtToken, message) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to edit message: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }

  /**
   * Delete a message
   * @param {string} submissionId - The submission ID
   * @param {string} messageId - The message ID
   * @param {string} jwtToken - The admin JWT token
   * @returns {Promise<void>}
   */
  async deleteMessage(submissionId, messageId, jwtToken) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  /**
   * Mark messages as read
   * @param {string} submissionId - The submission ID
   * @param {string} jwtToken - The admin JWT token
   * @returns {Promise<void>}
   */
  async markMessagesAsRead(submissionId, jwtToken) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/submissions/${submissionId}/messages/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`)
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// Export singleton instance
export default new ChatService()
