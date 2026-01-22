import { RefinementConfig, RefinementState } from './types';

/**
 * Constants for the Iterative Refinement model (RE1)
 */

export const RE1_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'RE1',
  MODEL_NAME: 'Iterative Refinement',
  TRANSFORMATION: 'Recursion',
  VERSION: '1.0.0',
  
  // Default configuration values
  DEFAULTS: {
    MAX_ITERATIONS: 10,
    MIN_IMPROVEMENT: 0.01, // 1% minimum improvement
    PATIENCE: 3, // Stop if no improvement for 3 iterations
    METRICS_TO_TRACK: ['score', 'accuracy', 'loss'],
  },
  
  // Error messages
  ERRORS: {
    MAX_ITERATIONS_EXCEEDED: 'Maximum number of iterations reached',
    NO_IMPROVEMENT: 'No improvement for the last {n} iterations',
    INVALID_EVALUATOR: 'Evaluator must be a function',
    INVALID_REFINER: 'Refiner must be a function',
    INVALID_SOLUTION: 'Initial solution is required',
  },
  
  // Events
  EVENTS: {
    ITERATION_START: 'iteration:start',
    ITERATION_END: 'iteration:end',
    CONVERGED: 'converged',
    STOPPED: 'stopped',
    ERROR: 'error',
  },
} as const;

/**
 * Creates a new refinement state with default values
 */
export function createRefinementState<T>(
  config: RefinementConfig<T>,
  customDefaults: Partial<RefinementState<T>> = {}
): RefinementState<T> {
  const now = new Date();
  
  const defaultState: RefinementState<T> = {
    id: `refinement-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    iteration: 0,
    currentSolution: config.initialSolution,
    history: [],
    metrics: {
      startTime: now,
      iterations: 0,
      improvements: 0,
    },
    config: {
      maxIterations: config.maxIterations ?? RE1_CONSTANTS.DEFAULTS.MAX_ITERATIONS,
      minImprovement: config.minImprovement ?? RE1_CONSTANTS.DEFAULTS.MIN_IMPROVEMENT,
      patience: config.patience ?? RE1_CONSTANTS.DEFAULTS.PATIENCE,
      metricsToTrack: config.metricsToTrack ?? [...RE1_CONSTANTS.DEFAULTS.METRICS_TO_TRACK],
    },
    status: 'running',
  };
  
  return { ...defaultState, ...customDefaults };
}

/**
 * Default shouldContinue function that checks for convergence based on improvement
 */
export const defaultShouldContinue: <T>(
  state: RefinementState<T>
) => Promise<boolean> = async (state) => {
  // Check max iterations
  if (state.iteration >= state.config.maxIterations) {
    return false;
  }
  
  // Check for no improvement in last N iterations
  if (state.config.patience && state.metrics.lastImprovementIteration !== undefined) {
    const iterationsSinceImprovement = state.iteration - state.metrics.lastImprovementIteration;
    if (iterationsSinceImprovement >= state.config.patience) {
      return false;
    }
  }
  
  // Check if we have enough history to evaluate improvement
  if (state.history.length >= 2) {
    const current = state.history[state.history.length - 1];
    const previous = state.history[state.history.length - 2];
    
    // Calculate improvement for each tracked metric
    const improvements = state.config.metricsToTrack.map(metric => {
      if (current.metrics?.[metric] !== undefined && previous.metrics?.[metric] !== undefined) {
        return (current.metrics[metric] - previous.metrics[metric]) / Math.abs(previous.metrics[metric]);
      }
      return 0;
    });
    
    // If no improvement in any metric, check if we should stop
    if (improvements.every(imp => Math.abs(imp) < state.config.minImprovement)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Default evaluator that returns an empty metrics object
 */
export const defaultEvaluator: <T>(
  solution: T
) => Promise<Record<string, number>> = async () => ({});

/**
 * Default refiner that returns the same solution
 */
export const defaultRefiner: <T>(
  current: T,
  _history: any[],
  _iteration: number
) => Promise<T> = async (current) => current;

/**
 * Helper function to update refinement state after an iteration
 */
export function updateRefinementState<T>(
  state: RefinementState<T>,
  updates: Partial<RefinementState<T>>
): RefinementState<T> {
  return {
    ...state,
    ...updates,
    metrics: {
      ...state.metrics,
      ...(updates.metrics || {}),
    },
    config: {
      ...state.config,
      ...(updates.config || {}),
    },
  };
}

/**
 * Helper function to check if the refinement has converged
 */
export function hasConverged<T>(state: RefinementState<T>): boolean {
  // Not enough history to determine convergence
  if (state.history.length < 2) return false;
  
  const current = state.history[state.history.length - 1];
  const previous = state.history[state.history.length - 2];
  
  // Check if all tracked metrics have converged (improvement < minImprovement)
  return state.config.metricsToTrack.every(metric => {
    if (current.metrics?.[metric] === undefined || previous.metrics?.[metric] === undefined) {
      return true; // Skip metrics that aren't present
    }
    
    const improvement = Math.abs(
      (current.metrics[metric] - previous.metrics[metric]) / 
      Math.max(1e-10, Math.abs(previous.metrics[metric]))
    );
    
    return improvement < state.config.minImprovement;
  });
}
