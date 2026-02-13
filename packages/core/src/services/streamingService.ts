// OpenAI Streaming API service for real-time responses
// Migrated from hummbl-io with enhanced error handling and TypeScript strict mode

import { createLogger } from '../logger';
import type { OpenAIMessage, StreamCallbacks, OpenAIResponse } from '../types/chat';

const logger = createLogger('streaming');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

export interface StreamingServiceConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIStreamingService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: StreamingServiceConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
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

      const request = {
        model: this.model,
        messages: allMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      await this.processStream(response.body, callbacks);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  private async processStream(body: ReadableStream, callbacks: StreamCallbacks): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          callbacks.onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

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
              logger.warn('Failed to parse streaming data', { error: parseError });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Non-streaming version for fallback
  async sendMessage(messages: OpenAIMessage[], systemContext?: string): Promise<string> {
    try {
      const allMessages: OpenAIMessage[] = [];

      if (systemContext) {
        allMessages.push({
          role: 'system',
          content: systemContext,
        });
      }

      allMessages.push(...messages);

      const request = {
        model: this.model,
        messages: allMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OpenAIResponse;
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw new Error(
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Update configuration
  updateConfig(config: Partial<StreamingServiceConfig>): void {
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxTokens !== undefined) this.maxTokens = config.maxTokens;
    if (config.apiKey) this.apiKey = config.apiKey;
  }

  // Get current configuration
  getConfig(): Omit<StreamingServiceConfig, 'apiKey'> {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }
}

// Factory function for creating streaming service instances
export function createStreamingService(config: StreamingServiceConfig): OpenAIStreamingService {
  return new OpenAIStreamingService(config);
}
