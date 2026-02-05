// Tests for search weighting

import { describe, it, expect } from 'vitest';
import {
  applySemanticWeights,
  reRankResults,
  getFieldWeight,
  updateWeightsFromFeedback,
  createCustomWeights,
  normalizeWeights,
  calculateRelevanceScore,
  DEFAULT_WEIGHTS,
  type SearchResult,
  type FieldWeight,
} from '../searchWeighting';

describe('Search Weighting', () => {
  const mockResults: SearchResult<unknown>[] = [
    {
      item: { id: '1', title: 'Test Item 1' },
      score: 0.8,
      matches: [
        { field: 'title', indices: [[0, 4]], score: 0.9 },
        { field: 'summary', indices: [[5, 10]], score: 0.7 },
      ],
    },
    {
      item: { id: '2', title: 'Test Item 2' },
      score: 0.6,
      matches: [{ field: 'category', indices: [[0, 5]], score: 0.6 }],
    },
  ];

  const testWeights: FieldWeight[] = [
    { field: 'title', weight: 1.0, boostExact: 2.0 },
    { field: 'summary', weight: 0.5 },
    { field: 'category', weight: 0.8 },
  ];

  describe('applySemanticWeights', () => {
    it('applies weights to search results', () => {
      const weighted = applySemanticWeights(mockResults, testWeights);

      expect(weighted).toHaveLength(mockResults.length);
      expect(weighted[0].score).toBeDefined();
    });

    it('boosts exact matches', () => {
      const exactMatchResult: SearchResult<unknown> = {
        item: { id: '3' },
        score: 0.95,
        matches: [{ field: 'title', indices: [[0, 5]], score: 0.96 }],
      };

      const weighted = applySemanticWeights([exactMatchResult], testWeights);

      expect(weighted[0].score).toBeGreaterThan(exactMatchResult.score);
    });

    it('respects field weights', () => {
      const titleMatch: SearchResult<unknown> = {
        item: { id: '1' },
        score: 0.8,
        matches: [{ field: 'title', indices: [], score: 0.8 }],
      };

      const summaryMatch: SearchResult<unknown> = {
        item: { id: '2' },
        score: 0.8,
        matches: [{ field: 'summary', indices: [], score: 0.8 }],
      };

      const weighted = applySemanticWeights([titleMatch, summaryMatch], testWeights);

      // Title has higher weight (1.0 vs 0.5), should score higher or equal
      expect(weighted[0].score).toBeGreaterThanOrEqual(weighted[1].score);
    });
  });

  describe('reRankResults', () => {
    it('re-ranks results by weighted score', () => {
      const reranked = reRankResults(mockResults, testWeights);

      expect(reranked).toHaveLength(mockResults.length);

      // Results should be sorted by score descending
      for (let i = 1; i < reranked.length; i++) {
        expect(reranked[i - 1].score).toBeGreaterThanOrEqual(reranked[i].score);
      }
    });
  });

  describe('getFieldWeight', () => {
    it('returns field weight for narratives', () => {
      const weight = getFieldWeight('title', 'narrative');

      expect(weight).toBeDefined();
      expect(weight?.field).toBe('title');
      expect(weight?.weight).toBeGreaterThan(0);
    });

    it('returns field weight for mental models', () => {
      const weight = getFieldWeight('name', 'mentalModel');

      expect(weight).toBeDefined();
      expect(weight?.field).toBe('name');
    });

    it('returns undefined for unknown field', () => {
      const weight = getFieldWeight('nonexistent', 'narrative');

      expect(weight).toBeUndefined();
    });

    it('uses custom weights when provided', () => {
      const customWeights = {
        narrative: [{ field: 'custom', weight: 0.9 }],
        mentalModel: [],
      };

      const weight = getFieldWeight('custom', 'narrative', customWeights);

      expect(weight).toBeDefined();
      expect(weight?.weight).toBe(0.9);
    });
  });

  describe('updateWeightsFromFeedback', () => {
    it('increases weight for clicked field', () => {
      const originalWeights = [
        { field: 'title', weight: 0.7 },
        { field: 'summary', weight: 0.5 },
        { field: 'category', weight: 0.8 },
      ];
      const updated = updateWeightsFromFeedback(originalWeights, 'title');

      const titleWeight = updated.find((w) => w.field === 'title');
      const originalTitleWeight = originalWeights.find((w) => w.field === 'title');

      expect(titleWeight?.weight).toBeGreaterThan(originalTitleWeight?.weight || 0);
    });

    it('decreases weight for other fields', () => {
      const updated = updateWeightsFromFeedback(testWeights, 'title');

      const summaryWeight = updated.find((w) => w.field === 'summary');
      const originalSummaryWeight = testWeights.find((w) => w.field === 'summary');

      expect(summaryWeight?.weight).toBeLessThan(originalSummaryWeight?.weight || 1);
    });

    it('caps weight at 1.0', () => {
      let weights = testWeights;
      for (let i = 0; i < 10; i++) {
        weights = updateWeightsFromFeedback(weights, 'title');
      }

      const titleWeight = weights.find((w) => w.field === 'title');
      expect(titleWeight?.weight).toBeLessThanOrEqual(1.0);
    });

    it('maintains minimum weight of 0.1', () => {
      let weights = testWeights;
      for (let i = 0; i < 20; i++) {
        weights = updateWeightsFromFeedback(weights, 'title');
      }

      for (const weight of weights) {
        expect(weight.weight).toBeGreaterThanOrEqual(0.1);
      }
    });
  });

  describe('createCustomWeights', () => {
    it('creates custom weights with overrides', () => {
      const overrides = { title: 0.5, summary: 0.3 };
      const custom = createCustomWeights(testWeights, overrides);

      expect(custom.find((w) => w.field === 'title')?.weight).toBe(0.5);
      expect(custom.find((w) => w.field === 'summary')?.weight).toBe(0.3);
    });

    it('preserves non-overridden weights', () => {
      const overrides = { title: 0.5 };
      const custom = createCustomWeights(testWeights, overrides);

      const categoryWeight = custom.find((w) => w.field === 'category');
      const originalCategoryWeight = testWeights.find((w) => w.field === 'category');

      expect(categoryWeight?.weight).toBe(originalCategoryWeight?.weight);
    });
  });

  describe('normalizeWeights', () => {
    it('normalizes weights to sum to 1.0', () => {
      const normalized = normalizeWeights(testWeights, 1.0);

      const sum = normalized.reduce((acc, w) => acc + w.weight, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('normalizes weights to custom sum', () => {
      const normalized = normalizeWeights(testWeights, 2.0);

      const sum = normalized.reduce((acc, w) => acc + w.weight, 0);
      expect(sum).toBeCloseTo(2.0, 5);
    });

    it('handles zero sum gracefully', () => {
      const zeroWeights: FieldWeight[] = [
        { field: 'a', weight: 0 },
        { field: 'b', weight: 0 },
      ];

      const normalized = normalizeWeights(zeroWeights);

      expect(normalized).toEqual(zeroWeights);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('calculates relevance score', () => {
      const score = calculateRelevanceScore({
        textMatch: 0.9,
        fieldImportance: 0.8,
        recency: 0.7,
        popularity: 0.6,
        userAffinity: 0.5,
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('weights text match most heavily', () => {
      const highTextMatch = calculateRelevanceScore({
        textMatch: 1.0,
        fieldImportance: 0.0,
      });

      const lowTextMatch = calculateRelevanceScore({
        textMatch: 0.0,
        fieldImportance: 1.0,
      });

      expect(highTextMatch).toBeGreaterThan(lowTextMatch);
    });

    it('handles missing optional factors', () => {
      const score = calculateRelevanceScore({
        textMatch: 0.8,
        fieldImportance: 0.7,
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('caps score at 1.0', () => {
      const score = calculateRelevanceScore({
        textMatch: 1.0,
        fieldImportance: 1.0,
        recency: 1.0,
        popularity: 1.0,
        userAffinity: 1.0,
      });

      expect(score).toBe(1.0);
    });
  });

  describe('DEFAULT_WEIGHTS', () => {
    it('has narrative weights', () => {
      expect(DEFAULT_WEIGHTS.narrative).toBeDefined();
      expect(DEFAULT_WEIGHTS.narrative.length).toBeGreaterThan(0);
    });

    it('has mental model weights', () => {
      expect(DEFAULT_WEIGHTS.mentalModel).toBeDefined();
      expect(DEFAULT_WEIGHTS.mentalModel.length).toBeGreaterThan(0);
    });

    it('title/name has highest weight', () => {
      const narrativeTitleWeight = DEFAULT_WEIGHTS.narrative.find((w) => w.field === 'title');
      const narrativeOtherWeights = DEFAULT_WEIGHTS.narrative.filter((w) => w.field !== 'title');

      expect(
        narrativeOtherWeights.every((w) => (narrativeTitleWeight?.weight || 0) >= w.weight)
      ).toBe(true);

      const modelNameWeight = DEFAULT_WEIGHTS.mentalModel.find((w) => w.field === 'name');
      const modelOtherWeights = DEFAULT_WEIGHTS.mentalModel.filter((w) => w.field !== 'name');

      expect(modelOtherWeights.every((w) => (modelNameWeight?.weight || 0) >= w.weight)).toBe(true);
    });
  });
});
