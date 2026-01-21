// Conversation History component for chat management
// Migrated from hummbl-io with enhanced UX and TypeScript strict mode

import React from 'react';
import type { ChatConversation } from '@hummbl/core/types/chat';

interface ConversationHistoryProps {
  conversations: ChatConversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onClose,
}: ConversationHistoryProps) {
  return (
    <div className="chat-history-overlay">
      <div className="chat-history">
        <div className="chat-history-header">
          <h3>Conversation History</h3>
          <button onClick={onClose} className="chat-history-close">
            ✕
          </button>
        </div>
        <div className="chat-history-content">
          <p>History panel coming soon...</p>
        </div>
      </div>
    </div>
  );
}
