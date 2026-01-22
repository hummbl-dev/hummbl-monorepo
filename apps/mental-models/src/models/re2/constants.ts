import { v4 as uuidv4 } from 'uuid';
import { ProblemDecomposition, Subproblem } from './types';

/**
 * Constants for the Recursive Problem Decomposition model (RE2)
 */

export const RE2_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'RE2',
  MODEL_NAME: 'Recursive Problem Decomposition',
  TRANSFORMATION: 'Recursion',
  VERSION: '1.0.0',
  
  // Default configuration values
  DEFAULTS: {
    MAX_DEPTH: 10,
    MAX_BREADTH: 10,
    MAX_SUBPROBLEMS: 1000,
    TIMEOUT_MS: 30000, // 30 seconds
  },
  
  // Error messages
  ERRORS: {
    MAX_DEPTH_EXCEEDED: 'Maximum recursion depth exceeded',
    MAX_SUBPROBLEMS_EXCEEDED: 'Maximum number of subproblems exceeded',
    TIMEOUT: 'Decomposition timed out',
    CANCELLED: 'Decomposition was cancelled',
    INVALID_BASE_CASE: 'isBaseCase must be a function',
    INVALID_SOLVER: 'solveBaseCase must be a function',
    INVALID_DECOMPOSER: 'decompose must be a function',
    INVALID_COMBINER: 'combine must be a function',
    NO_SOLUTION: 'No solution was generated',
  },
  
  // Events
  EVENTS: {
    STARTED: 'started',
    BASE_CASE_SOLVED: 'baseCaseSolved',
    SUBPROBLEM_CREATED: 'subproblemCreated',
    SUBPROBLEM_SOLVED: 'subproblemSolved',
    SUBPROBLEM_FAILED: 'subproblemFailed',
    SOLUTION_COMBINED: 'solutionCombined',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },
} as const;

/**
 * Creates a new subproblem
 */
export function createSubproblem<T, R>(
  data: T,
  parentId: string | null,
  depth: number,
  id: string = `sub-${uuidv4()}`
): Subproblem<T, R> {
  const now = new Date();
  
  return {
    id,
    data,
    parentId,
    depth,
    status: 'pending',
    meta: {
      createdAt: now,
      tags: [],
    },
  };
}

/**
 * Creates a new problem decomposition
 */
export function createProblemDecomposition<T, R>(
  problem: T,
  config: {
    maxDepth?: number;
    maxBreadth?: number;
    maxSubproblems?: number;
    timeoutMs?: number;
    id?: string;
  } = {}
): ProblemDecomposition<T, R> {
  const now = new Date();
  const id = config.id || `decomp-${uuidv4()}`;
  
  const rootSubproblem = createSubproblem<T, R>(problem, null, 0, `${id}-root`);
  
  return {
    id,
    rootProblem: problem,
    subproblems: new Map([[rootSubproblem.id, rootSubproblem]]),
    status: 'pending',
    config: {
      maxDepth: config.maxDepth ?? RE2_CONSTANTS.DEFAULTS.MAX_DEPTH,
      maxBreadth: config.maxBreadth ?? RE2_CONSTANTS.DEFAULTS.MAX_BREADTH,
      maxSubproblems: config.maxSubproblems ?? RE2_CONSTANTS.DEFAULTS.MAX_SUBPROBLEMS,
      timeoutMs: config.timeoutMs ?? RE2_CONSTANTS.DEFAULTS.TIMEOUT_MS,
    },
    stats: {
      totalSubproblems: 1,
      solvedSubproblems: 0,
      failedSubproblems: 0,
      pendingSubproblems: 1,
      maxDepth: 0,
      startTime: now,
    },
  };
}

/**
 * Updates a subproblem in the decomposition
 */
export function updateSubproblem<T, R>(
  decomposition: ProblemDecomposition<T, R>,
  subproblemId: string,
  updates: Partial<Subproblem<T, R>>
): ProblemDecomposition<T, R> {
  const subproblem = decomposition.subproblems.get(subproblemId);
  if (!subproblem) return decomposition;
  
  const updatedSubproblem = { ...subproblem, ...updates };
  
  // Update the subproblem in the map
  const subproblems = new Map(decomposition.subproblems);
  subproblems.set(subproblemId, updatedSubproblem);
  
  // Update statistics
  const stats = { ...decomposition.stats };
  
  if (updates.status === 'solved') {
    stats.solvedSubproblems = (decomposition.stats.solvedSubproblems || 0) + 1;
    stats.pendingSubproblems = Math.max(0, (decomposition.stats.pendingSubproblems || 1) - 1);
  } else if (updates.status === 'failed') {
    stats.failedSubproblems = (decomposition.stats.failedSubproblems || 0) + 1;
    stats.pendingSubproblems = Math.max(0, (decomposition.stats.pendingSubproblems || 1) - 1);
  }
  
  return {
    ...decomposition,
    subproblems,
    stats,
  };
}

/**
 * Adds a new subproblem to the decomposition
 */
export function addSubproblem<T, R>(
  decomposition: ProblemDecomposition<T, R>,
  subproblem: Subproblem<T, R>
): ProblemDecomposition<T, R> {
  const subproblems = new Map(decomposition.subproblems);
  subproblems.set(subproblem.id, subproblem);
  
  return {
    ...decomposition,
    subproblems,
    stats: {
      ...decomposition.stats,
      totalSubproblems: decomposition.stats.totalSubproblems + 1,
      pendingSubproblems: decomposition.stats.pendingSubproblems + 1,
      maxDepth: Math.max(decomposition.stats.maxDepth, subproblem.depth),
    },
  };
}

/**
 * Checks if the decomposition has exceeded its limits
 */
export function checkLimits<T, R>(
  decomposition: ProblemDecomposition<T, R>
): { exceeded: boolean; reason?: string } {
  const { config, stats } = decomposition;
  
  if (stats.maxDepth > (config.maxDepth || RE2_CONSTANTS.DEFAULTS.MAX_DEPTH)) {
    return { exceeded: true, reason: RE2_CONSTANTS.ERRORS.MAX_DEPTH_EXCEEDED };
  }
  
  if (stats.totalSubproblems > (config.maxSubproblems || RE2_CONSTANTS.DEFAULTS.MAX_SUBPROBLEMS)) {
    return { exceeded: true, reason: RE2_CONSTANTS.ERRORS.MAX_SUBPROBLEMS_EXCEEDED };
  }
  
  if (config.timeoutMs && stats.startTime) {
    const elapsed = Date.now() - stats.startTime.getTime();
    if (elapsed > config.timeoutMs) {
      return { exceeded: true, reason: RE2_CONSTANTS.ERRORS.TIMEOUT };
    }
  }
  
  return { exceeded: false };
}

/**
 * Gets all child subproblems of a parent subproblem
 */
export function getChildSubproblems<T, R>(
  decomposition: ProblemDecomposition<T, R>,
  parentId: string
): Subproblem<T, R>[] {
  return Array.from(decomposition.subproblems.values())
    .filter(subproblem => subproblem.parentId === parentId);
}

/**
 * Gets the solution to a subproblem, either directly or by combining child solutions
 */
export async function getSubproblemSolution<T, R>(
  decomposition: ProblemDecomposition<T, R>,
  subproblemId: string,
  combine: (problem: T, subproblemSolutions: Array<{ subproblem: T; solution: R }>) => Promise<R>
): Promise<R> {
  const subproblem = decomposition.subproblems.get(subproblemId);
  if (!subproblem) {
    throw new Error(`Subproblem ${subproblemId} not found`);
  }
  
  // If the subproblem already has a solution, return it
  if (subproblem.status === 'solved' && subproblem.solution !== undefined) {
    return subproblem.solution;
  }
  
  // Otherwise, get solutions to all child subproblems and combine them
  const children = getChildSubproblems(decomposition, subproblemId);
  
  // Get solutions to all child subproblems in parallel
  const childSolutions = await Promise.all(
    children.map(async (child) => {
      const solution = await getSubproblemSolution(decomposition, child.id, combine);
      return { subproblem: child.data, solution };
    })
  );
  
  // Combine the solutions
  return combine(subproblem.data, childSolutions);
}
