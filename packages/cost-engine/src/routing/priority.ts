/**
 * Priority Tier Assignment
 *
 * Assigns priority tiers to requests based on rules.
 */

import type {
  PriorityTier,
  PriorityTierConfig,
  PriorityRule,
  CostRequestContext,
} from '../types.js';

interface PriorityResult {
  tier: PriorityTier;
  matchedRule?: PriorityRule;
  reason: string;
}

/**
 * Assign priority tier to a request
 */
export function assignPriority(
  context: CostRequestContext,
  config: PriorityTierConfig
): PriorityResult {
  const { prompt, taskType, source, priority } = context;

  // If priority is explicitly set, use it
  if (priority) {
    return {
      tier: priority,
      reason: 'Explicitly set in request context',
    };
  }

  // Check rules
  for (const rule of config.rules) {
    const matches = checkRule(rule, prompt, taskType, source);
    if (matches) {
      return {
        tier: rule.tier,
        matchedRule: rule,
        reason: `Rule match: "${rule.pattern}"`,
      };
    }
  }

  // Default tier
  return {
    tier: config.defaultTier,
    reason: 'Default tier (no rules matched)',
  };
}

/**
 * Check if a rule matches the context
 */
function checkRule(
  rule: PriorityRule,
  prompt: string,
  taskType?: string,
  source?: string
): boolean {
  // Check pattern against prompt
  const regex = new RegExp(rule.pattern, 'i');
  if (!regex.test(prompt)) {
    return false;
  }

  // Check task type if specified
  if (rule.taskType && rule.taskType !== taskType) {
    return false;
  }

  // Check source if specified
  if (rule.source && rule.source !== source) {
    return false;
  }

  return true;
}

/**
 * Get priority tier weight for sorting/comparison
 */
export function getTierWeight(tier: PriorityTier): number {
  const weights: Record<PriorityTier, number> = {
    critical: 100,
    high: 75,
    normal: 50,
    low: 25,
    batch: 0,
  };
  return weights[tier];
}

/**
 * Compare two priority tiers
 */
export function compareTiers(a: PriorityTier, b: PriorityTier): number {
  return getTierWeight(b) - getTierWeight(a);
}

/**
 * Create a priority classifier
 */
export function createPriorityClassifier(config: PriorityTierConfig) {
  return {
    /**
     * Assign priority to request
     */
    assign(context: CostRequestContext): PriorityResult {
      return assignPriority(context, config);
    },

    /**
     * Get tier weight
     */
    getWeight(tier: PriorityTier): number {
      return getTierWeight(tier);
    },

    /**
     * Check if tier A has higher priority than tier B
     */
    isHigherPriority(a: PriorityTier, b: PriorityTier): boolean {
      return getTierWeight(a) > getTierWeight(b);
    },

    /**
     * Get all tiers sorted by priority
     */
    getSortedTiers(): PriorityTier[] {
      return ['critical', 'high', 'normal', 'low', 'batch'];
    },
  };
}

export type PriorityClassifier = ReturnType<typeof createPriorityClassifier>;
