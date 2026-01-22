// User analytics and interaction tracking hook

import { useCallback, useEffect } from 'react';

export interface UserAction {
  type: 'view' | 'search' | 'filter' | 'export' | 'select';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ViewAnalytics {
  narrativeViews: Record<string, number>;
  modelViews: Record<string, number>;
  totalViews: number;
  lastViewTimestamp: number;
}

export interface SearchAnalytics {
  queries: string[];
  queryCount: Record<string, number>;
  totalSearches: number;
  lastSearchTimestamp: number;
}

export interface ExportAnalytics {
  formatUsage: Record<string, number>;
  totalExports: number;
  lastExportTimestamp: number;
  averageNarrativeCount: number;
}

export interface UserAnalytics {
  views: ViewAnalytics;
  searches: SearchAnalytics;
  exports: ExportAnalytics;
  sessionStart: number;
  sessionDuration: number;
  actions: UserAction[];
}

const ANALYTICS_KEY = 'hummbl_user_analytics';
const MAX_ACTIONS = 100; // Keep last 100 actions

/**
 * Get analytics from localStorage
 */
function getAnalytics(): UserAnalytics {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load analytics:', error);
  }

  // Return default analytics
  return {
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
    sessionDuration: 0,
    actions: [],
  };
}

/**
 * Save analytics to localStorage
 */
function saveAnalytics(analytics: UserAnalytics): void {
  try {
    // Update session duration
    analytics.sessionDuration = Date.now() - analytics.sessionStart;

    // Trim actions if needed
    if (analytics.actions.length > MAX_ACTIONS) {
      analytics.actions = analytics.actions.slice(-MAX_ACTIONS);
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.warn('Failed to save analytics:', error);
  }
}

/**
 * Custom hook for user analytics tracking
 */
export function useUserAnalytics() {
  // Update session duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const analytics = getAnalytics();
      saveAnalytics(analytics);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Track narrative view
   */
  const trackNarrativeView = useCallback((narrativeId: string, narrativeTitle?: string) => {
    const analytics = getAnalytics();

    analytics.views.narrativeViews[narrativeId] =
      (analytics.views.narrativeViews[narrativeId] || 0) + 1;
    analytics.views.totalViews++;
    analytics.views.lastViewTimestamp = Date.now();

    analytics.actions.push({
      type: 'view',
      timestamp: Date.now(),
      data: { narrativeId, narrativeTitle, viewType: 'narrative' },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Track mental model view
   */
  const trackModelView = useCallback((modelId: string, modelTitle?: string) => {
    const analytics = getAnalytics();

    analytics.views.modelViews[modelId] = (analytics.views.modelViews[modelId] || 0) + 1;
    analytics.views.totalViews++;
    analytics.views.lastViewTimestamp = Date.now();

    analytics.actions.push({
      type: 'view',
      timestamp: Date.now(),
      data: { modelId, modelTitle, viewType: 'model' },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Track search query
   */
  const trackSearchQuery = useCallback((query: string, resultCount?: number) => {
    if (!query.trim()) return;

    const analytics = getAnalytics();
    const normalizedQuery = query.toLowerCase().trim();

    // Add to queries list (keep unique)
    if (!analytics.searches.queries.includes(normalizedQuery)) {
      analytics.searches.queries.push(normalizedQuery);
    }

    // Increment count
    analytics.searches.queryCount[normalizedQuery] =
      (analytics.searches.queryCount[normalizedQuery] || 0) + 1;
    analytics.searches.totalSearches++;
    analytics.searches.lastSearchTimestamp = Date.now();

    analytics.actions.push({
      type: 'search',
      timestamp: Date.now(),
      data: { query: normalizedQuery, resultCount },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Track filter application
   */
  const trackFilter = useCallback((filterType: string, filterValue: unknown) => {
    const analytics = getAnalytics();

    analytics.actions.push({
      type: 'filter',
      timestamp: Date.now(),
      data: { filterType, filterValue },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Track export action
   */
  const trackExport = useCallback((format: string, itemCount: number) => {
    const analytics = getAnalytics();

    analytics.exports.formatUsage[format] = (analytics.exports.formatUsage[format] || 0) + 1;
    analytics.exports.totalExports++;
    analytics.exports.lastExportTimestamp = Date.now();

    // Update average
    const currentAvg = analytics.exports.averageNarrativeCount;
    const totalExports = analytics.exports.totalExports;
    analytics.exports.averageNarrativeCount =
      (currentAvg * (totalExports - 1) + itemCount) / totalExports;

    analytics.actions.push({
      type: 'export',
      timestamp: Date.now(),
      data: { format, itemCount },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Track item selection
   */
  const trackSelection = useCallback((itemType: string, itemId: string) => {
    const analytics = getAnalytics();

    analytics.actions.push({
      type: 'select',
      timestamp: Date.now(),
      data: { itemType, itemId },
    });

    saveAnalytics(analytics);
  }, []);

  /**
   * Get current analytics
   */
  const getStats = useCallback((): UserAnalytics => {
    return getAnalytics();
  }, []);

  /**
   * Get most viewed items
   */
  const getMostViewed = useCallback((type: 'narrative' | 'model', limit = 5) => {
    const analytics = getAnalytics();
    const views =
      type === 'narrative' ? analytics.views.narrativeViews : analytics.views.modelViews;

    return Object.entries(views)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id, count]) => ({ id, count }));
  }, []);

  /**
   * Get top search queries
   */
  const getTopSearches = useCallback((limit = 5) => {
    const analytics = getAnalytics();

    return Object.entries(analytics.searches.queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }, []);

  /**
   * Get recent actions
   */
  const getRecentActions = useCallback((limit = 10) => {
    const analytics = getAnalytics();
    return analytics.actions.slice(-limit).reverse();
  }, []);

  /**
   * Clear all analytics (for privacy/testing)
   */
  const clearAnalytics = useCallback(() => {
    localStorage.removeItem(ANALYTICS_KEY);
  }, []);

  return {
    // Tracking functions
    trackNarrativeView,
    trackModelView,
    trackSearchQuery,
    trackFilter,
    trackExport,
    trackSelection,

    // Query functions
    getStats,
    getMostViewed,
    getTopSearches,
    getRecentActions,

    // Utility
    clearAnalytics,
  };
}
