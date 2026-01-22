// Tests for advanced search

import { describe, it, expect } from 'vitest';
import { searchNarratives, searchMentalModels, getSearchSuggestions } from '../advancedSearch';
import type { Narrative } from '../../../cascade/types/narrative';

describe('Advanced Search', () => {
  const mockNarratives: Narrative[] = [
    {
      id: 'N001',
      narrative_id: 'N001',
      version: '1.0',
      provenance_hash: 'abc123',
      title: 'Cognitive Bias in Decision Making',
      content: 'Detailed content about cognitive biases...',
      summary: 'How cognitive biases affect our decisions',
      category: 'Psychology',
      evidence_quality: 'A',
      confidence: 0.95,
      domain: ['Psychology', 'Decision Science'],
      tags: ['bias', 'decision-making', 'psychology'],
      linked_signals: [],
      relationships: [],
      citations: [],
      examples: [],
      elicitation_methods: [],
      related_frameworks: [],
      changelog: [],
      complexity: {
        cognitive_load: 'Medium',
        time_to_elicit: '1-2 hours',
        expertise_required: 'Intermediate',
      },
    },
    {
      id: 'N002',
      narrative_id: 'N002',
      version: '1.0',
      provenance_hash: 'def456',
      title: 'Systems Thinking Approach',
      content: 'Detailed content about systems thinking...',
      summary: 'Understanding complex systems through holistic thinking',
      category: 'Systems Theory',
      evidence_quality: 'B',
      confidence: 0.88,
      domain: ['Systems Theory'],
      tags: ['systems', 'complexity', 'thinking'],
      linked_signals: [],
      relationships: [],
      citations: [],
      examples: [],
      elicitation_methods: [],
      related_frameworks: [],
      changelog: [],
      complexity: {
        cognitive_load: 'Medium',
        time_to_elicit: '1-2 hours',
        expertise_required: 'Intermediate',
      },
    },
  ];

  describe('searchNarratives', () => {
    it('finds exact matches', () => {
      const results = searchNarratives(mockNarratives, 'Cognitive Bias');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.narrative_id).toBe('N001');
      expect(results[0].score).toBeGreaterThanOrEqual(0.9);
    });

    it('finds fuzzy matches', () => {
      const results = searchNarratives(mockNarratives, 'cognitiv');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.title).toContain('Cognitive');
    });

    it('searches across multiple fields', () => {
      const results = searchNarratives(mockNarratives, 'psychology');

      expect(results.length).toBeGreaterThan(0);
      const firstResult = results[0];
      expect(
        firstResult.matches.some(
          (m) => m.field === 'category' || m.field === 'tags' || m.field === 'domain'
        )
      ).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const results = searchNarratives(mockNarratives, 'quantum physics');

      expect(results).toHaveLength(0);
    });

    it('returns empty array for empty query', () => {
      const results = searchNarratives(mockNarratives, '');

      expect(results).toHaveLength(0);
    });

    it('respects maxResults option', () => {
      const results = searchNarratives(mockNarratives, 'thinking', {
        maxResults: 1,
      });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('respects fuzzyThreshold option', () => {
      const strictResults = searchNarratives(mockNarratives, 'cognitiv', {
        fuzzyThreshold: 0.8,
      });

      const lenientResults = searchNarratives(mockNarratives, 'cognitiv', {
        fuzzyThreshold: 0.3,
      });

      expect(strictResults.length).toBeLessThanOrEqual(lenientResults.length);
    });

    it('includes highlights when requested', () => {
      const results = searchNarratives(mockNarratives, 'cognitive', {
        includeHighlights: true,
      });

      expect(results[0].highlights).toBeDefined();
      expect(Object.keys(results[0].highlights!).length).toBeGreaterThan(0);
    });

    it('excludes highlights when not requested', () => {
      const results = searchNarratives(mockNarratives, 'cognitive', {
        includeHighlights: false,
      });

      expect(results[0].highlights).toBeUndefined();
    });

    it('searches specific fields only', () => {
      const results = searchNarratives(mockNarratives, 'psychology', {
        fields: ['tags'],
      });

      if (results.length > 0) {
        expect(results[0].matches.every((m) => m.field === 'tags')).toBe(true);
      }
    });

    it('handles case sensitivity', () => {
      const caseSensitive = searchNarratives(mockNarratives, 'Cognitive', {
        caseSensitive: true,
      });

      const caseInsensitive = searchNarratives(mockNarratives, 'cognitive', {
        caseSensitive: false,
      });

      expect(caseInsensitive.length).toBeGreaterThanOrEqual(caseSensitive.length);
    });

    it('sorts results by relevance score', () => {
      const results = searchNarratives(mockNarratives, 'thinking');

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe('getSearchSuggestions', () => {
    const recentSearches = [
      'cognitive bias',
      'systems thinking',
      'decision making',
      'complex systems',
    ];

    it('returns recent searches when query is empty', () => {
      const suggestions = getSearchSuggestions('', recentSearches, 3);

      expect(suggestions).toHaveLength(3);
      expect(suggestions).toEqual(recentSearches.slice(0, 3));
    });

    it('filters suggestions based on query', () => {
      const suggestions = getSearchSuggestions('cogn', recentSearches);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toBe('cognitive bias');
    });

    it('respects maxSuggestions limit', () => {
      const suggestions = getSearchSuggestions('system', recentSearches, 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('returns empty array when no matches', () => {
      const suggestions = getSearchSuggestions('quantum', recentSearches);

      expect(suggestions).toHaveLength(0);
    });

    it('handles partial matches', () => {
      const suggestions = getSearchSuggestions('sys', recentSearches);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes('system'))).toBe(true);
    });
  });
});
