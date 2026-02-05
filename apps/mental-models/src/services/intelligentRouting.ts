// Intelligent Routing Service - Orchestrates model selection and task execution

import { taskClassifier, ClassificationResult } from './taskClassifier';
import { modelRouter, RoutingDecision, ModelClass } from './modelRouter';

export interface RoutingResult {
  classification: ClassificationResult;
  routing: RoutingDecision;
  executionPlan: ExecutionStep[];
  estimatedDuration: number;
  recommendedApproach: string;
}

export interface ExecutionStep {
  stepId: string;
  description: string;
  modelClass: ModelClass;
  estimatedTime: number;
  dependencies: string[];
  tools: string[];
}

export class IntelligentRoutingService {
  /**
   * Main entry point - analyze input and route to optimal model
   */
  public async route(userInput: string, conversationHistory?: string[]): Promise<RoutingResult> {
    // Step 1: Classify the task
    const classification = taskClassifier.classify(userInput, conversationHistory);

    // Step 2: Route to optimal model
    const routing = modelRouter.route(classification.context);

    // Step 3: Generate execution plan
    const executionPlan = this.generateExecutionPlan(classification, routing);

    // Step 4: Estimate total duration
    const estimatedDuration = this.calculateTotalDuration(executionPlan);

    // Step 5: Generate recommended approach
    const recommendedApproach = this.generateRecommendedApproach(classification, routing);

    return {
      classification,
      routing,
      executionPlan,
      estimatedDuration,
      recommendedApproach,
    };
  }

  /**
   * Generate step-by-step execution plan
   */
  private generateExecutionPlan(
    classification: ClassificationResult,
    routing: RoutingDecision
  ): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const context = classification.context;

    // Analysis phase (always first for complex tasks)
    if (context.complexity === 'complex' || context.complexity === 'enterprise') {
      steps.push({
        stepId: 'analysis',
        description: 'Analyze requirements and plan approach',
        modelClass: routing.selectedModel.modelClass,
        estimatedTime: 300, // 5 minutes
        dependencies: [],
        tools: ['reasoning', 'planning'],
      });
    }

    // Execution phases based on requirements
    if (context.requiresFileAccess || context.requiresCommandExecution) {
      steps.push({
        stepId: 'implementation',
        description: 'Implement changes and execute commands',
        modelClass: 'execution',
        estimatedTime: 900, // 15 minutes
        dependencies: context.complexity === 'complex' ? ['analysis'] : [],
        tools: ['file_system', 'terminal', 'git'],
      });
    }

    if (context.requiresDocumentation) {
      steps.push({
        stepId: 'documentation',
        description: 'Generate documentation and explanations',
        modelClass: 'reasoning',
        estimatedTime: 600, // 10 minutes
        dependencies: ['implementation'],
        tools: ['writing', 'analysis'],
      });
    }

    if (context.requiresGitOperations) {
      steps.push({
        stepId: 'version_control',
        description: 'Commit changes and manage version control',
        modelClass: 'execution',
        estimatedTime: 180, // 3 minutes
        dependencies: ['implementation'],
        tools: ['git', 'terminal'],
      });
    }

    // Verification phase (for critical tasks)
    if (context.urgency === 'critical') {
      steps.push({
        stepId: 'verification',
        description: 'Test and verify implementation',
        modelClass: 'execution',
        estimatedTime: 300, // 5 minutes
        dependencies: ['implementation'],
        tools: ['testing', 'validation'],
      });
    }

    return steps.length > 0
      ? steps
      : [
          {
            stepId: 'response',
            description: 'Generate response',
            modelClass: routing.selectedModel.modelClass,
            estimatedTime: 120, // 2 minutes
            dependencies: [],
            tools: ['reasoning'],
          },
        ];
  }

  /**
   * Calculate total estimated duration
   */
  private calculateTotalDuration(steps: ExecutionStep[]): number {
    // Account for dependencies and parallel execution
    const criticalPath = this.findCriticalPath(steps);
    return criticalPath.reduce((total, step) => total + step.estimatedTime, 0);
  }

  /**
   * Find critical path through execution steps
   */
  private findCriticalPath(steps: ExecutionStep[]): ExecutionStep[] {
    // Simple implementation - assumes sequential execution
    // In practice, this would use proper critical path analysis
    return steps.sort((a, b) => {
      if (a.dependencies.includes(b.stepId)) return 1;
      if (b.dependencies.includes(a.stepId)) return -1;
      return 0;
    });
  }

  /**
   * Generate human-readable recommended approach
   */
  private generateRecommendedApproach(
    classification: ClassificationResult,
    routing: RoutingDecision
  ): string {
    const approach: string[] = [];
    const context = classification.context;

    // Model selection reasoning
    approach.push(`**Model Selection:** ${routing.selectedModel.modelId}`);
    approach.push(`*Reasoning:* ${routing.reasoning}`);
    approach.push('');

    // Execution strategy
    if (routing.selectedModel.modelClass === 'execution') {
      approach.push('**Execution Strategy:**');
      approach.push('- Direct environment access for immediate implementation');
      approach.push('- Real-time feedback and error handling');
      approach.push('- Automated testing and verification');
    } else if (routing.selectedModel.modelClass === 'reasoning') {
      approach.push('**Analysis Strategy:**');
      approach.push('- Deep analytical reasoning');
      approach.push('- Comprehensive research and comparison');
      approach.push('- Detailed documentation and explanations');
    } else {
      approach.push('**Creative Strategy:**');
      approach.push('- Original content generation');
      approach.push('- Creative problem-solving approach');
      approach.push('- Multiple iteration and refinement');
    }

    approach.push('');

    // Risk mitigation
    if (context.urgency === 'critical') {
      approach.push('**Risk Mitigation:**');
      approach.push('- Prioritize core functionality first');
      approach.push('- Implement with fallback options');
      approach.push('- Continuous validation during execution');
    }

    // Success metrics
    approach.push('**Success Metrics:**');
    if (context.requiresCommandExecution) {
      approach.push('- All commands execute successfully');
      approach.push('- No breaking changes introduced');
    }
    if (context.requiresDocumentation) {
      approach.push('- Clear, comprehensive documentation');
      approach.push('- Examples and usage instructions included');
    }

    return approach.join('\n');
  }

  /**
   * Get routing decision for display/debugging
   */
  public async getRoutingDecision(userInput: string): Promise<{
    selectedModel: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
  }> {
    const result = await this.route(userInput);

    return {
      selectedModel: result.routing.selectedModel.modelId,
      confidence: result.routing.confidence,
      reasoning: result.routing.reasoning,
      alternatives: result.routing.fallbackModels.map((m) => m.modelId),
    };
  }
}

// Export singleton instance
export const intelligentRouting = new IntelligentRoutingService();

// Utility function for quick routing decisions
export async function routeTask(userInput: string): Promise<ModelClass> {
  const result = await intelligentRouting.route(userInput);
  return result.routing.selectedModel.modelClass;
}

// Utility function to check if task requires execution
export function requiresExecution(userInput: string): boolean {
  const classification = taskClassifier.classify(userInput);
  const context = classification.context;

  return (
    context.requiresFileAccess ||
    context.requiresCommandExecution ||
    context.requiresGitOperations ||
    context.requiresRealTimeData ||
    context.requiresEnvironmentState
  );
}
