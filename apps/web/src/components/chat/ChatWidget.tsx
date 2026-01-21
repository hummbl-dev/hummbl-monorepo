// Chat Widget component with streaming functionality
// Migrated from hummbl-io with enhanced Base120 integration and TypeScript strict mode

import { useState, useEffect, useRef } from 'react';
import { ChatWindow } from './ChatWindow';
import { ConversationHistory } from './ConversationHistory';
import { ChatSettings } from './ChatSettings';
import { ChatError } from './ChatError';
import { createStreamingService, chatStorage, contextBuilder } from '@hummbl/core';
import type {
  ChatConversation,
  ChatMessage,
  ChatContext,
  ChatSettings as ChatSettingsType,
  StreamCallbacks,
  Base120Model,
} from '@hummbl/core';

interface ChatWidgetProps {
  mentalModels?: Base120Model[];
  narratives?: any[];
  apiKey?: string;
  context?: ChatContext | null;
}

export function ChatWidget({
  mentalModels = [],
  narratives = [],
  apiKey: propApiKey,
  context: propContext,
}: ChatWidgetProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [settings, setSettings] = useState<ChatSettingsType>({});

  // Refs for streaming management
  const streamingRef = useRef<boolean>(false);
  const streamingServiceRef = useRef<ReturnType<typeof createStreamingService> | null>(null);

  // Initialize conversations and settings on mount
  useEffect(() => {
    const loadedConversations = chatStorage.loadConversations();
    setConversations(loadedConversations);

    const currentId = chatStorage.loadCurrentConversationId();
    if (currentId) {
      const existing = loadedConversations.find((c: ChatConversation) => c.id === currentId);
      if (existing) {
        setCurrentConversation(existing);
      }
    }

    const loadedSettings = chatStorage.loadSettings();
    setSettings(loadedSettings);
    setHasApiKey(!!loadedSettings.apiKey || !!propApiKey);

    // Initialize streaming service if API key is available
    const effectiveApiKey = loadedSettings.apiKey || propApiKey;
    if (effectiveApiKey) {
      streamingServiceRef.current = createStreamingService({
        apiKey: effectiveApiKey,
        model: loadedSettings.model,
        temperature: loadedSettings.temperature,
        maxTokens: loadedSettings.maxTokens,
      });
    }
  }, [propApiKey]);

  // Update streaming service when settings change
  useEffect(() => {
    const effectiveApiKey = settings.apiKey || propApiKey;
    if (effectiveApiKey && streamingServiceRef.current) {
      streamingServiceRef.current.updateConfig({
        apiKey: effectiveApiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      });
      setHasApiKey(true);
    } else if (effectiveApiKey && !streamingServiceRef.current) {
      streamingServiceRef.current = createStreamingService({
        apiKey: effectiveApiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      });
      setHasApiKey(true);
    } else {
      setHasApiKey(false);
    }
  }, [settings, propApiKey]);

  // Create new conversation
  const createNewConversation = (title?: string): ChatConversation => {
    const conversation: ChatConversation = {
      id: `conv_${Date.now()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      title: title || `Chat ${conversations.length + 1}`,
      settings,
    };

    return conversation;
  };

  // Send message with streaming
  const sendMessage = async (message: string): Promise<void> => {
    if (!hasApiKey || !streamingServiceRef.current) {
      setError('API key required to send messages');
      return;
    }

    // Create conversation if none exists
    let conversation = currentConversation;
    if (!conversation) {
      conversation = createNewConversation();
      setCurrentConversation(conversation);
      setConversations(prev => [...prev, conversation]);
      chatStorage.saveCurrentConversationId(conversation.id);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: Date.now(),
    };

    setCurrentConversation(updatedConversation);
    setIsLoading(true);
    setError(null);
    setStreamingResponse('');

    // Build context for AI
    const chatContext: ChatContext = {
      mentalModels,
      narratives,
      currentView: 'models',
      selectedItem: propContext?.selectedItem,
      transformation: propContext?.transformation,
    };

    const contextualPrompt = contextBuilder.buildContextualPrompt(chatContext);

    // Prepare messages for API
    const apiMessages = updatedConversation.messages.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Set up streaming callbacks
    const callbacks: StreamCallbacks = {
      onToken: (token: string) => {
        setStreamingResponse(prev => prev + token);
      },
      onComplete: () => {
        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: streamingResponse,
          timestamp: Date.now(),
        };

        const finalConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
          updatedAt: Date.now(),
        };

        setCurrentConversation(finalConversation);
        setConversations(prev =>
          prev.map(c => (c.id === finalConversation.id ? finalConversation : c))
        );
        chatStorage.saveConversations([...conversations, finalConversation]);

        setIsLoading(false);
        setStreamingResponse('');
        streamingRef.current = false;
      },
      onError: (error: Error) => {
        setError(error.message);
        setIsLoading(false);
        setStreamingResponse('');
        streamingRef.current = false;
      },
    };

    streamingRef.current = true;

    try {
      // Send streaming message
      await streamingServiceRef.current.sendMessageStream(apiMessages, contextualPrompt, callbacks);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  // Handle conversation selection
  const selectConversation = (conversationId: string): void => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      chatStorage.saveCurrentConversationId(conversationId);
      setShowHistory(false);
    }
  };

  // Handle conversation deletion
  const deleteConversation = (conversationId: string): void => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    chatStorage.saveConversations(updatedConversations);

    if (currentConversation?.id === conversationId) {
      const newConversation = updatedConversations[0] || null;
      setCurrentConversation(newConversation);
      chatStorage.saveCurrentConversationId(newConversation?.id || '');
    }
  };

  // Handle settings update
  const updateSettings = (newSettings: Partial<ChatSettingsType>): void => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    chatStorage.saveSettings(updatedSettings);
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  return (
    <div className="chat-widget">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button"
          aria-label="Open chat"
        >
          💬 Chat
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          conversation={currentConversation}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHistory={() => setShowHistory(true)}
          streamingResponse={streamingResponse}
        >
          {/* Error Display */}
          {error && <ChatError error={error} onClear={clearError} />}
        </ChatWindow>
      )}

      {/* Conversation History */}
      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Chat Settings */}
      {showSettings && (
        <ChatSettings
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
