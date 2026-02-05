// Chat types and interfaces

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  context?: ChatContext;
}

export interface ChatContext {
  mentalModels?: any[];
  narratives?: any[];
  currentView?: 'models' | 'narratives';
  selectedItem?: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

export interface ChatState {
  isOpen: boolean;
  isLoading: boolean;
  currentConversation: ChatConversation | null;
  conversations: ChatConversation[];
  error: string | null;
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
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
