// Tests for useUserPreferences hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserPreferences } from '../useUserPreferences';

describe('useUserPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('initializes with default preferences', () => {
      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.preferences.lastView).toBe('models');
      expect(result.current.preferences.preferredExportFormat).toBe('json');
      expect(result.current.preferences.theme).toBe('auto');
    });

    it('loads preferences from localStorage', () => {
      localStorage.setItem(
        'hummbl_user_preferences',
        JSON.stringify({
          lastView: 'narratives',
          preferredExportFormat: 'csv',
        })
      );

      const { result } = renderHook(() => useUserPreferences());
      expect(result.current.preferences.lastView).toBe('narratives');
      expect(result.current.preferences.preferredExportFormat).toBe('csv');
    });
  });

  describe('View Management', () => {
    it('updates last view', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setLastView('narratives');
      });

      expect(result.current.preferences.lastView).toBe('narratives');
      expect(result.current.preferences.lastViewTimestamp).toBeGreaterThan(0);
    });
  });

  describe('Filter Management', () => {
    it('updates filters', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setFilters({
          category: 'Test Category',
          tags: ['test'],
        });
      });

      expect(result.current.preferences.lastFilters.category).toBe('Test Category');
      expect(result.current.preferences.lastFilters.tags).toEqual(['test']);
    });

    it('saves and loads filter sets', () => {
      const { result } = renderHook(() => useUserPreferences());

      const filters = { category: 'Saved', evidenceGrade: 'A' };

      act(() => {
        result.current.saveFilterSet('myFilters', filters);
      });

      const loaded = result.current.loadFilterSet('myFilters');
      expect(loaded).toEqual(filters);
    });

    it('deletes filter sets', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.saveFilterSet('temp', { category: 'Test' });
        result.current.deleteFilterSet('temp');
      });

      const loaded = result.current.loadFilterSet('temp');
      expect(loaded).toBeUndefined();
    });
  });

  describe('Sort Management', () => {
    it('updates sort preferences', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setSort('category', 'desc');
      });

      expect(result.current.preferences.lastSort.field).toBe('category');
      expect(result.current.preferences.lastSort.direction).toBe('desc');
    });
  });

  describe('Export Management', () => {
    it('sets preferred export format', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setPreferredExportFormat('csv');
      });

      expect(result.current.preferences.preferredExportFormat).toBe('csv');
    });

    it('records export history', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.recordExport('json', 5);
        result.current.recordExport('csv', 10);
      });

      expect(result.current.preferences.exportHistory).toHaveLength(2);
      expect(result.current.preferences.exportHistory[0].format).toBe('json');
      expect(result.current.preferences.exportHistory[1].itemCount).toBe(10);
    });

    it('limits export history to 20 items', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.recordExport('json', i);
        }
      });

      expect(result.current.preferences.exportHistory).toHaveLength(20);
    });
  });

  describe('UI Preferences', () => {
    it('sets theme', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.preferences.theme).toBe('dark');
    });

    it('toggles compact mode', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.toggleCompactMode();
      });

      expect(result.current.preferences.compactMode).toBe(true);

      act(() => {
        result.current.toggleCompactMode();
      });

      expect(result.current.preferences.compactMode).toBe(false);
    });

    it('toggles descriptions', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.toggleDescriptions();
      });

      expect(result.current.preferences.showDescriptions).toBe(false);
    });
  });

  describe('Feature Flags', () => {
    it('toggles analytics', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.toggleAnalytics();
      });

      expect(result.current.preferences.enableAnalytics).toBe(false);
    });

    it('toggles auto-save', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.toggleAutoSave();
      });

      expect(result.current.preferences.enableAutoSave).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('sets reduced motion', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setReducedMotion(true);
      });

      expect(result.current.preferences.reducedMotion).toBe(true);
    });

    it('sets high contrast', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setHighContrast(true);
      });

      expect(result.current.preferences.highContrast).toBe(true);
    });
  });

  describe('Import/Export', () => {
    it('exports preferences as JSON', () => {
      const { result } = renderHook(() => useUserPreferences());

      const exported = result.current.exportPreferences();
      const parsed = JSON.parse(exported);

      expect(parsed.lastView).toBe('models');
      expect(parsed.preferredExportFormat).toBe('json');
    });

    it('imports preferences from JSON', () => {
      const { result } = renderHook(() => useUserPreferences());

      const importData = JSON.stringify({
        lastView: 'narratives',
        preferredExportFormat: 'csv',
        theme: 'dark',
      });

      act(() => {
        result.current.importPreferences(importData);
      });

      expect(result.current.preferences.lastView).toBe('narratives');
      expect(result.current.preferences.preferredExportFormat).toBe('csv');
      expect(result.current.preferences.theme).toBe('dark');
    });

    it('handles invalid JSON on import', () => {
      const { result } = renderHook(() => useUserPreferences());

      let response: { success: boolean; error?: string } | undefined;
      act(() => {
        response = result.current.importPreferences('invalid json');
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBeTruthy();
    });
  });

  describe('Reset', () => {
    it('resets preferences to defaults', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setLastView('narratives');
        result.current.setTheme('dark');
        result.current.resetPreferences();
      });

      expect(result.current.preferences.lastView).toBe('models');
      expect(result.current.preferences.theme).toBe('auto');
    });
  });

  describe('Suggestions', () => {
    it('suggests format based on usage', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.recordExport('csv', 5);
        result.current.recordExport('csv', 5);
        result.current.recordExport('csv', 5);
      });

      const suggestion = result.current.getSuggestion();
      expect(suggestion).toContain('CSV');
    });

    it('returns welcome message for returning users', () => {
      const { result } = renderHook(() => useUserPreferences());

      // Set last view to 8 days ago
      act(() => {
        result.current.setLastView('narratives');
      });

      // Manually update timestamp to 8 days ago
      const prefs = result.current.preferences;
      prefs.lastViewTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
      localStorage.setItem('hummbl_user_preferences', JSON.stringify(prefs));

      // Create new instance
      const { result: result2 } = renderHook(() => useUserPreferences());
      const suggestion = result2.current.getSuggestion();

      expect(suggestion).toContain('Welcome back');
    });
  });

  describe('Auto-save', () => {
    it('auto-saves preferences when enabled', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setLastView('narratives');
      });

      const stored = localStorage.getItem('hummbl_user_preferences');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.lastView).toBe('narratives');
    });

    it('does not auto-save when disabled', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.toggleAutoSave(); // Disable
        localStorage.clear();
        result.current.setLastView('narratives');
      });

      const stored = localStorage.getItem('hummbl_user_preferences');
      expect(stored).toBeNull();
    });
  });
});
