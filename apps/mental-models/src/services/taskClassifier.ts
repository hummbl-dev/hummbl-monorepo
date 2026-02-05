// Task Classification Service - Analyzes user input to determine task requirements

import { TaskContext } from './modelRouter';

export interface ClassificationResult {
  context: TaskContext;
  confidence: number;
  detectedIntents: string[];
  suggestedPromptEnhancements: string[];
}

export class TaskClassifier {
  // Execution keywords and patterns
  private executionPatterns = {
    fileAccess: [
      /read|view|check|examine|analyze.*file/i,
      /edit|modify|update|change.*file/i,
      /create|write|generate.*file/i,
      /delete|remove.*file/i,
      /add.*to.*file|modify.*code|update.*component/i,
      /implement.*improvements|implement.*changes|implement.*system/i,
    ],
    commandExecution: [
      /run|execute|start|launch/i,
      /install|npm|yarn|pip/i,
      /build|compile|deploy/i,
      /test|lint|format/i,
      /git|commit|push|pull/i,
      /fix.*build|fix.*error/i,
      /add.*streaming|add.*responses/i,
      /implement.*improvements|implement.*changes/i,
    ],
    gitOperations: [
      /git|commit|push|pull|merge|branch/i,
      /version control|repository/i,
      /deploy|deployment/i,
    ],
    realTimeData: [
      /current|latest|real.?time|live/i,
      /status|health|monitor/i,
      /logs|metrics|analytics/i,
    ],
    environmentState: [
      /environment|env|config/i,
      /server|database|api.*status/i,
      /dependencies|packages/i,
    ],
  };

  // Reasoning keywords and patterns
  private reasoningPatterns = {
    deepAnalysis: [
      /analyze|analysis|examine|investigate/i,
      /why|how|explain|understand/i,
      /compare|contrast|evaluate/i,
      /pros.*cons|advantages.*disadvantages/i,
    ],
    research: [
      /research|study|investigate/i,
      /best practices|patterns|approaches/i,
      /what.*is|define|explain/i,
      /learn|understand|knowledge/i,
    ],
    comparison: [
      /compare|vs|versus|difference/i,
      /which.*better|choose.*between/i,
      /pros.*cons|trade.?offs/i,
    ],
    architecturalDesign: [
      /architecture|design|structure/i,
      /system.*design|scalability/i,
      /patterns|principles/i,
      /microservices|monolith/i,
    ],
    documentation: [
      /document|docs|readme/i,
      /explain|describe|outline/i,
      /guide|tutorial|instructions/i,
    ],
  };

  // Creative keywords and patterns
  private creativePatterns = {
    contentGeneration: [
      /write|create|generate.*content/i,
      /blog|article|post/i,
      /copy|text|content/i,
    ],
    creativeWriting: [
      /story|narrative|creative/i,
      /write.*story|fiction/i,
      /poem|poetry|creative.*writing/i,
    ],
    marketingCopy: [
      /marketing|advertisement|ad.*copy/i,
      /landing.*page|sales.*page/i,
      /tagline|slogan|headline/i,
    ],
    userStories: [/user.*story|user.*journey/i, /persona|use.*case/i, /requirements|specs/i],
    brainstorming: [
      /brainstorm|ideas|creative.*thinking/i,
      /possibilities|options|alternatives/i,
      /innovative|novel|unique/i,
    ],
  };

  // Project type detection
  private projectTypePatterns = {
    frontend: [/react|vue|angular|frontend|ui|ux|component/i],
    backend: [/api|server|backend|database|endpoint/i],
    fullstack: [/fullstack|full.stack|end.to.end/i],
    mobile: [/mobile|ios|android|react.native/i],
    desktop: [/desktop|electron|native/i],
    ai: [/ai|ml|machine.learning|neural/i],
  };

  /**
   * Classify user input and generate task context
   */
  public classify(userInput: string, conversationHistory?: string[]): ClassificationResult {
    const context: TaskContext = {
      // Initialize all flags as false
      requiresFileAccess: false,
      requiresCommandExecution: false,
      requiresGitOperations: false,
      requiresRealTimeData: false,
      requiresEnvironmentState: false,
      requiresDeepAnalysis: false,
      requiresResearch: false,
      requiresComparison: false,
      requiresArchitecturalDesign: false,
      requiresDocumentation: false,
      requiresContentGeneration: false,
      requiresCreativeWriting: false,
      requiresMarketingCopy: false,
      requiresUserStories: false,
      requiresBrainstorming: false,

      // Default values
      projectType: 'other',
      urgency: 'medium',
      complexity: 'moderate',
      userIntent: userInput,
      conversationHistory,
    };

    const detectedIntents: string[] = [];
    const suggestedPromptEnhancements: string[] = [];

    // Analyze execution requirements
    this.analyzeExecutionRequirements(userInput, context, detectedIntents);

    // Analyze reasoning requirements
    this.analyzeReasoningRequirements(userInput, context, detectedIntents);

    // Analyze creative requirements
    this.analyzeCreativeRequirements(userInput, context, detectedIntents);

    // Detect project type
    context.projectType = this.detectProjectType(userInput);

    // Detect urgency
    context.urgency = this.detectUrgency(userInput);

    // Detect complexity
    context.complexity = this.detectComplexity(userInput);

    // Generate prompt enhancements
    this.generatePromptEnhancements(context, suggestedPromptEnhancements);

    // Calculate confidence
    const confidence = this.calculateConfidence(detectedIntents, userInput);

    return {
      context,
      confidence,
      detectedIntents,
      suggestedPromptEnhancements,
    };
  }

  /**
   * Analyze if task requires execution capabilities
   */
  private analyzeExecutionRequirements(
    input: string,
    context: TaskContext,
    intents: string[]
  ): void {
    // Check file access patterns
    if (this.matchesAnyPattern(input, this.executionPatterns.fileAccess)) {
      context.requiresFileAccess = true;
      intents.push('file_access');
    }

    // Check command execution patterns
    if (this.matchesAnyPattern(input, this.executionPatterns.commandExecution)) {
      context.requiresCommandExecution = true;
      intents.push('command_execution');
    }

    // Check git operations patterns
    if (this.matchesAnyPattern(input, this.executionPatterns.gitOperations)) {
      context.requiresGitOperations = true;
      intents.push('git_operations');
    }

    // Check real-time data patterns
    if (this.matchesAnyPattern(input, this.executionPatterns.realTimeData)) {
      context.requiresRealTimeData = true;
      intents.push('real_time_data');
    }

    // Check environment state patterns
    if (this.matchesAnyPattern(input, this.executionPatterns.environmentState)) {
      context.requiresEnvironmentState = true;
      intents.push('environment_state');
    }
  }

  /**
   * Analyze if task requires reasoning capabilities
   */
  private analyzeReasoningRequirements(
    input: string,
    context: TaskContext,
    intents: string[]
  ): void {
    if (this.matchesAnyPattern(input, this.reasoningPatterns.deepAnalysis)) {
      context.requiresDeepAnalysis = true;
      intents.push('deep_analysis');
    }

    if (this.matchesAnyPattern(input, this.reasoningPatterns.research)) {
      context.requiresResearch = true;
      intents.push('research');
    }

    if (this.matchesAnyPattern(input, this.reasoningPatterns.comparison)) {
      context.requiresComparison = true;
      intents.push('comparison');
    }

    if (this.matchesAnyPattern(input, this.reasoningPatterns.architecturalDesign)) {
      context.requiresArchitecturalDesign = true;
      intents.push('architectural_design');
    }

    if (this.matchesAnyPattern(input, this.reasoningPatterns.documentation)) {
      context.requiresDocumentation = true;
      intents.push('documentation');
    }
  }

  /**
   * Analyze if task requires creative capabilities
   */
  private analyzeCreativeRequirements(
    input: string,
    context: TaskContext,
    intents: string[]
  ): void {
    if (this.matchesAnyPattern(input, this.creativePatterns.contentGeneration)) {
      context.requiresContentGeneration = true;
      intents.push('content_generation');
    }

    if (this.matchesAnyPattern(input, this.creativePatterns.creativeWriting)) {
      context.requiresCreativeWriting = true;
      intents.push('creative_writing');
    }

    if (this.matchesAnyPattern(input, this.creativePatterns.marketingCopy)) {
      context.requiresMarketingCopy = true;
      intents.push('marketing_copy');
    }

    if (this.matchesAnyPattern(input, this.creativePatterns.userStories)) {
      context.requiresUserStories = true;
      intents.push('user_stories');
    }

    if (this.matchesAnyPattern(input, this.creativePatterns.brainstorming)) {
      context.requiresBrainstorming = true;
      intents.push('brainstorming');
    }
  }

  /**
   * Detect project type from input
   */
  private detectProjectType(input: string): TaskContext['projectType'] {
    for (const [type, patterns] of Object.entries(this.projectTypePatterns)) {
      if (this.matchesAnyPattern(input, patterns)) {
        return type as TaskContext['projectType'];
      }
    }
    return 'other';
  }

  /**
   * Detect urgency level from input
   */
  private detectUrgency(input: string): TaskContext['urgency'] {
    if (/urgent|asap|immediately|critical|emergency/i.test(input)) {
      return 'critical';
    }
    if (/soon|quickly|fast|priority/i.test(input)) {
      return 'high';
    }
    if (/later|eventually|when.*time/i.test(input)) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Detect complexity level from input
   */
  private detectComplexity(input: string): TaskContext['complexity'] {
    if (/enterprise|complex|advanced|sophisticated|scalable/i.test(input)) {
      return 'enterprise';
    }
    if (/complex|multiple|integration|system/i.test(input)) {
      return 'complex';
    }
    if (/simple|basic|quick|small/i.test(input)) {
      return 'simple';
    }
    return 'moderate';
  }

  /**
   * Generate prompt enhancement suggestions
   */
  private generatePromptEnhancements(context: TaskContext, enhancements: string[]): void {
    if (context.requiresFileAccess && !context.requiresCommandExecution) {
      enhancements.push('Consider specifying which files need to be accessed');
    }

    if (context.requiresDeepAnalysis && context.complexity === 'simple') {
      enhancements.push('Provide more context for deeper analysis');
    }

    if (context.urgency === 'critical' && context.complexity === 'enterprise') {
      enhancements.push('Consider breaking down into smaller, urgent tasks');
    }
  }

  /**
   * Calculate classification confidence
   */
  private calculateConfidence(intents: string[], _input: string): number {
    if (intents.length === 0) return 0.3; // Low confidence for unclear tasks
    if (intents.length === 1) return 0.7; // Medium confidence for single intent
    if (intents.length <= 3) return 0.9; // High confidence for clear multi-intent
    return 0.6; // Medium confidence for complex multi-intent
  }

  /**
   * Check if input matches any pattern in array
   */
  private matchesAnyPattern(_input: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(_input));
  }
}

// Export singleton instance
export const taskClassifier = new TaskClassifier();
