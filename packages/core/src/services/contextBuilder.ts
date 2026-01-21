// Context building service for mental model integration
// Migrated from hummbl-io with enhanced Base120 framework integration

import type { ChatContext } from '../types/chat';
import type { Base120Model } from '../types/models';

export interface ContextBuilderConfig {
  maxContextLength: number;
  includeTransformationInfo: boolean;
  includeModelExamples: boolean;
  enableSemanticContext: boolean;
}

export interface ConversationAnalysis {
  topics: string[];
  transformations: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
  suggestedModels: string[];
  confidence: number;
}

export class ContextBuilderService {
  private config: ContextBuilderConfig;

  constructor(config: Partial<ContextBuilderConfig> = {}) {
    this.config = {
      maxContextLength: 2000,
      includeTransformationInfo: true,
      includeModelExamples: true,
      enableSemanticContext: true,
      ...config,
    };
  }

  // Build contextual prompt based on chat context
  buildContextualPrompt(context: ChatContext): string {
    const sections: string[] = [];

    // Add system context
    sections.push(this.buildSystemContext());

    // Add mental models context
    if (context.mentalModels && context.mentalModels.length > 0) {
      sections.push(this.buildMentalModelsContext(context.mentalModels));
    }

    // Add current view context
    if (context.currentView) {
      sections.push(this.buildViewContext(context));
    }

    // Add transformation context
    if (context.transformation) {
      sections.push(this.buildTransformationContext(context.transformation));
    }

    // Add selected item context
    if (context.selectedItem) {
      sections.push(this.buildSelectedItemContext(context));
    }

    // Combine and truncate if necessary
    const fullContext = sections.join('\n\n');
    return this.truncateContext(fullContext);
  }

  // Analyze conversation for insights
  analyzeConversation(messages: any[]): ConversationAnalysis {
    const topics = this.extractTopics(messages);
    const transformations = this.extractTransformations(messages);
    const complexity = this.assessComplexity(messages);
    const suggestedModels = this.suggestModels(topics);
    const confidence = this.calculateConfidence(messages);

    return {
      topics,
      transformations,
      complexity,
      suggestedModels,
      confidence,
    };
  }

  // Build system context
  private buildSystemContext(): string {
    return `You are a helpful AI assistant specializing in the HUMMBL Base120 framework - a comprehensive collection of 120 mental models organized into six fundamental transformations:

**Transformations:**
- **P (Perspective):** Viewing situations from different angles
- **IN (Inversion):** Thinking backwards or opposite
- **CO (Composition):** Combining elements together
- **DE (Decomposition):** Breaking down into parts
- **RE (Recursion):** Self-referential patterns and iteration
- **SY (Meta-Systems):** Systems thinking and higher-order patterns

Help users explore these mental models, provide practical examples, and suggest relevant models for their specific situations.`;
  }

  // Build mental models context
  private buildMentalModelsContext(models: Base120Model[]): string {
    const modelList = models
      .map(model => {
        const examples =
          this.config.includeModelExamples && model.methods?.length > 0
            ? `\n  Examples: ${model.methods.slice(0, 2).join(', ')}`
            : '';

        return `- **${model.code}: ${model.name}** (${model.transformation})\n  ${model.description}${examples}`;
      })
      .join('\n\n');

    return `**Relevant Mental Models:**
${modelList}`;
  }

  // Build view context
  private buildViewContext(context: ChatContext): string {
    const viewDescriptions: Record<string, string> = {
      models: 'exploring mental models and their applications',
      narratives: 'working with narrative frameworks and story structures',
    };

    return `**Current Context:** User is ${viewDescriptions[context.currentView || 'unknown'] || 'navigating the platform'}`;
  }

  // Build transformation context
  private buildTransformationContext(transformation: string): string {
    const transformationDescriptions: Record<string, string> = {
      P: 'Perspective-taking and viewpoint shifting',
      IN: 'Inverse thinking and reverse engineering',
      CO: 'Synthesis and combination of elements',
      DE: 'Analysis and breakdown of complex systems',
      RE: 'Iterative patterns and recursive thinking',
      SY: 'Meta-level analysis and systems thinking',
    };

    return `**Focus Transformation:** ${transformation} - ${transformationDescriptions[transformation] || 'Unknown transformation'}`;
  }

  // Build selected item context
  private buildSelectedItemContext(context: ChatContext): string {
    const model = context.mentalModels?.find(m => m.code === context.selectedItem);
    if (!model) return '';

    return `**Selected Model:** ${model.code} - ${model.name}
${model.description}

**Transformation Type:** ${model.transformation}
**Methods:** ${model.methods?.join(', ') || 'No specific methods documented'}`;
  }

  // Truncate context to fit within limits
  private truncateContext(context: string): string {
    if (context.length <= this.config.maxContextLength) {
      return context;
    }

    // Truncate at word boundary and add ellipsis
    const truncated = context.substring(0, this.config.maxContextLength - 50);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '\n\n... (context truncated for brevity)';
  }

  // Extract topics from conversation
  private extractTopics(messages: any[]): string[] {
    const topics = new Set<string>();

    messages.forEach(msg => {
      if (typeof msg.content === 'string') {
        // Simple keyword extraction (can be enhanced with NLP)
        const keywords = msg.content
          .toLowerCase()
          .match(
            /\b(decision|strategy|problem|solution|analysis|system|framework|model|approach|method|technique)\b/g
          );
        keywords?.forEach((keyword: string) => topics.add(keyword));
      }
    });

    return Array.from(topics);
  }

  // Extract transformations mentioned
  private extractTransformations(messages: any[]): string[] {
    const extractedTransformations = new Set<string>();
    const transformationCodes = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];

    messages.forEach(msg => {
      if (typeof msg.content === 'string') {
        transformationCodes.forEach(code => {
          if (msg.content.includes(code)) {
            extractedTransformations.add(code);
          }
        });
      }
    });

    return Array.from(extractedTransformations);
  }

  // Assess conversation complexity
  private assessComplexity(messages: any[]): 'basic' | 'intermediate' | 'advanced' {
    const messageCount = messages.length;
    const avgMessageLength =
      messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / messageCount;

    if (messageCount <= 3 && avgMessageLength < 100) return 'basic';
    if (messageCount <= 10 && avgMessageLength < 200) return 'intermediate';
    return 'advanced';
  }

  // Suggest relevant models based on context
  private suggestModels(topics: string[]): string[] {
    // Simple suggestion logic (can be enhanced with semantic matching)
    const suggestions: string[] = [];

    if (topics.includes('decision')) suggestions.push('P1', 'IN3');
    if (topics.includes('strategy')) suggestions.push('CO1', 'SY1');
    if (topics.includes('problem')) suggestions.push('DE1', 'RE1');
    if (topics.includes('analysis')) suggestions.push('DE2', 'SY2');

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  // Calculate confidence in analysis
  private calculateConfidence(messages: any[]): number {
    const messageCount = messages.length;
    const hasContext = messages.some(msg => msg.context);

    let confidence = 0.5; // Base confidence

    if (messageCount > 5) confidence += 0.2;
    if (messageCount > 10) confidence += 0.2;
    if (hasContext) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Update configuration
  updateConfig(config: Partial<ContextBuilderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const contextBuilder = new ContextBuilderService();
