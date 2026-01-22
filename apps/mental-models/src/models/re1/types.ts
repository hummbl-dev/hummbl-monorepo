/**
 * RE1: Iterative Refinement
 * 
 * This model implements an iterative refinement process that progressively enhances solutions
 * through multiple passes, with each iteration building upon the previous one.
 */

/**
 * Represents the state of the refinement process
 */
export interface RefinementState<T> {
  /** Unique identifier for this refinement process */
  id: string;
  
  /** Current iteration number (1-based) */
  iteration: number;
  
  /** Current solution state */
  currentSolution: T;
  
  /** History of all solutions (including initial and final) */
  history: Array<{
    iteration: number;
    solution: T;
    metrics?: Record<string, number>;
    feedback?: string[];
  }>;
  
  /** Metrics about the refinement process */
  metrics: {
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    iterations: number;
    improvements: number;
    lastImprovementIteration?: number;
  };
  
  /** Configuration for the refinement process */
  config: {
    maxIterations: number;
    minImprovement: number;
    patience?: number;
    metricsToTrack: string[];
  };
  
  /** Current status of the refinement */
  status: 'running' | 'converged' | 'max_iterations' | 'stopped' | 'error';
  
  /** Error information if status is 'error' */
  error?: {
    message: string;
    iteration: number;
    stack?: string;
  };
}

/**
 * Function that evaluates a solution and returns metrics
 */
export type Evaluator<T> = (solution: T) => Promise<Record<string, number>>;

/**
 * Function that refines a solution
 */
export type Refiner<T> = (
  current: T,
  history: Array<{ iteration: number; solution: T; metrics?: Record<string, number> }>,
  iteration: number
) => Promise<T>;

/**
 * Function that determines if the refinement should continue
 */
export type ShouldContinue<T> = (
  state: RefinementState<T>
) => boolean | Promise<boolean>;

/**
 * Callback function for refinement events
 */
export type RefinementCallback<T> = (state: RefinementState<T>) => void | Promise<void>;

/**
 * Configuration for the iterative refinement process
 */
export interface RefinementConfig<T> {
  /** Initial solution to start refining */
  initialSolution: T;
  
  /** Function to evaluate a solution */
  evaluate: Evaluator<T>;
  
  /** Function to refine a solution */
  refine: Refiner<T>;
  
  /** Function to determine if refinement should continue */
  shouldContinue?: ShouldContinue<T>;
  
  /** Maximum number of iterations */
  maxIterations?: number;
  
  /** Minimum improvement required to continue (0-1) */
  minImprovement?: number;
  
  /** Number of iterations to wait for improvement before stopping */
  patience?: number;
  
  /** Metrics to track during refinement */
  metricsToTrack?: string[];
  
  /** Callback for iteration events */
  onIteration?: RefinementCallback<T>;
  
  /** Callback for completion */
  onComplete?: RefinementCallback<T>;
  
  /** Callback for errors */
  onError?: (error: Error, state: RefinementState<T>) => void;
}

/**
 * Result of the refinement process
 */
export interface RefinementResult<T> {
  /** Final refined solution */
  solution: T;
  
  /** Final metrics */
  metrics: Record<string, number>;
  
  /** Final state of the refinement process */
  state: RefinementState<T>;
  
  /** Whether the refinement converged */
  converged: boolean;
  
  /** Reason for stopping */
  reason: 'converged' | 'max_iterations' | 'no_improvement' | 'error' | 'stopped';
}
