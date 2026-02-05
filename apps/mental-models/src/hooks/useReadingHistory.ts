// Reading history tracker hook

import { useState, useCallback, useEffect } from 'react';

export interface ReadingHistoryEntry {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  title: string;
  timestamp: number;
  duration?: number; // milliseconds spent viewing
  completed?: boolean;
  progress?: number; // 0-1 for progress tracking
}

const HISTORY_KEY = 'hummbl_reading_history';
const MAX_HISTORY = 100;

/**
 * Load reading history from localStorage
 */
function loadHistory(): ReadingHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load reading history:', error);
  }
  return [];
}

/**
 * Save reading history to localStorage
 */
function saveHistory(history: ReadingHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save reading history:', error);
  }
}

/**
 * Custom hook for reading history
 */
export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>(loadHistory);

  // Auto-save history
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  /**
   * Add or update history entry
   */
  const addToHistory = useCallback(
    (
      type: 'narrative' | 'mentalModel',
      itemId: string,
      title: string,
      options?: { duration?: number; completed?: boolean; progress?: number }
    ) => {
      setHistory((prev) => {
        // Check if entry exists recently (within last 5 entries)
        const recentIndex = prev.slice(0, 5).findIndex((e) => e.itemId === itemId);

        if (recentIndex !== -1) {
          // Update existing recent entry
          const updated = [...prev];
          updated[recentIndex] = {
            ...updated[recentIndex],
            timestamp: Date.now(),
            ...options,
          };
          return updated;
        }

        // Create new entry
        const entry: ReadingHistoryEntry = {
          id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          itemId,
          title,
          timestamp: Date.now(),
          ...options,
        };

        const updated = [entry, ...prev];

        // Limit history size
        if (updated.length > MAX_HISTORY) {
          return updated.slice(0, MAX_HISTORY);
        }

        return updated;
      });
    },
    []
  );

  /**
   * Mark item as completed
   */
  const markCompleted = useCallback((itemId: string) => {
    setHistory((prev) =>
      prev.map((entry) =>
        entry.itemId === itemId
          ? { ...entry, completed: true, progress: 1, timestamp: Date.now() }
          : entry
      )
    );
  }, []);

  /**
   * Update progress for an item
   */
  const updateProgress = useCallback((itemId: string, progress: number) => {
    setHistory((prev) =>
      prev.map((entry) =>
        entry.itemId === itemId ? { ...entry, progress, timestamp: Date.now() } : entry
      )
    );
  }, []);

  /**
   * Get recent history
   */
  const getRecentHistory = useCallback(
    (limit = 10): ReadingHistoryEntry[] => {
      return history.slice(0, limit);
    },
    [history]
  );

  /**
   * Get history by type
   */
  const getHistoryByType = useCallback(
    (type: 'narrative' | 'mentalModel'): ReadingHistoryEntry[] => {
      return history.filter((entry) => entry.type === type);
    },
    [history]
  );

  /**
   * Get completed items
   */
  const getCompletedItems = useCallback((): ReadingHistoryEntry[] => {
    return history.filter((entry) => entry.completed);
  }, [history]);

  /**
   * Get in-progress items
   */
  const getInProgressItems = useCallback((): ReadingHistoryEntry[] => {
    return history.filter(
      (entry) =>
        entry.progress !== undefined && entry.progress > 0 && entry.progress < 1 && !entry.completed
    );
  }, [history]);

  /**
   * Check if item was recently viewed
   */
  const wasRecentlyViewed = useCallback(
    (itemId: string, withinMs = 24 * 60 * 60 * 1000): boolean => {
      const entry = history.find((e) => e.itemId === itemId);
      if (!entry) return false;

      return Date.now() - entry.timestamp < withinMs;
    },
    [history]
  );

  /**
   * Get entry for item
   */
  const getEntry = useCallback(
    (itemId: string): ReadingHistoryEntry | undefined => {
      return history.find((e) => e.itemId === itemId);
    },
    [history]
  );

  /**
   * Remove entry from history
   */
  const removeFromHistory = useCallback((entryId: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your reading history?')) {
      setHistory([]);
      return true;
    }
    return false;
  }, []);

  /**
   * Get statistics
   */
  const getStatistics = useCallback(() => {
    const byType = {
      narrative: history.filter((e) => e.type === 'narrative').length,
      mentalModel: history.filter((e) => e.type === 'mentalModel').length,
    };

    const completed = history.filter((e) => e.completed).length;
    const inProgress = history.filter((e) => e.progress && e.progress > 0 && e.progress < 1).length;

    const totalDuration = history.reduce((sum, e) => sum + (e.duration || 0), 0);
    const avgDuration =
      history.filter((e) => e.duration).length > 0
        ? totalDuration / history.filter((e) => e.duration).length
        : 0;

    // Get unique items (last occurrence only)
    const uniqueItems = new Set(history.map((e) => e.itemId));

    // Calculate reading streak (consecutive days)
    const today = new Date().setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = today;

    while (true) {
      const dayStart = checkDate;
      const dayEnd = checkDate + 24 * 60 * 60 * 1000;

      const hasActivity = history.some((e) => e.timestamp >= dayStart && e.timestamp < dayEnd);

      if (hasActivity) {
        streak++;
        checkDate -= 24 * 60 * 60 * 1000;
      } else {
        break;
      }
    }

    return {
      total: history.length,
      unique: uniqueItems.size,
      byType,
      completed,
      inProgress,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      streak,
    };
  }, [history]);

  /**
   * Get reading trends (last 7 days)
   */
  const getReadingTrends = useCallback(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentHistory = history.filter((e) => e.timestamp >= sevenDaysAgo);

    // Group by day
    const byDay: Record<string, number> = {};

    recentHistory.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      byDay[date] = (byDay[date] || 0) + 1;
    });

    return byDay;
  }, [history]);

  /**
   * Export history as JSON
   */
  const exportHistory = useCallback(() => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  /**
   * Import history from JSON
   */
  const importHistory = useCallback((json: string, merge = false) => {
    try {
      const imported = JSON.parse(json);

      if (merge) {
        setHistory((prev) => [...prev, ...imported]);
      } else {
        setHistory(imported);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }, []);

  return {
    // State
    history,

    // Core operations
    addToHistory,
    markCompleted,
    updateProgress,
    removeFromHistory,
    clearHistory,

    // Queries
    getRecentHistory,
    getHistoryByType,
    getCompletedItems,
    getInProgressItems,
    wasRecentlyViewed,
    getEntry,

    // Analytics
    getStatistics,
    getReadingTrends,

    // Import/Export
    exportHistory,
    importHistory,
  };
}
