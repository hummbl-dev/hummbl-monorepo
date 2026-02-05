// Semantic search weighting system for custom field ranking

import type { SearchResult } from './advancedSearch';

export interface FieldWeight {
  field: string;
  weight: number; // 0-1, higher = more important
  boostExact?: number; // Multiplier for exact matches
  boostPrefix?: number; // Multiplier for prefix matches
}

export interface WeightConfig {
  narrative: FieldWeight[];
  mentalModel: FieldWeight[];
}

/**
 * Default weight configuration
 */
export const DEFAULT_WEIGHTS: WeightConfig = {
  narrative: [
    { field: 'title', weight: 1.0, boostExact: 2.0, boostPrefix: 1.5 },
    { field: 'category', weight: 0.8, boostExact: 1.8, boostPrefix: 1.3 },
    { field: 'tags', weight: 0.7, boostExact: 1.5, boostPrefix: 1.2 },
    { field: 'summary', weight: 0.5, boostExact: 1.2, boostPrefix: 1.1 },
    { field: 'domain', weight: 0.6, boostExact: 1.4, boostPrefix: 1.2 },
    { field: 'evidence_quality', weight: 0.4, boostExact: 1.3 },
  ],
  mentalModel: [
    { field: 'name', weight: 1.0, boostExact: 2.0, boostPrefix: 1.5 },
    { field: 'category', weight: 0.8, boostExact: 1.8, boostPrefix: 1.3 },
    { field: 'tags', weight: 0.7, boostExact: 1.5, boostPrefix: 1.2 },
    { field: 'description', weight: 0.5, boostExact: 1.2, boostPrefix: 1.1 },
    { field: 'difficulty', weight: 0.3, boostExact: 1.2 },
  ],
};

/**
 * Context-aware weight adjustments
 */
export interface SearchContext {
  userPreferences?: {
    preferredCategories?: string[];
    preferredTags?: string[];
    recentSearches?: string[];
  };
  sessionData?: {
    mostViewedFields?: string[];
    searchHistory?: Array<{ query: string; selectedField: string }>;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Apply semantic weights to search results
 */
export function applySemanticWeights<T>(
  results: SearchResult<T>[],
  weights: FieldWeight[],
  context?: SearchContext
): SearchResult<T>[] {
  const weightMap = new Map(weights.map((w) => [w.field, w]));

  return results.map((result) => {
    let adjustedScore = 0;
    let totalWeight = 0;

    for (const match of result.matches) {
      const fieldWeight = weightMap.get(match.field);
      if (!fieldWeight) continue;

      let matchScore = match.score;

      // Apply boost for exact matches
      if (fieldWeight.boostExact && match.score >= 0.95) {
        matchScore *= fieldWeight.boostExact;
      }
      // Apply boost for prefix matches
      else if (fieldWeight.boostPrefix && match.score >= 0.8) {
        matchScore *= fieldWeight.boostPrefix;
      }

      // Apply context-aware adjustments
      if (context) {
        matchScore *= getContextualBoost(match.field, context);
      }

      adjustedScore += matchScore * fieldWeight.weight;
      totalWeight += fieldWeight.weight;
    }

    const normalizedScore = totalWeight > 0 ? adjustedScore / totalWeight : 0;

    return {
      ...result,
      score: normalizedScore,
    };
  });
}

/**
 * Get contextual boost for a field based on user behavior
 */
function getContextualBoost(field: string, context: SearchContext): number {
  let boost = 1.0;

  // Boost fields that match user preferences
  if (context.userPreferences) {
    const { preferredCategories, preferredTags } = context.userPreferences;

    if (field === 'category' && preferredCategories && preferredCategories.length > 0) {
      boost *= 1.2;
    }

    if (field === 'tags' && preferredTags && preferredTags.length > 0) {
      boost *= 1.15;
    }
  }

  // Boost fields that user frequently interacts with
  if (context.sessionData?.mostViewedFields?.includes(field)) {
    boost *= 1.1;
  }

  // Time-based relevance (example: boost practical content in morning)
  if (context.timeOfDay === 'morning' && field === 'description') {
    boost *= 1.05;
  }

  return boost;
}

/**
 * Calculate relevance score based on multiple factors
 */
export interface RelevanceFactors {
  textMatch: number; // 0-1, how well text matches
  fieldImportance: number; // 0-1, importance of field
  recency?: number; // 0-1, how recent the content is
  popularity?: number; // 0-1, how popular the content is
  userAffinity?: number; // 0-1, how much user likes similar content
}

export function calculateRelevanceScore(factors: RelevanceFactors): number {
  const weights = {
    textMatch: 0.5,
    fieldImportance: 0.25,
    recency: 0.1,
    popularity: 0.08,
    userAffinity: 0.07,
  };

  let score =
    factors.textMatch * weights.textMatch + factors.fieldImportance * weights.fieldImportance;

  if (factors.recency !== undefined) {
    score += factors.recency * weights.recency;
  }

  if (factors.popularity !== undefined) {
    score += factors.popularity * weights.popularity;
  }

  if (factors.userAffinity !== undefined) {
    score += factors.userAffinity * weights.userAffinity;
  }

  return Math.min(score, 1.0);
}

/**
 * Re-rank search results based on semantic weights and context
 */
export function reRankResults<T>(
  results: SearchResult<T>[],
  weights: FieldWeight[],
  context?: SearchContext
): SearchResult<T>[] {
  const weighted = applySemanticWeights(results, weights, context);

  // Sort by adjusted score
  weighted.sort((a, b) => b.score - a.score);

  return weighted;
}

/**
 * Get field weight by name
 */
export function getFieldWeight(
  field: string,
  type: 'narrative' | 'mentalModel',
  customWeights?: WeightConfig
): FieldWeight | undefined {
  const weights = customWeights || DEFAULT_WEIGHTS;
  return weights[type].find((w) => w.field === field);
}

/**
 * Update field weights based on user feedback
 */
export function updateWeightsFromFeedback(
  currentWeights: FieldWeight[],
  fieldClicked: string,
  adjustmentFactor = 0.05
): FieldWeight[] {
  return currentWeights.map((weight) => {
    if (weight.field === fieldClicked) {
      // Increase weight for clicked field (capped at 1.0)
      return {
        ...weight,
        weight: Math.min(weight.weight + adjustmentFactor, 1.0),
      };
    }
    // Slightly decrease other weights to maintain balance
    return {
      ...weight,
      weight: Math.max(weight.weight - adjustmentFactor / (currentWeights.length - 1), 0.1),
    };
  });
}

/**
 * Create custom weight configuration
 */
export function createCustomWeights(
  baseWeights: FieldWeight[],
  overrides: Partial<Record<string, number>>
): FieldWeight[] {
  return baseWeights.map((weight) => {
    const override = overrides[weight.field];
    if (override !== undefined) {
      return { ...weight, weight: override };
    }
    return weight;
  });
}

/**
 * Normalize weights to ensure they sum to a target value
 */
export function normalizeWeights(weights: FieldWeight[], targetSum = 1.0): FieldWeight[] {
  const currentSum = weights.reduce((sum, w) => sum + w.weight, 0);

  if (currentSum === 0) return weights;

  const factor = targetSum / currentSum;

  return weights.map((weight) => ({
    ...weight,
    weight: weight.weight * factor,
  }));
}

/**
 * Get semantic similarity between query and field content
 * (Simple implementation - can be enhanced with embeddings)
 */
export function getSemanticSimilarity(query: string, content: string): number {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  const contentWords = content.toLowerCase().split(/\s+/);

  let matches = 0;
  for (const word of contentWords) {
    if (queryWords.has(word)) {
      matches++;
    }
  }

  return contentWords.length > 0 ? matches / contentWords.length : 0;
}

/**
 * Boost results based on user's search history patterns
 */
export function applyHistoryBoost<T>(
  results: SearchResult<T>[],
  searchHistory: Array<{ query: string; selectedField: string }>,
  boostFactor = 1.2
): SearchResult<T>[] {
  if (searchHistory.length === 0) return results;

  // Determine which fields user clicks on most
  const fieldCounts = new Map<string, number>();
  for (const entry of searchHistory) {
    fieldCounts.set(entry.selectedField, (fieldCounts.get(entry.selectedField) || 0) + 1);
  }

  const totalClicks = searchHistory.length;
  const fieldProbabilities = new Map<string, number>();
  for (const [field, count] of fieldCounts) {
    fieldProbabilities.set(field, count / totalClicks);
  }

  return results.map((result) => {
    let historyBoost = 1.0;

    for (const match of result.matches) {
      const probability = fieldProbabilities.get(match.field) || 0;
      if (probability > 0.3) {
        // User clicks this field frequently
        historyBoost *= 1 + probability * (boostFactor - 1);
      }
    }

    return {
      ...result,
      score: result.score * historyBoost,
    };
  });
}
