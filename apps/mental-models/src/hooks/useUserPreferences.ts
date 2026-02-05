// User preferences management hook

import { useState, useCallback, useEffect } from 'react';

export type ViewType = 'models' | 'narratives' | 'beta';
export type ExportFormat = 'json' | 'csv' | 'md';

export interface FilterPreferences {
  category?: string;
  evidenceGrade?: string;
  tags?: string[];
  searchQuery?: string;
}

export interface SortPreferences {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UserPreferences {
  // View state
  lastView: ViewType;
  lastViewTimestamp: number;

  // Filter state
  lastFilters: FilterPreferences;
  savedFilterSets: Record<string, FilterPreferences>;

  // Sort state
  lastSort: SortPreferences;

  // Export preferences
  preferredExportFormat: ExportFormat;
  exportHistory: Array<{
    format: ExportFormat;
    timestamp: number;
    itemCount: number;
  }>;

  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showDescriptions: boolean;

  // Feature flags
  enableAnalytics: boolean;
  enableAutoSave: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
}

const PREFERENCES_KEY = 'hummbl_user_preferences';

/**
 * Default preferences
 */
const defaultPreferences: UserPreferences = {
  lastView: 'models',
  lastViewTimestamp: 0,
  lastFilters: {},
  savedFilterSets: {},
  lastSort: { field: 'title', direction: 'asc' },
  preferredExportFormat: 'json',
  exportHistory: [],
  theme: 'auto',
  compactMode: false,
  showDescriptions: true,
  enableAnalytics: true,
  enableAutoSave: true,
  reducedMotion: false,
  highContrast: false,
};

/**
 * Load preferences from localStorage
 */
function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
  return defaultPreferences;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
}

/**
 * Custom hook for user preferences management
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  // Auto-save preferences when they change
  useEffect(() => {
    if (preferences.enableAutoSave) {
      savePreferences(preferences);
    }
  }, [preferences]);

  /**
   * Update last view
   */
  const setLastView = useCallback((view: ViewType) => {
    setPreferences((prev) => ({
      ...prev,
      lastView: view,
      lastViewTimestamp: Date.now(),
    }));
  }, []);

  /**
   * Update filters
   */
  const setFilters = useCallback((filters: FilterPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      lastFilters: filters,
    }));
  }, []);

  /**
   * Save a filter set with a name
   */
  const saveFilterSet = useCallback((name: string, filters: FilterPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      savedFilterSets: {
        ...prev.savedFilterSets,
        [name]: filters,
      },
    }));
  }, []);

  /**
   * Load a saved filter set
   */
  const loadFilterSet = useCallback(
    (name: string): FilterPreferences | undefined => {
      return preferences.savedFilterSets[name];
    },
    [preferences.savedFilterSets]
  );

  /**
   * Delete a saved filter set
   */
  const deleteFilterSet = useCallback((name: string) => {
    setPreferences((prev) => {
      const { [name]: _, ...rest } = prev.savedFilterSets;
      return {
        ...prev,
        savedFilterSets: rest,
      };
    });
  }, []);

  /**
   * Update sort preferences
   */
  const setSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setPreferences((prev) => ({
      ...prev,
      lastSort: { field, direction },
    }));
  }, []);

  /**
   * Set preferred export format
   */
  const setPreferredExportFormat = useCallback((format: ExportFormat) => {
    setPreferences((prev) => ({
      ...prev,
      preferredExportFormat: format,
    }));
  }, []);

  /**
   * Record an export action
   */
  const recordExport = useCallback((format: ExportFormat, itemCount: number) => {
    setPreferences((prev) => ({
      ...prev,
      exportHistory: [
        ...prev.exportHistory.slice(-19), // Keep last 20
        { format, timestamp: Date.now(), itemCount },
      ],
    }));
  }, []);

  /**
   * Update theme
   */
  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setPreferences((prev) => ({
      ...prev,
      theme,
    }));
  }, []);

  /**
   * Toggle compact mode
   */
  const toggleCompactMode = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      compactMode: !prev.compactMode,
    }));
  }, []);

  /**
   * Toggle descriptions
   */
  const toggleDescriptions = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      showDescriptions: !prev.showDescriptions,
    }));
  }, []);

  /**
   * Toggle analytics
   */
  const toggleAnalytics = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      enableAnalytics: !prev.enableAnalytics,
    }));
  }, []);

  /**
   * Toggle auto-save
   */
  const toggleAutoSave = useCallback(() => {
    setPreferences((prev) => {
      const newAutoSave = !prev.enableAutoSave;
      const newPrefs = { ...prev, enableAutoSave: newAutoSave };
      // If turning on, save immediately
      if (newAutoSave) {
        savePreferences(newPrefs);
      }
      return newPrefs;
    });
  }, []);

  /**
   * Set accessibility preferences
   */
  const setReducedMotion = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      reducedMotion: enabled,
    }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      highContrast: enabled,
    }));
  }, []);

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    savePreferences(defaultPreferences);
  }, []);

  /**
   * Export preferences as JSON
   */
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  /**
   * Import preferences from JSON
   */
  const importPreferences = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      const merged = { ...defaultPreferences, ...imported };
      setPreferences(merged);
      savePreferences(merged);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }, []);

  /**
   * Get suggestion based on usage patterns
   */
  const getSuggestion = useCallback((): string | null => {
    // If user always uses same export format, suggest it
    if (preferences.exportHistory.length >= 3) {
      const formats = preferences.exportHistory.map((e) => e.format);
      const mostUsed = formats[formats.length - 1];
      if (formats.slice(-3).every((f) => f === mostUsed)) {
        return `Your preferred format is ${mostUsed.toUpperCase()}`;
      }
    }

    // If user hasn't visited in a while
    const daysSinceLastView = (Date.now() - preferences.lastViewTimestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceLastView > 7 && preferences.lastViewTimestamp > 0) {
      return `Welcome back! You last viewed ${preferences.lastView}`;
    }

    return null;
  }, [preferences]);

  return {
    // Current preferences
    preferences,

    // View management
    setLastView,

    // Filter management
    setFilters,
    saveFilterSet,
    loadFilterSet,
    deleteFilterSet,

    // Sort management
    setSort,

    // Export management
    setPreferredExportFormat,
    recordExport,

    // UI preferences
    setTheme,
    toggleCompactMode,
    toggleDescriptions,

    // Feature flags
    toggleAnalytics,
    toggleAutoSave,

    // Accessibility
    setReducedMotion,
    setHighContrast,

    // Utility
    resetPreferences,
    exportPreferences,
    importPreferences,
    getSuggestion,
  };
}
