// Chat storage service using localStorage

import type { ChatConversation, ChatMessage } from '../types/chat';

const STORAGE_KEY = 'hummbl_chat_conversations';
const CURRENT_CONVERSATION_KEY = 'hummbl_current_conversation';

export class ChatStorageService {
  // Save all conversations
  saveConversations(conversations: ChatConversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  // Load all conversations
  loadConversations(): ChatConversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  // Save current conversation ID
  saveCurrentConversationId(id: string): void {
    try {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    } catch (error) {
      console.error('Failed to save current conversation ID:', error);
    }
  }

  // Load current conversation ID
  loadCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(CURRENT_CONVERSATION_KEY);
    } catch (error) {
      console.error('Failed to load current conversation ID:', error);
      return null;
    }
  }

  // Create new conversation
  createConversation(): ChatConversation {
    const now = Date.now();
    return {
      id: `conv_${now}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // Add message to conversation
  addMessage(
    conversation: ChatConversation,
    role: 'user' | 'assistant',
    content: string
  ): ChatConversation {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
    };

    return {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: Date.now(),
    };
  }

  // Clear all conversations
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  }
}

// Singleton instance
export const chatStorage = new ChatStorageService();
