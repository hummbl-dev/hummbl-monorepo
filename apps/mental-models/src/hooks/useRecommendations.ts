// React hook for AI-powered recommendations

import { useState, useEffect, useCallback } from 'react';
import { getRecommendationEngine } from '../services/recommendationEngine';
import type { RecommendationResult, ContentItem } from '../services/recommendationEngine';

export interface UseRecommendationsOptions {
  userId?: string;
  strategy?: 'hybrid' | 'semantic' | 'collaborative';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook for getting AI-powered recommendations
 */
export function useRecommendations(corpus: ContentItem[], options: UseRecommendationsOptions = {}) {
  const {
    userId,
    strategy = 'hybrid',
    limit = 10,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
  } = options;

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engine = getRecommendationEngine(userId);

  /**
   * Fetch recommendations
   */
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await engine.getRecommendations(corpus, limit, strategy);
      setRecommendations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [corpus, limit, strategy, engine]);

  /**
   * Track user activity
   */
  const trackView = useCallback(
    (itemId: string, item?: ContentItem) => {
      const contentItem = item || corpus.find((c) => c.id === itemId);

      engine.updateProfile({
        viewedItem: itemId,
        category: contentItem?.category,
        tags: contentItem?.tags,
        difficulty: contentItem?.difficulty,
      });

      // Refresh recommendations after tracking
      if (autoRefresh) {
        fetchRecommendations();
      }
    },
    [corpus, engine, autoRefresh, fetchRecommendations]
  );

  /**
   * Track bookmark
   */
  const trackBookmark = useCallback(
    (itemId: string, item?: ContentItem) => {
      const contentItem = item || corpus.find((c) => c.id === itemId);

      engine.updateProfile({
        bookmarkedItem: itemId,
        category: contentItem?.category,
        tags: contentItem?.tags,
      });

      if (autoRefresh) {
        fetchRecommendations();
      }
    },
    [corpus, engine, autoRefresh, fetchRecommendations]
  );

  /**
   * Track search
   */
  const trackSearch = useCallback(
    (query: string) => {
      engine.updateProfile({
        searchQuery: query,
      });

      if (autoRefresh) {
        fetchRecommendations();
      }
    },
    [engine, autoRefresh, fetchRecommendations]
  );

  /**
   * Get "because you viewed" recommendations
   */
  const getBecauseYouViewed = useCallback(
    async (itemId: string, itemLimit = 5) => {
      try {
        return await engine.getBecauseYouViewed(itemId, corpus, itemLimit);
      } catch (err) {
        console.error('Failed to get "because you viewed" recommendations:', err);
        return [];
      }
    },
    [corpus, engine]
  );

  /**
   * Refresh recommendations manually
   */
  const refresh = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Initial fetch
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRecommendations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refresh,
    trackView,
    trackBookmark,
    trackSearch,
    getBecauseYouViewed,
  };
}
