// Chat Input component for message sending
// Migrated from hummbl-io with enhanced UX and TypeScript strict mode

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  ref?: React.RefObject<HTMLInputElement>;
}

export const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSendMessage, disabled = false, placeholder = 'Type your message...' }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [isComposing, setIsComposing] = useState(false);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent): void => {
      e.preventDefault();

      const trimmedValue = inputValue.trim();
      if (trimmedValue && !disabled && !isComposing) {
        onSendMessage(trimmedValue);
        setInputValue('');
      }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    // Focus input when not disabled
    useEffect(() => {
      if (!disabled && ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, [disabled, ref]);

    return (
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input"
            aria-label="Type your message"
            maxLength={2000}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || disabled || isComposing}
            className="chat-send-button"
            aria-label="Send message"
            title={disabled ? 'Disabled' : 'Send message (Enter)'}
          >
            {disabled ? '⏸️' : '➤'}
          </button>
        </div>

        {/* Character count */}
        <div className="chat-input-footer">
          <span className="chat-input-hint">Press Enter to send, Shift+Enter for new line</span>
          <span className="chat-input-count">{inputValue.length}/2000</span>
        </div>
      </form>
    );
  }
);

ChatInput.displayName = 'ChatInput';
