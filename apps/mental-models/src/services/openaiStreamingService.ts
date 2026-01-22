// OpenAI Streaming API service for real-time responses

import type { OpenAIMessage } from '../types/chat';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class OpenAIStreamingService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessageStream(
    messages: OpenAIMessage[],
    systemContext: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
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

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response from OpenAI');
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            callbacks.onComplete();
            break;
          }

          // Decode the chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }

            // Parse SSE format: "data: {...}"
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6); // Remove "data: " prefix

              // Check for stream end
              if (data === '[DONE]') {
                callbacks.onComplete();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  callbacks.onToken(content);
                }
              } catch (parseError) {
                // Ignore parse errors for individual chunks
                console.warn('Failed to parse chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      callbacks.onError(error instanceof Error ? error : new Error('Streaming failed'));
    }
  }
}

// Singleton instance
let streamingService: OpenAIStreamingService | null = null;

export const getStreamingService = (apiKey?: string): OpenAIStreamingService => {
  if (!streamingService && apiKey) {
    streamingService = new OpenAIStreamingService(apiKey);
  }

  if (!streamingService) {
    throw new Error('Streaming service not initialized. Please provide API key.');
  }

  return streamingService;
};
