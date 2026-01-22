// Search history management hook

import { useState, useCallback, useEffect } from 'react';

export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
  resultCount?: number;
  selectedResult?: string;
  selectedField?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: Record<string, unknown>;
  timestamp: number;
}

const HISTORY_KEY = 'hummbl_search_history';
const SAVED_SEARCHES_KEY = 'hummbl_saved_searches';
const MAX_HISTORY = 50;

/**
 * Load search history from localStorage
 */
function loadHistory(): SearchHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load search history:', error);
  }
  return [];
}

/**
 * Save search history to localStorage
 */
function saveHistory(history: SearchHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
}

/**
 * Load saved searches from localStorage
 */
function loadSavedSearches(): SavedSearch[] {
  try {
    const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load saved searches:', error);
  }
  return [];
}

/**
 * Save searches to localStorage
 */
function saveSavedSearches(searches: SavedSearch[]): void {
  try {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.warn('Failed to save searches:', error);
  }
}

/**
 * Custom hook for search history management
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>(loadHistory);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);

  // Auto-save history when it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Auto-save saved searches when they change
  useEffect(() => {
    saveSavedSearches(savedSearches);
  }, [savedSearches]);

  /**
   * Add search to history
   */
  const addToHistory = useCallback((entry: Omit<SearchHistoryEntry, 'timestamp'>) => {
    setHistory((prev) => {
      // Check if similar query exists recently (within last 5 entries)
      const recent = prev.slice(0, 5);
      if (recent.some((e) => e.query.toLowerCase() === entry.query.toLowerCase())) {
        return prev; // Don't add duplicate
      }

      const newEntry: SearchHistoryEntry = {
        ...entry,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...prev];

      // Keep only last MAX_HISTORY entries
      if (updated.length > MAX_HISTORY) {
        return updated.slice(0, MAX_HISTORY);
      }

      return updated;
    });
  }, []);

  /**
   * Update history entry with selection info
   */
  const updateHistoryEntry = useCallback(
    (query: string, selectedResult: string, selectedField: string) => {
      setHistory((prev) =>
        prev.map((entry) =>
          entry.query === query && Date.now() - entry.timestamp < 60000 // Within last minute
            ? { ...entry, selectedResult, selectedField }
            : entry
        )
      );
    },
    []
  );

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Remove specific entry from history
   */
  const removeFromHistory = useCallback((timestamp: number) => {
    setHistory((prev) => prev.filter((entry) => entry.timestamp !== timestamp));
  }, []);

  /**
   * Get recent searches (unique queries)
   */
  const getRecentSearches = useCallback(
    (limit = 10): string[] => {
      const seen = new Set<string>();
      const recent: string[] = [];

      for (const entry of history) {
        const normalized = entry.query.toLowerCase().trim();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          recent.push(entry.query);
          if (recent.length >= limit) break;
        }
      }

      return recent;
    },
    [history]
  );

  /**
   * Get popular searches (most frequent)
   */
  const getPopularSearches = useCallback(
    (limit = 5): Array<{ query: string; count: number }> => {
      const counts = new Map<string, number>();

      for (const entry of history) {
        const normalized = entry.query.toLowerCase().trim();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }

      return Array.from(counts.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    [history]
  );

  /**
   * Save a search with a name
   */
  const saveSearch = useCallback(
    (name: string, query: string, filters?: Record<string, unknown>) => {
      const newSearch: SavedSearch = {
        id: `search_${Date.now()}`,
        name,
        query,
        filters,
        timestamp: Date.now(),
      };

      setSavedSearches((prev) => [newSearch, ...prev]);
    },
    []
  );

  /**
   * Delete a saved search
   */
  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== id));
  }, []);

  /**
   * Update a saved search
   */
  const updateSavedSearch = useCallback(
    (id: string, updates: Partial<Omit<SavedSearch, 'id' | 'timestamp'>>) => {
      setSavedSearches((prev) =>
        prev.map((search) => (search.id === id ? { ...search, ...updates } : search))
      );
    },
    []
  );

  /**
   * Get saved search by ID
   */
  const getSavedSearch = useCallback(
    (id: string): SavedSearch | undefined => {
      return savedSearches.find((search) => search.id === id);
    },
    [savedSearches]
  );

  /**
   * Get search suggestions based on history
   */
  const getSuggestions = useCallback(
    (partialQuery: string, limit = 5): string[] => {
      if (!partialQuery.trim()) return getRecentSearches(limit);

      const query = partialQuery.toLowerCase();
      const suggestions: Array<{ text: string; score: number }> = [];

      for (const entry of history) {
        const entryQuery = entry.query.toLowerCase();

        // Exact match
        if (entryQuery === query) {
          suggestions.push({ text: entry.query, score: 1.0 });
          continue;
        }

        // Starts with
        if (entryQuery.startsWith(query)) {
          suggestions.push({ text: entry.query, score: 0.9 });
          continue;
        }

        // Contains
        if (entryQuery.includes(query)) {
          suggestions.push({ text: entry.query, score: 0.7 });
          continue;
        }
      }

      // Remove duplicates and sort by score
      const seen = new Set<string>();
      const unique = suggestions
        .filter((s) => {
          const normalized = s.text.toLowerCase();
          if (seen.has(normalized)) return false;
          seen.add(normalized);
          return true;
        })
        .sort((a, b) => b.score - a.score);

      return unique.slice(0, limit).map((s) => s.text);
    },
    [history, getRecentSearches]
  );

  /**
   * Get search statistics
   */
  const getStatistics = useCallback(() => {
    const total = history.length;
    const unique = new Set(history.map((e) => e.query.toLowerCase())).size;

    const withResults = history.filter((e) => e.resultCount && e.resultCount > 0).length;
    const withSelections = history.filter((e) => e.selectedResult).length;

    const avgResultCount =
      history.filter((e) => e.resultCount).reduce((sum, e) => sum + (e.resultCount || 0), 0) /
      (history.filter((e) => e.resultCount).length || 1);

    return {
      totalSearches: total,
      uniqueQueries: unique,
      searchesWithResults: withResults,
      searchesWithSelections: withSelections,
      selectionRate: total > 0 ? withSelections / total : 0,
      avgResultCount,
    };
  }, [history]);

  return {
    // State
    history,
    savedSearches,

    // History management
    addToHistory,
    updateHistoryEntry,
    clearHistory,
    removeFromHistory,
    getRecentSearches,
    getPopularSearches,

    // Saved searches
    saveSearch,
    deleteSavedSearch,
    updateSavedSearch,
    getSavedSearch,

    // Utilities
    getSuggestions,
    getStatistics,
  };
}
