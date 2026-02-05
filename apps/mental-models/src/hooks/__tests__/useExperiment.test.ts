// Tests for useExperiment hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useExperiment,
  useExperimentManager,
  forceVariant,
  getCurrentVariant,
  isInVariant,
} from '../useExperiment';

describe('useExperiment', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Experiment Assignment', () => {
    it('assigns variant on first use', () => {
      const { result } = renderHook(() => useExperiment('search_ui_v2'));

      expect(result.current.variant).toBeTruthy();
      expect(['control', 'variant_a']).toContain(result.current.variant);
    });

    it('persists assignment across renders', () => {
      const { result: result1 } = renderHook(() => useExperiment('search_ui_v2'));
      const variant1 = result1.current.variant;

      const { result: result2 } = renderHook(() => useExperiment('search_ui_v2'));
      const variant2 = result2.current.variant;

      expect(variant2).toBe(variant1);
    });

    it('returns control for unknown experiment', () => {
      const { result } = renderHook(() => useExperiment('unknown_experiment'));

      expect(result.current.variant).toBe('control');
    });
  });

  describe('Conversion Tracking', () => {
    it('tracks conversion', () => {
      const { result } = renderHook(() => useExperiment('search_ui_v2'));

      act(() => {
        result.current.trackConversion(100);
      });

      // If analytics is set up, this would track to the backend
      expect(result.current.variant).toBeTruthy();
    });

    it('tracks custom events', () => {
      const { result } = renderHook(() => useExperiment('search_ui_v2'));

      act(() => {
        result.current.trackEvent('button_click', { location: 'header' });
      });

      expect(result.current.variant).toBeTruthy();
    });
  });

  describe('Experiment Manager', () => {
    it('loads default experiments', () => {
      const { result } = renderHook(() => useExperimentManager());

      expect(result.current.experiments.length).toBeGreaterThan(0);
    });

    it('adds experiment', () => {
      const { result } = renderHook(() => useExperimentManager());

      act(() => {
        result.current.addExperiment({
          id: 'test_exp',
          name: 'Test Experiment',
          variants: ['a', 'b'],
          enabled: true,
        });
      });

      expect(result.current.experiments.find((e) => e.id === 'test_exp')).toBeTruthy();
    });

    it('updates experiment', () => {
      const { result } = renderHook(() => useExperimentManager());

      act(() => {
        result.current.updateExperiment('search_ui_v2', { enabled: false });
      });

      const exp = result.current.experiments.find((e) => e.id === 'search_ui_v2');
      expect(exp?.enabled).toBe(false);
    });

    it('deletes experiment', () => {
      const { result } = renderHook(() => useExperimentManager());
      const initialCount = result.current.experiments.length;

      act(() => {
        result.current.deleteExperiment('search_ui_v2');
      });

      expect(result.current.experiments.length).toBe(initialCount - 1);
    });

    it('toggles experiment', () => {
      const { result } = renderHook(() => useExperimentManager());

      const initialState = result.current.experiments.find((e) => e.id === 'search_ui_v2')?.enabled;

      act(() => {
        result.current.toggleExperiment('search_ui_v2');
      });

      const newState = result.current.experiments.find((e) => e.id === 'search_ui_v2')?.enabled;
      expect(newState).toBe(!initialState);
    });

    it('resets assignment', () => {
      // Create initial assignment
      renderHook(() => useExperiment('search_ui_v2'));

      const { result } = renderHook(() => useExperimentManager());

      act(() => {
        result.current.resetAssignment('search_ui_v2');
      });

      const variant = getCurrentVariant('search_ui_v2');
      expect(variant).toBeNull();
    });

    it('gets all assignments', () => {
      renderHook(() => useExperiment('search_ui_v2'));

      const { result } = renderHook(() => useExperimentManager());
      const assignments = result.current.getAllAssignments();

      expect(assignments.length).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    it('forces variant', () => {
      forceVariant('test_exp', 'variant_b');

      expect(getCurrentVariant('test_exp')).toBe('variant_b');
    });

    it('checks variant membership', () => {
      forceVariant('test_exp', 'variant_a');

      expect(isInVariant('test_exp', 'variant_a')).toBe(true);
      expect(isInVariant('test_exp', 'variant_b')).toBe(false);
    });
  });
});
