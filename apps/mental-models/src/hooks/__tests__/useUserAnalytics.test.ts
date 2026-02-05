// Tests for useUserAnalytics hook

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserAnalytics } from '../useUserAnalytics';

describe('useUserAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Narrative Tracking', () => {
    it('tracks narrative views', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001', 'Test Narrative');
      });

      const stats = result.current.getStats();
      expect(stats.views.narrativeViews['N001']).toBe(1);
      expect(stats.views.totalViews).toBe(1);
    });

    it('increments view count on multiple views', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
        result.current.trackNarrativeView('N001');
        result.current.trackNarrativeView('N002');
      });

      const stats = result.current.getStats();
      expect(stats.views.narrativeViews['N001']).toBe(2);
      expect(stats.views.narrativeViews['N002']).toBe(1);
      expect(stats.views.totalViews).toBe(3);
    });
  });

  describe('Model Tracking', () => {
    it('tracks mental model views', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackModelView('M001', 'Test Model');
      });

      const stats = result.current.getStats();
      expect(stats.views.modelViews['M001']).toBe(1);
      expect(stats.views.totalViews).toBe(1);
    });

    it('tracks narratives and models separately', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
        result.current.trackModelView('M001');
      });

      const stats = result.current.getStats();
      expect(stats.views.narrativeViews['N001']).toBe(1);
      expect(stats.views.modelViews['M001']).toBe(1);
      expect(stats.views.totalViews).toBe(2);
    });
  });

  describe('Search Tracking', () => {
    it('tracks search queries', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackSearchQuery('test query', 5);
      });

      const stats = result.current.getStats();
      expect(stats.searches.queries).toContain('test query');
      expect(stats.searches.queryCount['test query']).toBe(1);
      expect(stats.searches.totalSearches).toBe(1);
    });

    it('normalizes queries to lowercase', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackSearchQuery('Test Query');
        result.current.trackSearchQuery('TEST QUERY');
      });

      const stats = result.current.getStats();
      expect(stats.searches.queries).toContain('test query');
      expect(stats.searches.queryCount['test query']).toBe(2);
    });

    it('ignores empty queries', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackSearchQuery('');
        result.current.trackSearchQuery('   ');
      });

      const stats = result.current.getStats();
      expect(stats.searches.totalSearches).toBe(0);
    });
  });

  describe('Export Tracking', () => {
    it('tracks export actions', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackExport('json', 5);
      });

      const stats = result.current.getStats();
      expect(stats.exports.formatUsage['json']).toBe(1);
      expect(stats.exports.totalExports).toBe(1);
      expect(stats.exports.averageNarrativeCount).toBe(5);
    });

    it('calculates average narrative count correctly', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackExport('json', 5);
        result.current.trackExport('csv', 10);
        result.current.trackExport('md', 15);
      });

      const stats = result.current.getStats();
      expect(stats.exports.totalExports).toBe(3);
      expect(stats.exports.averageNarrativeCount).toBe(10);
    });
  });

  describe('Filter Tracking', () => {
    it('tracks filter applications', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackFilter('category', 'Test Category');
      });

      const stats = result.current.getStats();
      const filterActions = stats.actions.filter((a) => a.type === 'filter');
      expect(filterActions).toHaveLength(1);
      expect(filterActions[0].data.filterType).toBe('category');
    });
  });

  describe('Query Functions', () => {
    it('returns most viewed narratives', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
        result.current.trackNarrativeView('N001');
        result.current.trackNarrativeView('N001');
        result.current.trackNarrativeView('N002');
        result.current.trackNarrativeView('N002');
        result.current.trackNarrativeView('N003');
      });

      const mostViewed = result.current.getMostViewed('narrative', 2);
      expect(mostViewed).toHaveLength(2);
      expect(mostViewed[0].id).toBe('N001');
      expect(mostViewed[0].count).toBe(3);
      expect(mostViewed[1].id).toBe('N002');
      expect(mostViewed[1].count).toBe(2);
    });

    it('returns top search queries', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackSearchQuery('query1');
        result.current.trackSearchQuery('query1');
        result.current.trackSearchQuery('query2');
      });

      const topSearches = result.current.getTopSearches(2);
      expect(topSearches).toHaveLength(2);
      expect(topSearches[0].query).toBe('query1');
      expect(topSearches[0].count).toBe(2);
    });

    it('returns recent actions in reverse order', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
        result.current.trackSearchQuery('test');
        result.current.trackExport('json', 5);
      });

      const recent = result.current.getRecentActions(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].type).toBe('export');
      expect(recent[1].type).toBe('search');
      expect(recent[2].type).toBe('view');
    });
  });

  describe('Action Limits', () => {
    it('limits stored actions to 100', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        for (let i = 0; i < 150; i++) {
          result.current.trackNarrativeView(`N${i}`);
        }
      });

      const stats = result.current.getStats();
      expect(stats.actions.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Clear Analytics', () => {
    it('clears all analytics data', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
        result.current.trackSearchQuery('test');
        result.current.clearAnalytics();
      });

      const stats = result.current.getStats();
      expect(stats.views.totalViews).toBe(0);
      expect(stats.searches.totalSearches).toBe(0);
      expect(stats.actions).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('persists analytics to localStorage', () => {
      const { result } = renderHook(() => useUserAnalytics());

      act(() => {
        result.current.trackNarrativeView('N001');
      });

      const stored = localStorage.getItem('hummbl_user_analytics');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.views.narrativeViews['N001']).toBe(1);
    });

    it('loads analytics from localStorage', () => {
      // Set up initial data
      const { result: result1 } = renderHook(() => useUserAnalytics());
      act(() => {
        result1.current.trackNarrativeView('N001');
      });

      // Create new hook instance (simulating page reload)
      const { result: result2 } = renderHook(() => useUserAnalytics());
      const stats = result2.current.getStats();

      expect(stats.views.narrativeViews['N001']).toBe(1);
    });
  });

  describe('Session Duration', () => {
    it('tracks session duration', () => {
      const { result } = renderHook(() => useUserAnalytics());

      // Advance time by 1 minute
      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });

      // Trigger save by adding an action
      act(() => {
        result.current.trackNarrativeView('N001');
      });

      const stats = result.current.getStats();
      expect(stats.sessionDuration).toBeGreaterThan(0);
    });
  });
});
