// Chat Settings component for configuration
// Migrated from hummbl-io with enhanced UX and TypeScript strict mode

import type { ChatSettings } from '@hummbl/core';

interface ChatSettingsProps {
  settings: ChatSettings;
  onUpdateSettings: (settings: Partial<ChatSettings>) => void;
  onClose: () => void;
}

export function ChatSettings({ onUpdateSettings, onClose }: ChatSettingsProps) {
  return (
    <div className="chat-settings-overlay">
      <div className="chat-settings">
        <div className="chat-settings-header">
          <h3>Chat Settings</h3>
          <button onClick={onClose} className="chat-settings-close">
            ✕
          </button>
        </div>
        <div className="chat-settings-content">
          <p>Settings panel coming soon...</p>
        </div>
      </div>
    </div>
  );
}
