// Tests for recommendationEngine

import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine } from '../recommendationEngine';
import type { ContentItem } from '../recommendationEngine';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let corpus: ContentItem[];

  beforeEach(() => {
    localStorage.clear();
    engine = new RecommendationEngine('test-user');

    corpus = [
      {
        id: '1',
        type: 'mentalModel',
        title: 'First Principles',
        content: 'Breaking down complex problems',
        category: 'Thinking',
        tags: ['reasoning', 'problem-solving'],
        difficulty: 'Advanced',
      },
      {
        id: '2',
        type: 'narrative',
        title: 'AI Evolution',
        content: 'History of artificial intelligence',
        category: 'Technology',
        tags: ['AI', 'history'],
      },
      {
        id: '3',
        type: 'mentalModel',
        title: 'Systems Thinking',
        content: 'Understanding complex systems',
        category: 'Thinking',
        tags: ['systems', 'complexity'],
        difficulty: 'Intermediate',
      },
    ];
  });

  describe('Profile Management', () => {
    it('creates default profile', () => {
      const profile = engine.getProfile();

      expect(profile.userId).toBe('test-user');
      expect(profile.viewedItems).toEqual([]);
      expect(profile.bookmarkedItems).toEqual([]);
    });

    it('updates profile with viewed items', () => {
      engine.updateProfile({ viewedItem: '1' });

      const profile = engine.getProfile();
      expect(profile.viewedItems).toContain('1');
    });

    it('updates profile with bookmarked items', () => {
      engine.updateProfile({ bookmarkedItem: '2' });

      const profile = engine.getProfile();
      expect(profile.bookmarkedItems).toContain('2');
    });

    it('tracks search history', () => {
      engine.updateProfile({ searchQuery: 'test query' });

      const profile = engine.getProfile();
      expect(profile.searchHistory).toContain('test query');
    });

    it('tracks category preferences', () => {
      engine.updateProfile({ category: 'Thinking' });
      engine.updateProfile({ category: 'Thinking' });

      const profile = engine.getProfile();
      expect(profile.preferences.categories['Thinking']).toBe(2);
    });

    it('resets profile', () => {
      engine.updateProfile({ viewedItem: '1' });
      engine.resetProfile();

      const profile = engine.getProfile();
      expect(profile.viewedItems).toEqual([]);
    });
  });

  describe('Recommendations', () => {
    it('generates recommendations', async () => {
      const recommendations = await engine.getRecommendations(corpus, 2);

      expect(recommendations.length).toBeLessThanOrEqual(2);
      expect(recommendations[0]).toHaveProperty('id');
      expect(recommendations[0]).toHaveProperty('score');
      expect(recommendations[0]).toHaveProperty('reasons');
    });

    it('excludes viewed items from recommendations', async () => {
      engine.updateProfile({ viewedItem: '1' });

      const recommendations = await engine.getRecommendations(corpus, 10, 'collaborative');

      expect(recommendations.find((r) => r.id === '1')).toBeUndefined();
    });

    it('uses hybrid strategy', async () => {
      const recommendations = await engine.getRecommendations(corpus, 5, 'hybrid');

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('provides "because you viewed" recommendations', async () => {
      const recommendations = await engine.getBecauseYouViewed('1', corpus, 2);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].id).not.toBe('1');
    });
  });

  describe('Export/Import', () => {
    it('exports profile', () => {
      engine.updateProfile({ viewedItem: '1' });

      const exported = engine.exportProfile();
      expect(exported).toBeTruthy();
      expect(JSON.parse(exported).viewedItems).toContain('1');
    });

    it('imports profile', () => {
      const profile = {
        userId: 'imported-user',
        viewedItems: ['1', '2'],
        bookmarkedItems: [],
        searchHistory: [],
        preferences: { categories: {}, tags: {}, difficulty: {} },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      engine.importProfile(JSON.stringify(profile));

      const imported = engine.getProfile();
      expect(imported.viewedItems).toEqual(['1', '2']);
    });
  });
});
