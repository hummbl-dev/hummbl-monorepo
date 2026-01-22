// Floating chat widget component

import React, { useState, useEffect, useRef } from 'react';
import { ChatWindow } from './ChatWindow';
import { ConversationHistory } from './ConversationHistory';
import { ChatSettings } from './ChatSettings';
import { ModelSuggestions } from './ModelSuggestions';
import { ChatError } from './ChatError';
import { getOpenAIService } from '../../services/openaiService';
import { getStreamingService } from '../../services/openaiStreamingService';
import { getContextualBuilder } from '../../services/contextualPromptBuilder';
import { chatStorage } from '../../services/chatStorageService';
import type { ChatConversation } from '../../../cascade/types/chat';
import type { ChatContext } from '../../../cascade/types/chatContext';
import type { MentalModel } from '../../../cascade/types/mental-model';
import type { ConversationAnalysis } from '../../services/contextualPromptBuilder';
import { buildContextDescription } from '../../../cascade/types/chatContext';
import './ChatWidget.css';
interface ChatWidgetProps {
  mentalModels?: MentalModel[];
  narratives?: any[];
  apiKey?: string;
  context?: ChatContext | null;
}

export function ChatWidget({ mentalModels, narratives, apiKey, context }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const streamingRef = useRef<boolean>(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize conversations on mount
  useEffect(() => {
    const loadedConversations = chatStorage.loadConversations();
    setConversations(loadedConversations);

    const currentId = chatStorage.loadCurrentConversationId();

    if (currentId) {
      const existing = loadedConversations.find((c) => c.id === currentId);
      if (existing) {
        setConversation(existing);
        analyzeConversationAsync(existing);
        return;
      }
    }

    // Create new conversation
    const newConv = chatStorage.createConversation();
    setConversation(newConv);
    setConversations([newConv]);
    chatStorage.saveCurrentConversationId(newConv.id);
    chatStorage.saveConversations([newConv]);
  }, [mentalModels]);

  // Analyze conversation for model suggestions
  const analyzeConversationAsync = React.useCallback(async (conv: ChatConversation) => {
    if (!mentalModels || mentalModels.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const contextualBuilder = getContextualBuilder(mentalModels as MentalModel[]);
      const analysis = contextualBuilder.analyzeConversation(conv);
      setConversationAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [mentalModels]);

  // Check for API key
  useEffect(() => {
    if (apiKey) {
      setHasApiKey(true);
      getOpenAIService(apiKey);
    }
  }, [apiKey]);

  // Conversation management functions
  const handleSelectConversation = (id: string) => {
    const selected = conversations.find((c) => c.id === id);
    if (selected) {
      setConversation(selected);
      chatStorage.saveCurrentConversationId(id);
      setShowHistory(false);
      setIsOpen(true);
    }
  };

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    chatStorage.saveConversations(updated);

    // If deleting current conversation, create a new one
    if (conversation?.id === id) {
      const newConv = chatStorage.createConversation();
      setConversation(newConv);
      setConversations([...updated, newConv]);
      chatStorage.saveCurrentConversationId(newConv.id);
      chatStorage.saveConversations([...updated, newConv]);
    }
  };

  const handleNewConversation = () => {
    const newConv = chatStorage.createConversation();
    setConversation(newConv);
    const updated = [...conversations, newConv];
    setConversations(updated);
    chatStorage.saveCurrentConversationId(newConv.id);
    chatStorage.saveConversations(updated);
    setShowHistory(false);
    setIsOpen(true);
  };

  const handleClearAll = () => {
    chatStorage.clearAll();
    const newConv = chatStorage.createConversation();
    setConversation(newConv);
    setConversations([newConv]);
    chatStorage.saveCurrentConversationId(newConv.id);
    chatStorage.saveConversations([newConv]);
  };

  const getTotalMessageCount = () => {
    return conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  };

  const handleSendMessage = async (message: string) => {
    if (!conversation || !hasApiKey) {
      setError('OpenAI API key not configured');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    setIsLoading(true);
    setStreamingResponse('');
    streamingRef.current = true;

    try {
      // Add user message
      const updatedConv = chatStorage.addMessage(conversation, 'user', message);
      setConversation(updatedConv);

      // Build system context with current view context
      const openAI = getOpenAIService();
      const contextDescription = buildContextDescription(context || null);
      const systemContext = openAI.buildSystemContext(mentalModels, narratives, contextDescription);

      // Prepare messages for API
      const apiMessages = updatedConv.messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Use streaming service
      const streamingService = getStreamingService(apiKey);
      let accumulatedResponse = '';

      await streamingService.sendMessageStream(apiMessages, systemContext, {
        onToken: (token: string) => {
          accumulatedResponse += token;
          setStreamingResponse(accumulatedResponse);
        },
        onComplete: () => {
          streamingRef.current = false;

          // Add complete AI response to conversation
          const finalConv = chatStorage.addMessage(updatedConv, 'assistant', accumulatedResponse);
          setConversation(finalConv);

          // Save to localStorage and update state
          const updatedConversations = conversations.map((c) =>
            c.id === finalConv.id ? finalConv : c
          );
          setConversations(updatedConversations);
          chatStorage.saveConversations(updatedConversations);

          // Clear streaming state
          setStreamingResponse('');
          setIsLoading(false);
          
          // Re-analyze conversation with new message
          analyzeConversationAsync(finalConv);
        },
        onError: (err: Error) => {
          streamingRef.current = false;
          console.error('Streaming error:', err);
          setError(err.message);
          setTimeout(() => setError(null), 5000);
          setIsLoading(false);
          setStreamingResponse('');
        },
      });
    } catch (err) {
      streamingRef.current = false;
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      setIsLoading(false);
      setStreamingResponse('');
    }
  };

  // Handler for selecting a model from suggestions
  const handleModelSelect = (model: MentalModel) => {
    handleSendMessage(`Tell me about ${model.name} and how it applies to my situation`);
  };

  if (!hasApiKey) {
    return null; // Don't show widget if no API key
  }

  return (
    <>
      {/* Floating Button */}
      <button className="chat-widget-button" onClick={() => setIsOpen(true)} aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {conversation && conversation.messages.length > 0 && (
          <span className="chat-badge">{conversation.messages.length}</span>
        )}
      </button>

      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        conversation={conversation}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        streamingResponse={streamingResponse}
      >
        {/* Model Suggestions */}
        {conversationAnalysis && conversationAnalysis.suggestedModels.length > 0 && (
          <ModelSuggestions
            suggestions={conversationAnalysis.suggestedModels}
            onSelectModel={handleModelSelect}
            isLoading={isAnalyzing}
          />
        )}

        {/* Error Display */}
        {error && (
          <ChatError
            error={error}
            onDismiss={() => setError(null)}
            onRetry={() => {
              const lastMessage = conversation?.messages[conversation.messages.length - 1];
              if (lastMessage && lastMessage.role === 'user') {
                handleSendMessage(lastMessage.content);
              }
            }}
          />
        )}
      </ChatWindow>

      {/* Conversation History */}
      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={conversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Settings */}
      {showSettings && (
        <ChatSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onClearAll={handleClearAll}
          onViewHistory={() => {
            setShowSettings(false);
            setShowHistory(true);
          }}
          messageCount={getTotalMessageCount()}
          conversationCount={conversations.length}
          currentConversation={conversation}
        />
      )}
    </>
  );
}
