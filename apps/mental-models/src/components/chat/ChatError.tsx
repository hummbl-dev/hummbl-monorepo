// Chat Error Component - Better error handling and user guidance

import React from 'react';
import './ChatError.css';

interface ChatErrorProps {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ChatError: React.FC<ChatErrorProps> = ({
  error,
  onDismiss,
  onRetry,
  type = 'error',
}) => {
  const errorConfig = {
    error: {
      icon: '⚠️',
      bgColor: '#fee',
      borderColor: '#f88',
      textColor: '#c33',
    },
    warning: {
      icon: '⚡',
      bgColor: '#fff9e6',
      borderColor: '#ffa500',
      textColor: '#b8860b',
    },
    info: {
      icon: 'ℹ️',
      bgColor: '#e6f3ff',
      borderColor: '#4a9eff',
      textColor: '#0066cc',
    },
  };

  const config = errorConfig[type];

  const getErrorGuidance = (errorMessage: string): string | null => {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('api key') || lowerError.includes('authentication')) {
      return 'Please check your OpenAI API key in settings';
    }
    if (lowerError.includes('rate limit')) {
      return "You've hit the rate limit. Please wait a moment and try again";
    }
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'Check your internet connection';
    }
    if (lowerError.includes('timeout')) {
      return 'The request timed out. Please try again with a shorter question';
    }

    return null;
  };

  const guidance = getErrorGuidance(error);

  return (
    <div
      className="chat-error-container"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <div className="chat-error-content">
        <span className="chat-error-icon">{config.icon}</span>
        <div className="chat-error-text">
          <p style={{ color: config.textColor }}>{error}</p>
          {guidance && (
            <p className="chat-error-guidance" style={{ color: config.textColor }}>
              💡 {guidance}
            </p>
          )}
        </div>
      </div>

      <div className="chat-error-actions">
        {onRetry && (
          <button
            className="chat-error-retry"
            onClick={onRetry}
            style={{ backgroundColor: config.borderColor, color: 'white' }}
          >
            Retry
          </button>
        )}
        <button
          className="chat-error-dismiss"
          onClick={onDismiss}
          style={{ color: config.textColor }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
