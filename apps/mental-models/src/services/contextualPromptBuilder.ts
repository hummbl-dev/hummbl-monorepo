// Contextual Prompt Builder - Intelligent Mental Models Integration
// Analyzes conversation and suggests relevant mental models

import type { ChatConversation, ChatMessage } from '../../cascade/types/chat';
import type { MentalModel } from '../../cascade/types/mental-model';

export interface ModelSuggestion {
  model: MentalModel;
  relevanceScore: number;
  reasoning: string;
  applicationSuggestion: string;
}

export interface ConversationAnalysis {
  topics: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  intent: 'explore' | 'solve' | 'learn' | 'compare' | 'apply';
  suggestedModels: ModelSuggestion[];
}

export class ContextualPromptBuilder {
  private mentalModels: MentalModel[];
  private recentMessages: string[];

  constructor(mentalModels: MentalModel[] = []) {
    this.mentalModels = mentalModels;
    this.recentMessages = [];
  }

  /**
   * Analyze conversation to extract topics, complexity, and intent
   */
  analyzeConversation(conversation: ChatConversation): ConversationAnalysis {
    const allMessages = conversation.messages.map((m) => m.content.toLowerCase()).join(' ');
    const words = allMessages.split(/\s+/);

    // Extract key topics
    const topics = this.extractTopics(allMessages);

    // Determine complexity
    const complexity = this.assessComplexity(allMessages);

    // Detect intent
    const intent = this.detectIntent(allMessages);

    // Find relevant models
    const suggestedModels = this.findRelevantModels(topics, intent);

    return {
      topics,
      complexity,
      intent,
      suggestedModels,
    };
  }

  /**
   * Extract key topics from conversation
   */
  private extractTopics(text: string): string[] {
    const commonWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'is',
      'are',
      'was',
      'were',
      'to',
      'of',
      'in',
      'on',
      'at',
    ]);
    const words = text.split(/\s+/).filter((w) => w.length > 4 && !commonWords.has(w));
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.slice(0, 5);
  }

  /**
   * Assess conversation complexity
   */
  private assessComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const questionWords = (
      text.match(/(how|why|what|when|where|explain|describe|analyze|compare)/gi) || []
    ).length;

    if (questionWords <= 2) return 'simple';
    if (questionWords <= 5) return 'moderate';
    return 'complex';
  }

  /**
   * Detect user intent
   */
  private detectIntent(text: string): ConversationAnalysis['intent'] {
    if (/problem|challenge|issue|solve|fix/gi.test(text)) return 'solve';
    if (/compare|contrast|difference|similar/gi.test(text)) return 'compare';
    if (/use|apply|implement|practice|do/gi.test(text)) return 'apply';
    if (/explain|understand|learn|teach|tell|show/gi.test(text)) return 'learn';
    return 'explore';
  }

  /**
   * Find relevant mental models based on topics and intent
   */
  private findRelevantModels(topics: string[], intent: string): ModelSuggestion[] {
    const scored: ModelSuggestion[] = [];

    for (const model of this.mentalModels) {
      let relevanceScore = 0;
      const reasons: string[] = [];

      // Check topic matches
      for (const topic of topics) {
        const modelText =
          `${model.name} ${model.definition || ''} ${model.example || ''}`.toLowerCase();
        if (modelText.includes(topic)) {
          relevanceScore += 20;
          reasons.push(`matches topic "${topic}"`);
        }
      }

      // Check intent alignment
      const modelTags = (model.tags || []).map((t) => t.toLowerCase());
      if (
        intent === 'solve' &&
        modelTags.some((t) => t.includes('solution') || t.includes('problem'))
      ) {
        relevanceScore += 15;
        reasons.push('aligned with problem-solving intent');
      }
      if (
        intent === 'compare' &&
        modelTags.some((t) => t.includes('analysis') || t.includes('comparison'))
      ) {
        relevanceScore += 15;
        reasons.push('aligned with comparison intent');
      }
      if (
        intent === 'apply' &&
        modelTags.some((t) => t.includes('practical') || t.includes('implementation'))
      ) {
        relevanceScore += 15;
        reasons.push('aligned with application intent');
      }

      // Boost relevance for models with examples
      if (model.example) relevanceScore += 5;

      if (relevanceScore > 0) {
        scored.push({
          model,
          relevanceScore,
          reasoning: reasons.join('; '),
          applicationSuggestion: this.generateApplicationSuggestion(model, intent),
        });
      }
    }

    // Sort by relevance and return top 5
    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  /**
   * Generate application suggestion for a model
   */
  private generateApplicationSuggestion(model: MentalModel, intent: string): string {
    const suggestions: Record<string, string> = {
      solve: `Use this model to break down the problem and identify root causes.`,
      compare: `Apply this model to analyze different approaches and their trade-offs.`,
      apply: `Use this model as a practical framework for implementation.`,
      learn: `Study this model to understand the underlying principles and patterns.`,
      explore: `Investigate how this model might relate to your situation.`,
    };

    return suggestions[intent] || `Consider how ${model.name} might apply to your context.`;
  }

  /**
   * Build enhanced system prompt with conversation analysis
   */
  buildEnhancedPrompt(conversation: ChatConversation, contextDescription?: string): string {
    const analysis = this.analyzeConversation(conversation);

    let prompt = `You are HUMMBL AI Assistant, helping users understand and apply mental models for strategic thinking.

CONVERSATION CONTEXT:
- Topics discussed: ${analysis.topics.join(', ')}
- Complexity: ${analysis.complexity}
- User intent: ${analysis.intent}
`;

    if (contextDescription) {
      prompt += `\nCURRENT VIEW: ${contextDescription}\n`;
    }

    if (analysis.suggestedModels.length > 0) {
      prompt += `\nSUGGESTED RELEVANT MODELS (based on conversation):\n`;
      analysis.suggestedModels.forEach((suggestion, i) => {
        prompt += `${i + 1}. ${suggestion.model.name} (${suggestion.model.code || 'Code'})
   Relevance: ${suggestion.relevanceScore}% - ${suggestion.reasoning}
   ${suggestion.applicationSuggestion}
   Definition: ${suggestion.model.definition || 'No definition available'}
   
`;
      });
    }

    prompt += `\nINSTRUCTIONS:
- Reference relevant mental models by name when appropriate
- Explain how models apply to the user's context
- Suggest additional models that might be helpful
- Use examples from the available models
- Provide actionable insights based on the mental models

Help the user explore concepts, solve problems, and apply strategic thinking.`;

    return prompt;
  }

  /**
   * Update mental models cache
   */
  updateMentalModels(models: MentalModel[]) {
    this.mentalModels = models;
  }
}

// Export singleton instance
let contextualBuilder: ContextualPromptBuilder | null = null;

export const getContextualBuilder = (mentalModels?: MentalModel[]): ContextualPromptBuilder => {
  if (!contextualBuilder) {
    contextualBuilder = new ContextualPromptBuilder(mentalModels || []);
  } else if (mentalModels && mentalModels.length > 0) {
    contextualBuilder.updateMentalModels(mentalModels);
  }
  return contextualBuilder;
};
