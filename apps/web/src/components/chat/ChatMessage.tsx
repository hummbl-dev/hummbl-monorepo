// Chat Message component for individual message display
// Migrated from hummbl-io with enhanced styling and TypeScript strict mode

import React from 'react';
import type { ChatMessage as ChatMessageType } from '@hummbl/core/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isStreaming = message.streaming;

  return (
    <div
      className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'} ${isStreaming ? 'chat-message-streaming' : ''}`}
    >
      <div className="chat-message-content">
        {/* Message Header */}
        <div className="chat-message-header">
          <span className="chat-message-role">
            {isUser ? '👤 You' : isSystem ? '⚙️ System' : '🤖 Assistant'}
          </span>
          <span className="chat-message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Message Body */}
        <div className="chat-message-body">
          {isStreaming ? (
            <div className="chat-message-streaming-content">
              {message.content}
              <span className="chat-message-cursor">|</span>
            </div>
          ) : (
            <div className="chat-message-text">
              {message.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
