// Tests for semanticSearch

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cosineSimilarity,
  euclideanDistance,
  normalizeVector,
  SemanticSearch,
} from '../semanticSearch';

describe('Vector Utilities', () => {
  describe('cosineSimilarity', () => {
    it('calculates similarity for identical vectors', () => {
      const vec = [1, 2, 3];
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0);
    });

    it('calculates similarity for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0.0);
    });

    it('calculates similarity for opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(-1.0);
    });

    it('throws error for different dimensions', () => {
      expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow();
    });
  });

  describe('euclideanDistance', () => {
    it('calculates distance for identical vectors', () => {
      const vec = [1, 2, 3];
      expect(euclideanDistance(vec, vec)).toBe(0);
    });

    it('calculates distance correctly', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [3, 4, 0];
      expect(euclideanDistance(vec1, vec2)).toBe(5);
    });
  });

  describe('normalizeVector', () => {
    it('normalizes vector to unit length', () => {
      const vec = [3, 4];
      const normalized = normalizeVector(vec);

      expect(normalized[0]).toBeCloseTo(0.6);
      expect(normalized[1]).toBeCloseTo(0.8);

      // Check magnitude is 1
      const magnitude = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1.0);
    });
  });
});

describe('SemanticSearch', () => {
  let search: SemanticSearch;

  beforeEach(() => {
    localStorage.clear();
    search = new SemanticSearch({ provider: 'mock', dimensions: 64 });
  });

  describe('Embedding Generation', () => {
    it('generates embeddings', async () => {
      const embedding = await search.generateEmbedding('test text');

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(64);
    });

    it('caches embeddings', async () => {
      const text = 'cached text';

      const embedding1 = await search.generateEmbedding(text);
      const embedding2 = await search.generateEmbedding(text);

      expect(embedding1).toEqual(embedding2);
      expect(search.getCacheSize()).toBeGreaterThan(0);
    });

    it('generates consistent embeddings for same text', async () => {
      const embedding1 = await search.generateEmbedding('consistent');
      const embedding2 = await search.generateEmbedding('consistent');

      expect(embedding1).toEqual(embedding2);
    });
  });

  describe('Semantic Search', () => {
    it('searches for similar content', async () => {
      const corpus = [
        { id: '1', content: 'machine learning algorithms' },
        { id: '2', content: 'deep neural networks' },
        { id: '3', content: 'cooking recipes' },
      ];

      const results = await search.search('artificial intelligence', corpus, 2, 0);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBeDefined();
      expect(results[0].score).toBeGreaterThanOrEqual(0);
      expect(results[0].score).toBeLessThanOrEqual(1);
    });

    it('finds similar items', async () => {
      const corpus = [
        { id: '1', content: 'Python programming' },
        { id: '2', content: 'JavaScript coding' },
        { id: '3', content: 'Cooking pasta' },
      ];

      const results = await search.findSimilar('1', 'Python programming', corpus, 2);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).not.toBe('1'); // Excludes self
    });
  });

  describe('Cache Management', () => {
    it('clears cache', async () => {
      await search.generateEmbedding('test');
      expect(search.getCacheSize()).toBeGreaterThan(0);

      search.clearCache();
      expect(search.getCacheSize()).toBe(0);
    });

    it('exports and imports cache', async () => {
      await search.generateEmbedding('export test');

      const exported = search.exportCache();
      expect(exported).toBeTruthy();

      search.clearCache();
      search.importCache(exported);

      expect(search.getCacheSize()).toBeGreaterThan(0);
    });
  });
});
