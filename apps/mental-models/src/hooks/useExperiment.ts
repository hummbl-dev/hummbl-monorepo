// A/B testing module with experiment management

import { useState, useEffect, useCallback } from 'react';
import { getAnalytics } from '../services/analyticsEngine';

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for variants (must sum to 1.0)
  enabled: boolean;
  startDate?: number;
  endDate?: number;
}

export interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

const ASSIGNMENTS_KEY = 'hummbl_experiment_assignments';
const EXPERIMENTS_KEY = 'hummbl_experiments';

/**
 * Default experiments configuration
 */
const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'search_ui_v2',
    name: 'Search UI V2',
    variants: ['control', 'variant_a'],
    enabled: true,
  },
  {
    id: 'recommendation_algo',
    name: 'Recommendation Algorithm',
    variants: ['baseline', 'ml_based', 'hybrid'],
    weights: [0.5, 0.25, 0.25],
    enabled: true,
  },
  {
    id: 'onboarding_flow',
    name: 'Onboarding Flow',
    variants: ['current', 'simplified', 'guided'],
    enabled: false,
  },
];

/**
 * Load experiments from localStorage or use defaults
 */
function loadExperiments(): Experiment[] {
  try {
    const stored = localStorage.getItem(EXPERIMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load experiments:', error);
  }
  return DEFAULT_EXPERIMENTS;
}

/**
 * Save experiments to localStorage
 */
function saveExperiments(experiments: Experiment[]): void {
  try {
    localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experiments));
  } catch (error) {
    console.warn('Failed to save experiments:', error);
  }
}

/**
 * Load assignments from localStorage
 */
function loadAssignments(): Record<string, ExperimentAssignment> {
  try {
    const stored = localStorage.getItem(ASSIGNMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load assignments:', error);
  }
  return {};
}

/**
 * Save assignments to localStorage
 */
function saveAssignments(assignments: Record<string, ExperimentAssignment>): void {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.warn('Failed to save assignments:', error);
  }
}

/**
 * Assign variant based on weights
 */
function assignVariant(variants: string[], weights?: number[]): string {
  if (!weights || weights.length !== variants.length) {
    // Uniform distribution
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  }

  // Weighted distribution
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return variants[i];
    }
  }

  // Fallback to last variant
  return variants[variants.length - 1];
}

/**
 * Check if experiment is active
 */
function isExperimentActive(experiment: Experiment): boolean {
  if (!experiment.enabled) return false;

  const now = Date.now();

  if (experiment.startDate && now < experiment.startDate) {
    return false;
  }

  if (experiment.endDate && now > experiment.endDate) {
    return false;
  }

  return true;
}

/**
 * Custom hook for A/B testing
 */
export function useExperiment(experimentId: string): {
  variant: string;
  isLoading: boolean;
  trackConversion: (value?: number) => void;
  trackEvent: (action: string, metadata?: Record<string, unknown>) => void;
} {
  const [variant, setVariant] = useState<string>('control');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const experiments = loadExperiments();
    const experiment = experiments.find((exp) => exp.id === experimentId);

    if (!experiment) {
      console.warn(`Experiment '${experimentId}' not found`);
      setVariant('control');
      setIsLoading(false);
      return;
    }

    if (!isExperimentActive(experiment)) {
      // Experiment not active, use control
      setVariant('control');
      setIsLoading(false);
      return;
    }

    // Check for existing assignment
    const assignments = loadAssignments();
    let assignment = assignments[experimentId];

    if (!assignment) {
      // New assignment
      const assignedVariant = assignVariant(experiment.variants, experiment.weights);

      assignment = {
        experimentId,
        variant: assignedVariant,
        assignedAt: Date.now(),
      };

      assignments[experimentId] = assignment;
      saveAssignments(assignments);

      // Track assignment
      const analytics = getAnalytics();
      analytics.trackCustom('Experiment', 'assigned', {
        label: experimentId,
        metadata: { variant: assignedVariant },
      });
    }

    setVariant(assignment.variant);
    setIsLoading(false);
  }, [experimentId]);

  /**
   * Track conversion event
   */
  const trackConversion = useCallback(
    (value?: number) => {
      const analytics = getAnalytics();
      analytics.trackCustom('Experiment', 'conversion', {
        label: experimentId,
        value,
        metadata: { variant },
      });
    },
    [experimentId, variant]
  );

  /**
   * Track custom event for this experiment
   */
  const trackEvent = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      const analytics = getAnalytics();
      analytics.trackCustom('Experiment', action, {
        label: experimentId,
        metadata: { ...metadata, variant },
      });
    },
    [experimentId, variant]
  );

  return {
    variant,
    isLoading,
    trackConversion,
    trackEvent,
  };
}

/**
 * Hook to manage experiments (admin/testing)
 */
export function useExperimentManager() {
  const [experiments, setExperiments] = useState<Experiment[]>(loadExperiments);

  /**
   * Add experiment
   */
  const addExperiment = useCallback((experiment: Experiment) => {
    setExperiments((prev) => {
      const updated = [...prev, experiment];
      saveExperiments(updated);
      return updated;
    });
  }, []);

  /**
   * Update experiment
   */
  const updateExperiment = useCallback((experimentId: string, updates: Partial<Experiment>) => {
    setExperiments((prev) => {
      const updated = prev.map((exp) => (exp.id === experimentId ? { ...exp, ...updates } : exp));
      saveExperiments(updated);
      return updated;
    });
  }, []);

  /**
   * Delete experiment
   */
  const deleteExperiment = useCallback((experimentId: string) => {
    setExperiments((prev) => {
      const updated = prev.filter((exp) => exp.id !== experimentId);
      saveExperiments(updated);
      return updated;
    });
  }, []);

  /**
   * Toggle experiment enabled state
   */
  const toggleExperiment = useCallback((experimentId: string) => {
    setExperiments((prev) => {
      const updated = prev.map((exp) =>
        exp.id === experimentId ? { ...exp, enabled: !exp.enabled } : exp
      );
      saveExperiments(updated);
      return updated;
    });
  }, []);

  /**
   * Get experiment results
   */
  const getExperimentResults = useCallback((experimentId: string) => {
    const assignments = loadAssignments();
    const assignment = assignments[experimentId];

    return {
      experimentId,
      currentVariant: assignment?.variant || 'none',
      assignedAt: assignment?.assignedAt,
    };
  }, []);

  /**
   * Reset experiment assignment (force re-assignment)
   */
  const resetAssignment = useCallback((experimentId: string) => {
    const assignments = loadAssignments();
    delete assignments[experimentId];
    saveAssignments(assignments);
  }, []);

  /**
   * Reset all assignments
   */
  const resetAllAssignments = useCallback(() => {
    saveAssignments({});
  }, []);

  /**
   * Get all assignments
   */
  const getAllAssignments = useCallback((): ExperimentAssignment[] => {
    const assignments = loadAssignments();
    return Object.values(assignments);
  }, []);

  return {
    experiments,
    addExperiment,
    updateExperiment,
    deleteExperiment,
    toggleExperiment,
    getExperimentResults,
    resetAssignment,
    resetAllAssignments,
    getAllAssignments,
  };
}

/**
 * Utility: Force specific variant for testing
 */
export function forceVariant(experimentId: string, variant: string): void {
  const assignments = loadAssignments();

  assignments[experimentId] = {
    experimentId,
    variant,
    assignedAt: Date.now(),
  };

  saveAssignments(assignments);
}

/**
 * Utility: Get current variant assignment
 */
export function getCurrentVariant(experimentId: string): string | null {
  const assignments = loadAssignments();
  return assignments[experimentId]?.variant || null;
}

/**
 * Utility: Check if user is in variant
 */
export function isInVariant(experimentId: string, variant: string): boolean {
  return getCurrentVariant(experimentId) === variant;
}
