// Chat storage service for persistent conversation management
// Migrated from hummbl-io with enhanced error handling and TypeScript strict mode

import { createLogger } from '../logger';
import type { ChatConversation, ChatSettings } from '../types/chat';

const logger = createLogger('chat-storage');

const STORAGE_KEYS = {
  CONVERSATIONS: 'hummbl-chat-conversations',
  CURRENT_CONVERSATION: 'hummbl-chat-current-conversation',
  SETTINGS: 'hummbl-chat-settings',
} as const;

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt:
    'You are a helpful AI assistant for exploring mental models and strategic thinking frameworks.',
  enableContext: true,
  enableStreaming: true,
};

export class ChatStorageService {
  // Load all conversations from localStorage
  loadConversations(): ChatConversation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map(this.validateConversation)
        .filter((conv): conv is ChatConversation => conv !== null);
    } catch (error) {
      logger.error('Failed to load conversations', { error });
      return [];
    }
  }

  // Save conversations to localStorage
  saveConversations(conversations: ChatConversation[]): void {
    try {
      const validConversations = conversations.filter(this.validateConversation);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(validConversations));
    } catch (error) {
      logger.error('Failed to save conversations', { error });
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Keep only the most recent conversations
        const recent = conversations.slice(-10);
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(recent));
      }
    }
  }

  // Load current conversation ID
  loadCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    } catch (error) {
      logger.error('Failed to load current conversation ID', { error });
      return null;
    }
  }

  // Save current conversation ID
  saveCurrentConversationId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, id);
    } catch (error) {
      logger.error('Failed to save current conversation ID', { error });
    }
  }

  // Load chat settings
  loadSettings(): ChatSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;

      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
      logger.error('Failed to load chat settings', { error });
      return DEFAULT_SETTINGS;
    }
  }

  // Save chat settings
  saveSettings(settings: ChatSettings): void {
    try {
      const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
    } catch (error) {
      logger.error('Failed to save chat settings', { error });
    }
  }

  // Clear all chat data
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      logger.error('Failed to clear chat data', { error });
    }
  }

  // Get storage usage statistics
  getStorageStats(): { used: number; available: number; conversations: number } {
    try {
      const used = Object.values(STORAGE_KEYS).reduce((total, key) => {
        const item = localStorage.getItem(key);
        return total + (item ? item.length : 0);
      }, 0);

      const conversations = this.loadConversations().length;

      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);

      return { used, available, conversations };
    } catch (error) {
      logger.error('Failed to get storage stats', { error });
      return { used: 0, available: 0, conversations: 0 };
    }
  }

  // Validate conversation structure
  private validateConversation = (conversation: any): ChatConversation | null => {
    if (!conversation || typeof conversation !== 'object') return null;

    const required = ['id', 'messages', 'createdAt', 'updatedAt'];
    if (!required.every(field => field in conversation)) return null;

    if (!Array.isArray(conversation.messages)) return null;

    return {
      id: String(conversation.id),
      messages: conversation.messages.filter(
        (msg: any) =>
          msg &&
          typeof msg === 'object' &&
          typeof msg.id === 'string' &&
          typeof msg.role === 'string' &&
          typeof msg.content === 'string' &&
          typeof msg.timestamp === 'number'
      ),
      createdAt: Number(conversation.createdAt),
      updatedAt: Number(conversation.updatedAt),
      title: conversation.title ? String(conversation.title) : undefined,
      settings: conversation.settings,
    };
  };
}

// Export singleton instance
export const chatStorage = new ChatStorageService();
