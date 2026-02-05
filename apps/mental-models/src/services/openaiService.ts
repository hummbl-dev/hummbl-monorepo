// OpenAI API integration service

import type { OpenAIMessage, OpenAIRequest, OpenAIResponse } from '../types/chat';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // Fast and cost-effective

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages: OpenAIMessage[], systemContext?: string): Promise<string> {
    try {
      const allMessages: OpenAIMessage[] = [];

      // Add system context if provided
      if (systemContext) {
        allMessages.push({
          role: 'system',
          content: systemContext,
        });
      }

      // Add conversation messages
      allMessages.push(...messages);

      const request: OpenAIRequest = {
        model: MODEL,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1000,
      };

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response from OpenAI');
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Build system context from mental models, narratives, and current view context
  buildSystemContext(
    mentalModels?: any[],
    narratives?: any[],
    contextDescription?: string
  ): string {
    let context =
      'You are HUMMBL AI Assistant, helping users understand mental models and narratives for better decision-making.\n\n';

    // Add current context if provided
    if (contextDescription) {
      context += `CURRENT CONTEXT: ${contextDescription}\n\n`;
      context +=
        'Use this context to provide relevant, focused answers about what the user is currently viewing.\n\n';
    }

    if (mentalModels && mentalModels.length > 0) {
      context += `Available Mental Models (${mentalModels.length}):\n`;
      // Show up to 20 models for better coverage
      mentalModels.slice(0, 20).forEach((model) => {
        context += `- ${model.name} (${model.code || 'N/A'}): ${(model.definition || model.description || '').substring(0, 150)}...\n`;
      });
      context += '\n';
    }

    if (narratives && narratives.length > 0) {
      context += `Available Narratives (${narratives.length}):\n`;
      narratives.slice(0, 10).forEach((narrative) => {
        context += `- ${narrative.title}: ${(narrative.summary || '').substring(0, 100)}...\n`;
      });
      context += '\n';
    }

    context +=
      'Help users explore these concepts, answer questions, and provide insights. Reference specific models by name when relevant.';

    return context;
  }
}

// Singleton instance
let openAIService: OpenAIService | null = null;

export const getOpenAIService = (apiKey?: string): OpenAIService => {
  if (!openAIService && apiKey) {
    openAIService = new OpenAIService(apiKey);
  }

  if (!openAIService) {
    throw new Error('OpenAI service not initialized. Please provide API key.');
  }

  return openAIService;
};
