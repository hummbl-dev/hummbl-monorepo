// Individual chat message component

import type { ChatMessage as ChatMessageType } from '../../../cascade/types/chat';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return null; // Don't display system messages
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
