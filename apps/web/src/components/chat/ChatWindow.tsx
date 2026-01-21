// Chat Window component for conversation display
// Migrated from hummbl-io with enhanced UI and TypeScript strict mode

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatConversation } from '@hummbl/core';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [streamingTimestamp, setStreamingTimestamp] = useState<number>(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, streamingResponse]);

  // Update streaming timestamp when streaming starts
  useEffect(() => {
    if (streamingResponse && streamingTimestamp === 0) {
      setStreamingTimestamp(Date.now());
    }
  }, [streamingResponse, streamingTimestamp]);

  // Focus input when window opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="chat-window-overlay">
      <div className="chat-window">
        {/* Header */}
        <div className="chat-window-header">
          <div className="chat-window-title">
            <h3>HUMMBL Assistant</h3>
            {conversation?.title && (
              <span className="chat-window-subtitle">{conversation.title}</span>
            )}
          </div>

          <div className="chat-window-controls">
            <button
              onClick={onOpenHistory}
              className="chat-control-button"
              aria-label="Conversation history"
              title="History"
            >
              📚
            </button>
            <button
              onClick={onOpenSettings}
              className="chat-control-button"
              aria-label="Chat settings"
              title="Settings"
            >
              ⚙️
            </button>
            <button
              onClick={onClose}
              className="chat-control-button"
              aria-label="Close chat"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="chat-messages-container">
          {conversation?.messages.length === 0 && !streamingResponse ? (
            <div className="chat-welcome-message">
              <div className="chat-welcome-icon">🤖</div>
              <h4>Welcome to HUMMBL Assistant!</h4>
              <p>
                I'm here to help you explore mental models and strategic thinking frameworks. Ask me
                about specific models, transformations, or how to apply them to your challenges.
              </p>
              <div className="chat-suggestions">
                <button
                  onClick={() => onSendMessage('What mental models can help with decision-making?')}
                  className="chat-suggestion-button"
                >
                  Decision-making models
                </button>
                <button
                  onClick={() => onSendMessage('Explain the P transformation')}
                  className="chat-suggestion-button"
                >
                  Perspective transformation
                </button>
                <button
                  onClick={() => onSendMessage('How can I use inversion thinking?')}
                  className="chat-suggestion-button"
                >
                  Inversion thinking
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Render messages */}
              {conversation?.messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Streaming response */}
              {streamingResponse && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingResponse,
                    timestamp: streamingTimestampRef.current,
                    streaming: true,
                  }}
                />
              )}

              {/* Loading indicator */}
              {isLoading && !streamingResponse && (
                <div className="chat-loading-indicator">
                  <div className="chat-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="chat-loading-text">Thinking...</span>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Display */}
        {children}

        {/* Input */}
        <div className="chat-input-container">
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={isLoading}
            ref={inputRef}
            placeholder="Ask about mental models..."
          />
        </div>
      </div>
    </div>
  );
}
