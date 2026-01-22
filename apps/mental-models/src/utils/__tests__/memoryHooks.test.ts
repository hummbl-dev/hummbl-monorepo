// Tests for memory hooks

import { describe, it, expect } from 'vitest';
import type { UserAnalytics } from '../../hooks/useUserAnalytics';
import type { UserPreferences } from '../../hooks/useUserPreferences';
import {
  createUserPreferenceMemory,
  createUserAnalyticsMemory,
  extractUserContext,
  retrieveRelevantMemories,
  suggestNextAction,
  generateInsight,
  type Memory,
} from '../memoryHooks';

describe('Memory Hooks', () => {
  const mockPreferences: UserPreferences = {
    lastView: 'narratives',
    lastViewTimestamp: Date.now(),
    lastFilters: {},
    savedFilterSets: {},
    lastSort: { field: 'title', direction: 'asc' },
    preferredExportFormat: 'json',
    exportHistory: [],
    theme: 'dark',
    compactMode: true,
    showDescriptions: true,
    enableAnalytics: true,
    enableAutoSave: true,
    reducedMotion: false,
    highContrast: false,
  };

  const mockAnalytics: UserAnalytics = {
    views: {
      narrativeViews: { N001: 5, N002: 3 },
      modelViews: { M001: 2 },
      totalViews: 10,
      lastViewTimestamp: Date.now(),
    },
    searches: {
      queries: ['test query', 'another query'],
      queryCount: { 'test query': 5, 'another query': 2 },
      totalSearches: 7,
      lastSearchTimestamp: Date.now(),
    },
    exports: {
      formatUsage: { json: 3, csv: 1 },
      totalExports: 4,
      lastExportTimestamp: Date.now(),
      averageNarrativeCount: 5,
    },
    sessionStart: Date.now() - 3600000,
    sessionDuration: 3600000,
    actions: [],
  };

  describe('createUserPreferenceMemory', () => {
    it('creates a memory from preferences', () => {
      const memory = createUserPreferenceMemory(mockPreferences);

      expect(memory.title).toBe('User Preferences');
      expect(memory.content).toContain('narratives');
      expect(memory.content).toContain('json');
      expect(memory.content).toContain('dark');
      expect(memory.tags).toContain('preferences');
    });

    it('includes accessibility settings when enabled', () => {
      const prefsWithA11y = {
        ...mockPreferences,
        reducedMotion: true,
        highContrast: true,
      };

      const memory = createUserPreferenceMemory(prefsWithA11y);
      expect(memory.content).toContain('Reduced motion');
      expect(memory.content).toContain('High contrast');
    });
  });

  describe('createUserAnalyticsMemory', () => {
    it('creates a memory from analytics', () => {
      const memory = createUserAnalyticsMemory(mockAnalytics);

      expect(memory.title).toBe('User Analytics Summary');
      expect(memory.content).toContain('10'); // total views
      expect(memory.content).toContain('7'); // total searches
      expect(memory.content).toContain('4'); // total exports
      expect(memory.tags).toContain('analytics');
    });

    it('includes top searches', () => {
      const memory = createUserAnalyticsMemory(mockAnalytics);
      expect(memory.content).toContain('test query');
    });

    it('includes most used export format', () => {
      const memory = createUserAnalyticsMemory(mockAnalytics);
      expect(memory.content).toContain('json');
    });
  });

  describe('extractUserContext', () => {
    it('extracts context from analytics', () => {
      const context = extractUserContext(mockAnalytics);

      expect(context.topInterests).toContain('N001');
      expect(context.topInterests).toContain('N002');
      expect(context.usagePatterns).toBeDefined();
    });

    it('identifies heavy searchers', () => {
      const analytics = {
        ...mockAnalytics,
        searches: { ...mockAnalytics.searches, totalSearches: 20 },
        views: { ...mockAnalytics.views, totalViews: 10 },
      };

      const context = extractUserContext(analytics);
      expect(context.usagePatterns).toContain('heavy_searcher');
    });

    it('identifies frequent exporters', () => {
      const analytics = {
        ...mockAnalytics,
        exports: { ...mockAnalytics.exports, totalExports: 10 },
      };

      const context = extractUserContext(analytics);
      expect(context.usagePatterns).toContain('frequent_exporter');
    });

    it('identifies engaged users', () => {
      const analytics = {
        ...mockAnalytics,
        sessionDuration: 35 * 60 * 1000, // 35 minutes
      };

      const context = extractUserContext(analytics);
      expect(context.usagePatterns).toContain('engaged_user');
    });

    it('identifies quick visitors', () => {
      const analytics = {
        ...mockAnalytics,
        sessionDuration: 2 * 60 * 1000, // 2 minutes
      };

      const context = extractUserContext(analytics);
      expect(context.usagePatterns).toContain('quick_visitor');
    });
  });

  describe('retrieveRelevantMemories', () => {
    const memories: Memory[] = [
      {
        id: '1',
        title: 'Export Preferences',
        content: 'User prefers JSON format',
        tags: ['export', 'preferences'],
        timestamp: Date.now(),
      },
      {
        id: '2',
        title: 'Search History',
        content: 'Frequently searches for cognitive models',
        tags: ['search', 'analytics'],
        timestamp: Date.now() - 86400000, // 1 day ago
      },
      {
        id: '3',
        title: 'View Patterns',
        content: 'Mostly views narratives',
        tags: ['view', 'patterns'],
        timestamp: Date.now() - 172800000, // 2 days ago
      },
    ];

    it('retrieves relevant memories based on context', () => {
      const relevant = retrieveRelevantMemories('export JSON format', memories, 5);

      expect(relevant.length).toBeGreaterThan(0);
      expect(relevant[0].id).toBe('1');
    });

    it('scores based on keyword matches', () => {
      const relevant = retrieveRelevantMemories('search cognitive', memories, 5);

      expect(relevant[0].id).toBe('2');
    });

    it('boosts recent memories', () => {
      const relevant = retrieveRelevantMemories('preferences', memories, 5);

      // Memory 1 is more recent and should score higher
      expect(relevant[0].timestamp).toBeGreaterThan(relevant[1]?.timestamp || 0);
    });

    it('limits results to specified count', () => {
      const relevant = retrieveRelevantMemories('test', memories, 2);

      expect(relevant.length).toBeLessThanOrEqual(2);
    });

    it('filters out irrelevant memories with no keyword matches', () => {
      // Use old memories (older than 24 hours) to avoid recency boost
      const oldMemories: Memory[] = memories.map((m) => ({
        ...m,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      }));

      const relevant = retrieveRelevantMemories('qwzxc', oldMemories, 5);

      expect(relevant.length).toBe(0);
    });
  });

  describe('suggestNextAction', () => {
    it('suggests exploring for new users', () => {
      const emptyAnalytics: UserAnalytics = {
        ...mockAnalytics,
        actions: [],
      };

      const suggestion = suggestNextAction(emptyAnalytics);
      expect(suggestion).toContain('exploring');
    });

    it('suggests viewing results after search', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        actions: [
          {
            type: 'search',
            timestamp: Date.now() - 60000, // 1 minute ago
            data: { query: 'test' },
          },
        ],
        views: { ...mockAnalytics.views, totalViews: 0 },
      };

      const suggestion = suggestNextAction(analytics);
      expect(suggestion).toContain('results');
    });

    it('suggests exporting after many views', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        actions: [{ type: 'view', timestamp: Date.now(), data: {} }],
        views: { ...mockAnalytics.views, totalViews: 15 },
        exports: { ...mockAnalytics.exports, totalExports: 0 },
      };

      const suggestion = suggestNextAction(analytics);
      expect(suggestion).toContain('export');
    });

    it('suggests using search for long sessions', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        actions: [{ type: 'view', timestamp: Date.now(), data: {} }],
        sessionDuration: 25 * 60 * 1000, // 25 minutes
        searches: { ...mockAnalytics.searches, totalSearches: 0 },
      };

      const suggestion = suggestNextAction(analytics);
      expect(suggestion).toContain('search');
    });

    it('suggests saving filters for frequent searchers', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        actions: [{ type: 'search', timestamp: Date.now(), data: {} }],
        searches: { ...mockAnalytics.searches, totalSearches: 15 },
      };

      const suggestion = suggestNextAction(analytics);
      expect(suggestion).toContain('filter');
    });
  });

  describe('generateInsight', () => {
    it('generates insight for favorite items', () => {
      const insight = generateInsight(mockAnalytics);

      expect(insight).toContain('N001');
      expect(insight).toContain('favorite');
    });

    it('generates insight for search patterns', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        views: { ...mockAnalytics.views, narrativeViews: {} },
      };

      const insight = generateInsight(analytics);
      expect(insight).toContain('test query');
    });

    it('generates insight for export behavior', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        views: { ...mockAnalytics.views, narrativeViews: {} },
        searches: { ...mockAnalytics.searches, queryCount: {} },
      };

      const insight = generateInsight(analytics);
      expect(insight).toContain('5');
    });

    it('generates insight for long sessions', () => {
      const analytics: UserAnalytics = {
        ...mockAnalytics,
        views: { ...mockAnalytics.views, narrativeViews: {} },
        searches: { ...mockAnalytics.searches, queryCount: {} },
        exports: { ...mockAnalytics.exports, totalExports: 0 },
        sessionDuration: 35 * 60 * 1000,
      };

      const insight = generateInsight(analytics);
      expect(insight).toContain('35 minutes');
    });

    it('returns null when no insights available', () => {
      const emptyAnalytics: UserAnalytics = {
        views: {
          narrativeViews: {},
          modelViews: {},
          totalViews: 0,
          lastViewTimestamp: 0,
        },
        searches: {
          queries: [],
          queryCount: {},
          totalSearches: 0,
          lastSearchTimestamp: 0,
        },
        exports: {
          formatUsage: {},
          totalExports: 0,
          lastExportTimestamp: 0,
          averageNarrativeCount: 0,
        },
        sessionStart: Date.now(),
        sessionDuration: 60000,
        actions: [],
      };

      const insight = generateInsight(emptyAnalytics);
      expect(insight).toBeNull();
    });
  });
});
