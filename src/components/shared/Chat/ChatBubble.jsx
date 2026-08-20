import { format } from 'date-fns'
import { File, Download } from 'lucide-react'
import { default as Avatar } from '../Avatar'
import './Chat.css'

/**
 * ChatBubble component
 * Message bubble for client ↔ admin chat
 */
export default function ChatBubble({
  sender = 'client', // 'client' | 'admin'
  senderName = 'User',
  senderAvatar,
  message,
  timestamp,
  attachment,
  className = '',
}) {
  const isClient = sender === 'client'
  const formattedTime = timestamp ? format(new Date(timestamp), 'h:mm a') : ''

  return (
    <div className={`chat-bubble ${isClient ? 'chat-bubble--client' : 'chat-bubble--admin'} ${className}`}>
      {/* Avatar (only for admin messages) */}
      {!isClient && (
        <Avatar
          src={senderAvatar}
          fallback={senderName}
          size="sm"
          className="chat-bubble__avatar"
        />
      )}

      <div className="chat-bubble__content-wrapper">
        {/* Sender name (only for admin messages) */}
        {!isClient && (
          <div className="chat-bubble__sender">{senderName}</div>
        )}

        {/* Message bubble */}
        <div className="chat-bubble__bubble">
          <div className="chat-bubble__message">{message}</div>

          {/* Attachment */}
          {attachment && (
            <div className="chat-bubble__attachment">
              <File size={16} className="chat-bubble__attachment-icon" />
              <span className="chat-bubble__attachment-name">{attachment.name}</span>
              <button className="chat-bubble__attachment-download" aria-label="Download attachment">
                <Download size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="chat-bubble__timestamp">{formattedTime}</div>
      </div>

      {/* Avatar (only for client messages) */}
      {isClient && (
        <Avatar
          src={senderAvatar}
          fallback={senderName}
          size="sm"
          className="chat-bubble__avatar"
        />
      )}
    </div>
  )
}
