// Chat window modal component

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatConversation } from '../../../cascade/types/chat';
import './ChatWindow.css';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ChatConversation | null;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  streamingResponse?: string;
  children?: React.ReactNode;
}

export function ChatWindow({
  isOpen,
  onClose,
  conversation,
  onSendMessage,
  isLoading,
  error,
  onOpenSettings,
  onOpenHistory,
  streamingResponse = '',
  children,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, streamingResponse]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape as any);
    return () => window.removeEventListener('keydown', handleEscape as any);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="chat-window-overlay" onClick={onClose}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <h3 className="chat-title">💬 HUMMBL AI Assistant</h3>
            <p className="chat-subtitle">Ask about mental models & narratives</p>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-icon-button"
              onClick={onOpenHistory}
              aria-label="View history"
              title="View conversation history"
            >
              📜
            </button>
            <button
              className="chat-icon-button"
              onClick={onOpenSettings}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙️
            </button>
            <button className="chat-close-button" onClick={onClose} aria-label="Close chat">
              ✕
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="chat-messages">
          {!conversation || conversation.messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="welcome-icon">🤖</div>
              <h4>Welcome to HUMMBL AI!</h4>
              <p>I can help you explore mental models and narratives.</p>
              <div className="suggested-prompts">
                <button onClick={() => onSendMessage('What mental models are available?')}>
                  What mental models are available?
                </button>
                <button onClick={() => onSendMessage('Explain first principles thinking')}>
                  Explain first principles thinking
                </button>
                <button onClick={() => onSendMessage('How do narratives work?')}>
                  How do narratives work?
                </button>
              </div>
            </div>
          ) : (
            <>
              {conversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {streamingResponse && (
                <ChatMessage
                  key="streaming"
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingResponse,
                    timestamp: Date.now(),
                  }}
                />
              )}
              {isLoading && !streamingResponse && (
                <div className="chat-loading">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              )}
              {error && <div className="chat-error">⚠️ {error}</div>}
              
              {/* Render children (model suggestions, errors, etc.) */}
              {children}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="chat-footer">
          <ChatInput
            onSend={onSendMessage}
            disabled={isLoading}
            placeholder="Ask anything about mental models..."
          />
        </div>
      </div>
    </div>
  );
}
