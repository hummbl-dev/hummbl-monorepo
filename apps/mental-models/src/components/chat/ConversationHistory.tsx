// Conversation history sidebar component

import type { ChatConversation } from '../../../cascade/types/chat';
import './ConversationHistory.css';

interface ConversationHistoryProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onClose,
}: ConversationHistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getConversationPreview = (conversation: ChatConversation) => {
    if (conversation.messages.length === 0) {
      return 'New conversation';
    }
    const firstUserMessage = conversation.messages.find((m) => m.role === 'user');
    return firstUserMessage?.content.substring(0, 50) || 'Empty conversation';
  };

  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="conversation-history-overlay" onClick={onClose}>
      <div className="conversation-history" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-header">
          <h3>Chat History</h3>
          <button className="history-close-button" onClick={onClose} aria-label="Close history">
            ✕
          </button>
        </div>

        {/* New Conversation Button */}
        <button className="new-conversation-button" onClick={onNewConversation}>
          <span className="button-icon">➕</span>
          New Conversation
        </button>

        {/* Conversation List */}
        <div className="conversation-list">
          {sortedConversations.length === 0 ? (
            <div className="empty-history">
              <p>No conversations yet</p>
              <p className="empty-subtitle">Start chatting to see your history</p>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  conversation.id === currentConversationId ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="conversation-content">
                  <div className="conversation-preview">{getConversationPreview(conversation)}</div>
                  <div className="conversation-meta">
                    <span className="conversation-date">{formatDate(conversation.updatedAt)}</span>
                    <span className="conversation-count">
                      {conversation.messages.length} messages
                    </span>
                  </div>
                </div>
                <button
                  className="delete-conversation-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation?')) {
                      onDeleteConversation(conversation.id);
                    }
                  }}
                  aria-label="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
