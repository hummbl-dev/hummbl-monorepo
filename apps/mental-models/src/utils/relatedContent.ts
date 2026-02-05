// Related content recommendation engine

import type { Narrative } from '../../cascade/types/narrative';
import type { MentalModel } from '../types/mental-model';

export interface RelatedItem {
  id: string;
  type: 'narrative' | 'mentalModel';
  title: string;
  score: number;
  reason: string;
}

/**
 * Calculate similarity score between two arrays
 */
function arraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map((s) => s.toLowerCase()));
  const set2 = new Set(arr2.map((s) => s.toLowerCase()));

  const intersection = [...set1].filter((x) => set2.has(x));
  const union = new Set([...set1, ...set2]);

  return intersection.length / union.size;
}

/**
 * Calculate text similarity (simple word overlap)
 */
function textSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(Boolean);
  const words2 = text2.toLowerCase().split(/\W+/).filter(Boolean);

  return arraySimilarity(words1, words2);
}

/**
 * Find related narratives
 */
export function findRelatedNarratives(
  currentNarrative: Narrative,
  allNarratives: Narrative[],
  limit = 5
): RelatedItem[] {
  const related: RelatedItem[] = [];

  for (const narrative of allNarratives) {
    // Skip the current narrative
    if (narrative.narrative_id === currentNarrative.narrative_id) continue;

    let score = 0;
    const reasons: string[] = [];

    // Same category (high weight)
    if (narrative.category === currentNarrative.category) {
      score += 0.4;
      reasons.push('same category');
    }

    // Tag similarity
    const tagSimilarity = arraySimilarity(currentNarrative.tags || [], narrative.tags || []);
    if (tagSimilarity > 0) {
      score += tagSimilarity * 0.3;
      reasons.push('similar tags');
    }

    // Domain similarity
    const domainSimilarity = arraySimilarity(currentNarrative.domain || [], narrative.domain || []);
    if (domainSimilarity > 0) {
      score += domainSimilarity * 0.2;
    }

    // Summary similarity
    const summarySimilarity = textSimilarity(currentNarrative.summary, narrative.summary);
    if (summarySimilarity > 0.05) {
      score += summarySimilarity * 0.1;
      reasons.push('similar content');
    }

    // Evidence quality bonus (prefer high quality)
    if (narrative.evidence_quality === currentNarrative.evidence_quality) {
      score += 0.05;
    }

    if (score > 0.1) {
      related.push({
        id: narrative.narrative_id,
        type: 'narrative',
        title: narrative.title,
        score,
        reason: reasons.join(', ') || 'related content',
      });
    }
  }

  // Sort by score and return top N
  return related.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Find related mental models
 */
export function findRelatedMentalModels(
  currentModel: MentalModel,
  allModels: MentalModel[],
  limit = 5
): RelatedItem[] {
  const related: RelatedItem[] = [];

  for (const model of allModels) {
    // Skip the current model
    if (model.code === currentModel.code) continue;

    let score = 0;
    const reasons: string[] = [];

    // Same category (high weight)
    if (model.transformation === currentModel.transformation) {
      score += 0.5;
      reasons.push('same category');
    }

    // Tag similarity
    const tagSimilarity = arraySimilarity(currentModel.tags || [], model.tags || []);
    if (tagSimilarity > 0) {
      score += tagSimilarity * 0.3;
      reasons.push('similar tags');
    }

    // Description similarity
    const descSimilarity = textSimilarity(currentModel.definition || '', model.definition || '');
    if (descSimilarity > 0.05) {
      score += descSimilarity * 0.2;
      reasons.push('similar description');
    }

    // Same difficulty level
    if (model.complexity === currentModel.complexity) {
      score += 0.05;
    }

    if (score > 0.1) {
      related.push({
        id: model.code,
        type: 'mentalModel',
        title: model.name,
        score,
        reason: reasons.join(', ') || 'related content',
      });
    }
  }

  // Sort by score and return top N
  return related.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Find cross-type related content (narratives for models, models for narratives)
 */
export function findCrossTypeRelated(
  currentItem: { title: string; category?: string; tags?: string[]; description?: string },
  otherItems: Array<{
    id: string;
    title: string;
    category?: string;
    tags?: string[];
    type: 'narrative' | 'mentalModel';
  }>,
  limit = 3
): RelatedItem[] {
  const related: RelatedItem[] = [];

  for (const item of otherItems) {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (item.category && currentItem.category === item.category) {
      score += 0.4;
      reasons.push('related category');
    }

    // Tag similarity
    if (currentItem.tags && item.tags) {
      const tagSimilarity = arraySimilarity(currentItem.tags, item.tags);
      if (tagSimilarity > 0) {
        score += tagSimilarity * 0.4;
        reasons.push('related topics');
      }
    }

    // Title similarity
    const titleSimilarity = textSimilarity(currentItem.title, item.title);
    if (titleSimilarity > 0.1) {
      score += titleSimilarity * 0.2;
    }

    if (score > 0.1) {
      related.push({
        id: item.id,
        type: item.type,
        title: item.title,
        score,
        reason: reasons.join(', ') || 'related content',
      });
    }
  }

  return related.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get recommendations based on user history
 */
export function getHistoryBasedRecommendations(
  viewedItems: Array<{
    type: 'narrative' | 'mentalModel';
    itemId: string;
    tags?: string[];
    category?: string;
  }>,
  allNarratives: Narrative[],
  allModels: MentalModel[],
  limit = 5
): RelatedItem[] {
  // Extract patterns from history
  const tagCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const viewedIds = new Set<string>();

  viewedItems.forEach((item) => {
    viewedIds.add(item.itemId);

    item.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });

    if (item.category) {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
    }
  });

  // Get top tags and categories
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const recommendations: RelatedItem[] = [];

  // Score narratives
  allNarratives.forEach((narrative) => {
    if (viewedIds.has(narrative.narrative_id)) return;

    let score = 0;

    // Category match
    if (topCategories.includes(narrative.category)) {
      score += 0.5;
    }

    // Tag match
    const matchingTags = (narrative.tags || []).filter((tag: string) => topTags.includes(tag));
    score += matchingTags.length * 0.2;

    if (score > 0) {
      recommendations.push({
        id: narrative.narrative_id,
        type: 'narrative',
        title: narrative.title,
        score,
        reason: 'based on your history',
      });
    }
  });

  // Score mental models
  allModels.forEach((model) => {
    if (viewedIds.has(model.code)) return;

    let score = 0;

    // Category match
    if (model.transformation && topCategories.includes(model.transformation)) {
      score += 0.5;
    }

    // Tag match
    const matchingTags = (model.tags || []).filter((tag) => topTags.includes(tag));
    score += matchingTags.length * 0.2;

    if (score > 0) {
      recommendations.push({
        id: model.code,
        type: 'mentalModel',
        title: model.name,
        score,
        reason: 'based on your history',
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get "you might also like" recommendations
 */
export function getYouMightAlsoLike(
  currentItem: {
    id: string;
    type: 'narrative' | 'mentalModel';
    category?: string;
    tags?: string[];
  },
  bookmarkedItems: string[],
  recentlyViewed: string[],
  allItems: Array<{
    id: string;
    type: 'narrative' | 'mentalModel';
    title: string;
    category?: string;
    tags?: string[];
  }>,
  limit = 4
): RelatedItem[] {
  const excludeIds = new Set([
    currentItem.id,
    ...bookmarkedItems,
    ...recentlyViewed.slice(0, 3), // Exclude very recently viewed
  ]);

  const recommendations: RelatedItem[] = [];

  for (const item of allItems) {
    if (excludeIds.has(item.id)) continue;

    let score = 0;
    const reasons: string[] = [];

    // Same category
    if (item.category === currentItem.category) {
      score += 0.3;
      reasons.push('same category');
    }

    // Tag similarity
    if (currentItem.tags && item.tags) {
      const similarity = arraySimilarity(currentItem.tags, item.tags);
      if (similarity > 0) {
        score += similarity * 0.5;
        reasons.push('similar topics');
      }
    }

    // Cross-type boost
    if (item.type !== currentItem.type) {
      score += 0.1;
      reasons.push('discover new type');
    }

    if (score > 0.1) {
      recommendations.push({
        id: item.id,
        type: item.type,
        title: item.title,
        score,
        reason: reasons.join(', '),
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}
