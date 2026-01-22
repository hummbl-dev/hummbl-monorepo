/**
 * RE2: Recursive Problem Decomposition
 * 
 * This model breaks down complex problems into simpler subproblems, solves them recursively,
 * and combines the solutions to solve the original problem.
 */

/**
 * Represents a subproblem in the decomposition
 */
export interface Subproblem<T, R> {
  /** Unique identifier for the subproblem */
  id: string;
  
  /** The subproblem data */
  data: T;
  
  /** Parent subproblem ID (null for root problem) */
  parentId: string | null;
  
  /** Depth in the decomposition tree */
  depth: number;
  
  /** Status of the subproblem */
  status: 'pending' | 'solving' | 'solved' | 'failed';
  
  /** Solution to the subproblem (if solved) */
  solution?: R;
  
  /** Error information (if failed) */
  error?: {
    message: string;
    stack?: string;
  };
  
  /** Metadata */
  meta: {
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
    tags?: string[];
  };
}

/**
 * Represents the complete decomposition of a problem
 */
export interface ProblemDecomposition<T, R> {
  /** Unique identifier for this decomposition */
  id: string;
  
  /** The original problem */
  rootProblem: T;
  
  /** All subproblems in the decomposition */
  subproblems: Map<string, Subproblem<T, R>>;
  
  /** The final solution (if solved) */
  solution?: R;
  
  /** Status of the overall problem */
  status: 'pending' | 'solving' | 'solved' | 'failed' | 'cancelled';
  
  /** Configuration for the decomposition */
  config: {
    maxDepth: number;
    maxBreadth: number;
    timeoutMs?: number;
    maxSubproblems?: number;
  };
  
  /** Statistics about the decomposition */
  stats: {
    totalSubproblems: number;
    solvedSubproblems: number;
    failedSubproblems: number;
    pendingSubproblems: number;
    maxDepth: number;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
  };
  
  /** Error information (if failed) */
  error?: {
    message: string;
    subproblemId?: string;
    stack?: string;
  };
}

/**
 * Function that determines if a problem can be decomposed further
 */
export type IsBaseCase<T> = (problem: T, depth: number) => boolean | Promise<boolean>;

/**
 * Function that solves a base case problem directly
 */
export type SolveBaseCase<T, R> = (problem: T) => R | Promise<R>;

/**
 * Function that decomposes a problem into subproblems
 */
export type DecomposeProblem<T> = (
  problem: T,
  depth: number
) => T[] | Promise<T[]>;

/**
 * Function that combines solutions to subproblems into a solution for the parent problem
 */
export type CombineSolutions<T, R> = (
  problem: T,
  subproblemSolutions: Array<{ subproblem: T; solution: R }>,
  depth: number
) => R | Promise<R>;

/**
 * Function that determines if a subproblem should be processed
 */
export type ShouldProcessSubproblem<T> = (
  subproblem: T,
  depth: number,
  parentSolution?: any
) => boolean | Promise<boolean>;

/**
 * Callback for decomposition events
 */
export type DecompositionCallback<T, R> = (
  event: DecompositionEvent<T, R>
) => void | Promise<void>;

/**
 * Events that can occur during decomposition
 */
export type DecompositionEvent<T, R> =
  | { type: 'started'; decomposition: ProblemDecomposition<T, R> }
  | { type: 'baseCaseSolved'; subproblem: Subproblem<T, R>; solution: R }
  | { type: 'subproblemCreated'; subproblem: Subproblem<T, R> }
  | { type: 'subproblemSolved'; subproblem: Subproblem<T, R>; solution: R }
  | { type: 'subproblemFailed'; subproblem: Subproblem<T, R>; error: Error }
  | { type: 'solutionCombined'; subproblem: Subproblem<T, R>; solution: R }
  | { type: 'completed'; solution: R; decomposition: ProblemDecomposition<T, R> }
  | { type: 'failed'; error: Error; decomposition: ProblemDecomposition<T, R> }
  | { type: 'cancelled'; decomposition: ProblemDecomposition<T, R> };

/**
 * Configuration for the recursive decomposition
 */
export interface RecursiveDecompositionConfig<T, R> {
  /** The problem to solve */
  problem: T;
  
  /** Function to determine if a problem is a base case */
  isBaseCase: IsBaseCase<T>;
  
  /** Function to solve a base case problem */
  solveBaseCase: SolveBaseCase<T, R>;
  
  /** Function to decompose a problem into subproblems */
  decompose: DecomposeProblem<T>;
  
  /** Function to combine solutions to subproblems */
  combine: CombineSolutions<T, R>;
  
  /** Optional function to filter subproblems */
  shouldProcessSubproblem?: ShouldProcessSubproblem<T>;
  
  /** Maximum depth of recursion (default: 10) */
  maxDepth?: number;
  
  /** Maximum number of subproblems to create at each level (default: 10) */
  maxBreadth?: number;
  
  /** Maximum total number of subproblems (default: 1000) */
  maxSubproblems?: number;
  
  /** Timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  
  /** Callback for decomposition events */
  onEvent?: DecompositionCallback<T, R>;
  
  /** Optional ID for the decomposition (auto-generated if not provided) */
  id?: string;
}

/**
 * Result of the recursive decomposition
 */
export interface RecursiveDecompositionResult<T, R> {
  /** The final solution (if successful) */
  solution?: R;
  
  /** The complete decomposition state */
  decomposition: ProblemDecomposition<T, R>;
  
  /** Whether the problem was solved successfully */
  success: boolean;
  
  /** Error information (if failed) */
  error?: Error;
}
