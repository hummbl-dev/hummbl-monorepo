/**
 * Complexity Classifier
 *
 * Rule-based task complexity classification for model routing.
 */

import type {
  ComplexityLevel,
  ComplexityRouterConfig,
  ComplexityRule,
  CostRequestContext,
} from '../types.js';

interface ComplexityResult {
  level: ComplexityLevel;
  model: string;
  maxTokens?: number;
  matchedRule?: ComplexityRule;
  reason: string;
}

/**
 * Estimate token count from text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // GPT-style tokenization: ~4 chars per token
  return Math.ceil(text.length / 4);
}

/**
 * Classify complexity based on prompt characteristics
 */
export function classifyComplexity(
  context: CostRequestContext,
  config: ComplexityRouterConfig
): ComplexityResult {
  const { prompt, taskType } = context;
  const tokenCount = estimateTokenCount(prompt);

  // Check explicit rules first
  for (const rule of config.rules) {
    const regex = new RegExp(rule.pattern, 'i');

    // Match by pattern in prompt
    if (regex.test(prompt)) {
      return {
        level: rule.complexity,
        model: rule.model,
        maxTokens: rule.maxTokens,
        matchedRule: rule,
        reason: `Pattern match: "${rule.pattern}"`,
      };
    }

    // Match by task type
    if (taskType && rule.taskType === taskType) {
      return {
        level: rule.complexity,
        model: rule.model,
        maxTokens: rule.maxTokens,
        matchedRule: rule,
        reason: `Task type match: "${rule.taskType}"`,
      };
    }
  }

  // Fall back to heuristic classification based on token count and patterns
  const level = classifyByHeuristics(prompt, tokenCount, config.thresholds);
  const model = selectModelForComplexity(level, config);

  return {
    level,
    model,
    reason: `Heuristic classification (${tokenCount} tokens)`,
  };
}

/**
 * Classify complexity using heuristics
 */
function classifyByHeuristics(
  prompt: string,
  tokenCount: number,
  thresholds: ComplexityRouterConfig['thresholds']
): ComplexityLevel {
  // Structural complexity indicators
  const hasCode = /```[\s\S]*```/.test(prompt);
  const hasMultipleSteps = /(step\s*\d|first|second|third|then|finally)/i.test(prompt);
  const hasNestedContext = prompt.split('\n').length > 20;
  const hasComplexQueries = /(explain|analyze|compare|evaluate|design)/i.test(prompt);

  // Calculate complexity score
  let score = tokenCount;

  if (hasCode) score *= 1.3;
  if (hasMultipleSteps) score *= 1.2;
  if (hasNestedContext) score *= 1.2;
  if (hasComplexQueries) score *= 1.5;

  // Classify based on score and thresholds
  if (score < thresholds.simple) {
    return 'simple';
  } else if (score < thresholds.moderate) {
    return 'moderate';
  } else if (score < thresholds.complex) {
    return 'complex';
  } else {
    return 'expert';
  }
}

/**
 * Select model based on complexity level
 */
function selectModelForComplexity(
  level: ComplexityLevel,
  config: ComplexityRouterConfig
): string {
  // Find first rule that matches complexity
  for (const rule of config.rules) {
    if (rule.complexity === level) {
      return rule.model;
    }
  }

  // Default model selection by complexity
  switch (level) {
    case 'simple':
      return 'claude-haiku-3-5';
    case 'moderate':
      return config.defaultModel;
    case 'complex':
      return 'claude-sonnet-4';
    case 'expert':
      return 'claude-opus-4';
    default:
      return config.defaultModel;
  }
}

/**
 * Create a complexity classifier
 */
export function createComplexityClassifier(config: ComplexityRouterConfig) {
  return {
    /**
     * Classify request complexity
     */
    classify(context: CostRequestContext): ComplexityResult {
      return classifyComplexity(context, config);
    },

    /**
     * Get model for specific complexity level
     */
    getModelForLevel(level: ComplexityLevel): string {
      return selectModelForComplexity(level, config);
    },

    /**
     * Check if model is appropriate for complexity
     */
    isModelAppropriate(model: string, level: ComplexityLevel): boolean {
      const expectedModel = selectModelForComplexity(level, config);

      // Models are appropriate if they're the expected model or higher capability
      const modelHierarchy = [
        'claude-haiku-3-5',
        'gpt-4o-mini',
        'claude-sonnet-4',
        'gpt-4o',
        'claude-opus-4',
      ];

      const modelIndex = modelHierarchy.indexOf(model);
      const expectedIndex = modelHierarchy.indexOf(expectedModel);

      // If models aren't in hierarchy, assume appropriate
      if (modelIndex === -1 || expectedIndex === -1) return true;

      return modelIndex >= expectedIndex;
    },
  };
}

export type ComplexityClassifier = ReturnType<typeof createComplexityClassifier>;
