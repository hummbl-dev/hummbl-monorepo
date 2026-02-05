// HUMMBL OS Model Router - Intelligent AI Model Selection
// Routes tasks to optimal model class based on execution requirements

export type ModelClass = 'execution' | 'reasoning' | 'creative';

export interface TaskContext {
  // Execution indicators
  requiresFileAccess: boolean;
  requiresCommandExecution: boolean;
  requiresGitOperations: boolean;
  requiresRealTimeData: boolean;
  requiresEnvironmentState: boolean;

  // Reasoning indicators
  requiresDeepAnalysis: boolean;
  requiresResearch: boolean;
  requiresComparison: boolean;
  requiresArchitecturalDesign: boolean;
  requiresDocumentation: boolean;

  // Creative indicators
  requiresContentGeneration: boolean;
  requiresCreativeWriting: boolean;
  requiresMarketingCopy: boolean;
  requiresUserStories: boolean;
  requiresBrainstorming: boolean;

  // Context metadata
  projectType: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'ai' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  userIntent: string;
  conversationHistory?: string[];
}

export interface ModelCapability {
  modelClass: ModelClass;
  provider: 'cascade' | 'openai' | 'anthropic' | 'google' | 'local';
  modelId: string;
  strengths: string[];
  limitations: string[];
  costPerToken: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsCodeExecution: boolean;
}

export interface RoutingDecision {
  selectedModel: ModelCapability;
  confidence: number; // 0-1
  reasoning: string;
  fallbackModels: ModelCapability[];
  estimatedCost: number;
  estimatedLatency: number;
}

export class ModelRouter {
  private models: ModelCapability[] = [
    // Execution Models
    {
      modelClass: 'execution',
      provider: 'cascade',
      modelId: 'cascade-agent',
      strengths: [
        'Direct file system access',
        'Terminal command execution',
        'Git operations',
        'Multi-tool coordination',
        'Real-time environment state',
        'End-to-end feature delivery',
      ],
      limitations: [
        'Limited to development contexts',
        'Requires active repository',
        'Not optimized for pure reasoning',
      ],
      costPerToken: 0.001, // Estimated
      maxTokens: 8192,
      supportsStreaming: true,
      supportsTools: true,
      supportsCodeExecution: true,
    },

    // Reasoning Models
    {
      modelClass: 'reasoning',
      provider: 'anthropic',
      modelId: 'claude-3.5-sonnet',
      strengths: [
        'Deep analytical reasoning',
        'Complex problem decomposition',
        'Architectural design',
        'Research synthesis',
        'Long-form documentation',
      ],
      limitations: [
        'No environment access',
        'Cannot execute code',
        'Higher latency for simple tasks',
      ],
      costPerToken: 0.003,
      maxTokens: 200000,
      supportsStreaming: true,
      supportsTools: false,
      supportsCodeExecution: false,
    },

    {
      modelClass: 'reasoning',
      provider: 'openai',
      modelId: 'gpt-4-turbo',
      strengths: [
        'General knowledge',
        'Code analysis',
        'Technical documentation',
        'API design',
        'Testing strategies',
      ],
      limitations: ['No environment access', 'Cannot execute code', 'Token limit constraints'],
      costPerToken: 0.01,
      maxTokens: 128000,
      supportsStreaming: true,
      supportsTools: true,
      supportsCodeExecution: false,
    },

    // Creative Models
    {
      modelClass: 'creative',
      provider: 'openai',
      modelId: 'gpt-4',
      strengths: [
        'Creative writing',
        'Marketing copy',
        'User stories',
        'Content generation',
        'Brainstorming',
      ],
      limitations: [
        'No environment access',
        'Not optimized for code',
        'Higher cost for technical tasks',
      ],
      costPerToken: 0.03,
      maxTokens: 8192,
      supportsStreaming: true,
      supportsTools: false,
      supportsCodeExecution: false,
    },
  ];

  /**
   * Route task to optimal model based on context analysis
   */
  public route(context: TaskContext): RoutingDecision {
    const scores = this.models.map((model) => ({
      model,
      score: this.calculateModelScore(model, context),
      reasoning: this.generateReasoning(model, context),
    }));

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    const selectedModel = scores[0].model;
    const confidence = scores[0].score;
    const reasoning = scores[0].reasoning;

    return {
      selectedModel,
      confidence,
      reasoning,
      fallbackModels: scores.slice(1, 3).map((s) => s.model),
      estimatedCost: this.estimateCost(selectedModel, context),
      estimatedLatency: this.estimateLatency(selectedModel, context),
    };
  }

  /**
   * Calculate model fitness score for given context
   */
  private calculateModelScore(model: ModelCapability, context: TaskContext): number {
    let score = 0;

    // Execution requirements (high weight)
    if (this.requiresExecution(context)) {
      if (model.modelClass === 'execution') {
        score += 0.8;
      } else {
        score -= 0.5; // Heavy penalty for non-execution models
      }
    }

    // Reasoning requirements (medium weight)
    if (this.requiresReasoning(context)) {
      if (model.modelClass === 'reasoning') {
        score += 0.6;
      } else if (model.modelClass === 'execution') {
        score += 0.3; // Cascade can reason, but not optimal
      }
    }

    // Creative requirements (medium weight)
    if (this.requiresCreativity(context)) {
      if (model.modelClass === 'creative') {
        score += 0.6;
      } else {
        score += 0.1; // Other models have some creative capability
      }
    }

    // Context-specific bonuses
    score += this.getContextBonus(model, context);

    // Urgency adjustments
    if (context.urgency === 'critical' && model.modelClass === 'execution') {
      score += 0.2; // Execution models are faster for critical tasks
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Check if task requires execution capabilities
   */
  private requiresExecution(context: TaskContext): boolean {
    return (
      context.requiresFileAccess ||
      context.requiresCommandExecution ||
      context.requiresGitOperations ||
      context.requiresRealTimeData ||
      context.requiresEnvironmentState
    );
  }

  /**
   * Check if task requires deep reasoning
   */
  private requiresReasoning(context: TaskContext): boolean {
    return (
      context.requiresDeepAnalysis ||
      context.requiresResearch ||
      context.requiresComparison ||
      context.requiresArchitecturalDesign ||
      context.requiresDocumentation
    );
  }

  /**
   * Check if task requires creative capabilities
   */
  private requiresCreativity(context: TaskContext): boolean {
    return (
      context.requiresContentGeneration ||
      context.requiresCreativeWriting ||
      context.requiresMarketingCopy ||
      context.requiresUserStories ||
      context.requiresBrainstorming
    );
  }

  /**
   * Get context-specific scoring bonus
   */
  private getContextBonus(model: ModelCapability, context: TaskContext): number {
    let bonus = 0;

    // Project type bonuses
    if (context.projectType === 'frontend' && model.modelId === 'cascade-agent') {
      bonus += 0.1;
    }

    // Complexity adjustments
    if (context.complexity === 'enterprise' && model.modelClass === 'reasoning') {
      bonus += 0.1;
    }

    return bonus;
  }

  /**
   * Generate human-readable reasoning for model selection
   */
  private generateReasoning(model: ModelCapability, context: TaskContext): string {
    const reasons: string[] = [];

    if (this.requiresExecution(context) && model.modelClass === 'execution') {
      reasons.push('Task requires direct environment access and code execution');
    }

    if (this.requiresReasoning(context) && model.modelClass === 'reasoning') {
      reasons.push('Task benefits from deep analytical reasoning capabilities');
    }

    if (this.requiresCreativity(context) && model.modelClass === 'creative') {
      reasons.push('Task requires creative content generation');
    }

    if (context.urgency === 'critical') {
      reasons.push('Critical urgency favors fast execution models');
    }

    return reasons.join('; ') || 'General capability match';
  }

  /**
   * Estimate cost for model usage
   */
  private estimateCost(model: ModelCapability, context: TaskContext): number {
    const estimatedTokens = this.estimateTokenUsage(context);
    return estimatedTokens * model.costPerToken;
  }

  /**
   * Estimate latency for model usage
   */
  private estimateLatency(model: ModelCapability, context: TaskContext): number {
    // Base latency by model class
    const baseLatency = {
      execution: 2000, // 2s - includes tool execution time
      reasoning: 5000, // 5s - longer processing time
      creative: 3000, // 3s - moderate processing
    };

    return baseLatency[model.modelClass] || 3000;
  }

  /**
   * Estimate token usage based on context
   */
  private estimateTokenUsage(context: TaskContext): number {
    let tokens = 1000; // Base estimate

    if (context.complexity === 'enterprise') tokens *= 3;
    if (context.requiresDocumentation) tokens *= 2;
    if (context.conversationHistory?.length) {
      tokens += context.conversationHistory.length * 100;
    }

    return tokens;
  }
}

// Export singleton instance
export const modelRouter = new ModelRouter();
