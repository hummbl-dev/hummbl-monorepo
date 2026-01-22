// Chat settings menu component

import { useState } from 'react';
import { conversationExport } from '../../services/conversationExport';
import type { ChatConversation } from '../../../cascade/types/chat';
import './ChatSettings.css';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onViewHistory: () => void;
  messageCount: number;
  conversationCount: number;
  currentConversation: ChatConversation | null;
}

export function ChatSettings({
  isOpen,
  onClose,
  onClearAll,
  onViewHistory,
  messageCount,
  conversationCount,
  currentConversation,
}: ChatSettingsProps) {
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (
      window.confirm(
        `Are you sure you want to delete all ${conversationCount} conversations? This cannot be undone.`
      )
    ) {
      onClearAll();
      onClose();
    }
  };

  const handleExportConversation = async (format: 'markdown' | 'text' | 'json') => {
    if (!currentConversation) {
      alert('No conversation to export');
      return;
    }

    setExporting(true);
    try {
      await conversationExport.downloadConversation(currentConversation, {
        format,
        includeTimestamp: true,
        includeMetadata: true,
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export conversation');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async (format: 'markdown' | 'text' | 'json') => {
    if (!currentConversation) return;

    setExporting(true);
    try {
      await conversationExport.copyToClipboard(currentConversation, format);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy to clipboard');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="chat-settings-overlay" onClick={onClose}>
      <div className="chat-settings" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h3>Chat Settings</h3>
          <button className="settings-close-button" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="settings-stats">
          <div className="stat-item">
            <span className="stat-label">Total Conversations</span>
            <span className="stat-value">{conversationCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Messages</span>
            <span className="stat-value">{messageCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button className="settings-action-button" onClick={onViewHistory}>
            <span className="action-icon">📜</span>
            <div className="action-content">
              <span className="action-title">View History</span>
              <span className="action-description">Browse past conversations</span>
            </div>
          </button>

          {/* Export Section */}
          {currentConversation && currentConversation.messages.length > 0 && (
            <>
              <div className="settings-section-header">
                <span>Export Current Conversation</span>
              </div>
              
              <div className="export-buttons">
                <button
                  className="export-button"
                  onClick={() => handleExportConversation('markdown')}
                  disabled={exporting}
                  title="Download as Markdown"
                >
                  <span className="export-icon">📄</span> Markdown
                </button>
                <button
                  className="export-button"
                  onClick={() => handleExportConversation('text')}
                  disabled={exporting}
                  title="Download as Text"
                >
                  <span className="export-icon">📝</span> Text
                </button>
                <button
                  className="export-button"
                  onClick={() => handleExportConversation('json')}
                  disabled={exporting}
                  title="Download as JSON"
                >
                  <span className="export-icon">🔧</span> JSON
                </button>
              </div>

              <div className="copy-buttons">
                <button
                  className="copy-button"
                  onClick={() => handleCopyToClipboard('markdown')}
                  disabled={exporting}
                >
                  📋 Copy Markdown
                </button>
                <button
                  className="copy-button"
                  onClick={() => handleCopyToClipboard('text')}
                  disabled={exporting}
                >
                  📋 Copy Text
                </button>
              </div>
            </>
          )}

          <button
            className="settings-action-button danger"
            onClick={handleClearAll}
            disabled={conversationCount === 0}
          >
            <span className="action-icon">🗑️</span>
            <div className="action-content">
              <span className="action-title">Clear All History</span>
              <span className="action-description">Delete all conversations</span>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="settings-info">
          <p>💾 Conversations are stored locally in your browser</p>
          <p>🔒 Your data never leaves your device</p>
        </div>
      </div>
    </div>
  );
}
