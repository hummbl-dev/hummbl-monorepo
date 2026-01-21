// Chat types and interfaces for HUMMBL monorepo
// Migrated from hummbl-io with TypeScript strict mode compliance

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  context?: ChatContext;
  streaming?: boolean;
}

export interface ChatContext {
  mentalModels?: Base120Model[];
  narratives?: any[];
  currentView?: 'models' | 'narratives';
  selectedItem?: string;
  transformation?: 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
  settings?: ChatSettings;
}

export interface ChatState {
  isOpen: boolean;
  isLoading: boolean;
  currentConversation: ChatConversation | null;
  conversations: ChatConversation[];
  error: string | null;
  streamingResponse?: string;
  hasApiKey: boolean;
  showHistory: boolean;
  showSettings: boolean;
}

export interface ChatSettings {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableContext?: boolean;
  enableStreaming?: boolean;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: OpenAIUsage;
}

export interface OpenAIChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: string;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export interface ChatStorageService {
  loadConversations(): ChatConversation[];
  saveConversations(conversations: ChatConversation[]): void;
  loadCurrentConversationId(): string | null;
  saveCurrentConversationId(id: string): void;
  loadSettings(): ChatSettings;
  saveSettings(settings: ChatSettings): void;
}

export interface ChatService {
  sendMessage(message: string, conversationId: string, context?: ChatContext): Promise<string>;
  sendMessageStream(
    message: string,
    conversationId: string,
    callbacks: StreamCallbacks,
    context?: ChatContext
  ): Promise<void>;
  createConversation(title?: string): ChatConversation;
  deleteConversation(id: string): void;
  updateConversationTitle(id: string, title: string): void;
}

// Import Base120Model from core types
import type { Base120Model } from './models';
