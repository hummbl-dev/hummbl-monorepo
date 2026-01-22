import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  RecursiveDecompositionConfig,
  RecursiveDecompositionResult,
  DecompositionCallback,
  DecompositionEvent,
  Subproblem,
  IsBaseCase,
  SolveBaseCase,
  DecomposeProblem,
  CombineSolutions,
  ShouldProcessSubproblem,
} from './types';

import {
  RE2_CONSTANTS,
  createProblemDecomposition,
  createSubproblem,
  updateSubproblem,
  addSubproblem,
  checkLimits,
  getChildSubproblems,
  getSubproblemSolution,
} from './constants';

/**
 * Performs recursive problem decomposition
 */
export async function recursiveDecompose<T, R>(
  config: RecursiveDecompositionConfig<T, R>
): Promise<RecursiveDecompositionResult<T, R>> {
  // Validate inputs
  if (typeof config.isBaseCase !== 'function') {
    throw new Error(RE2_CONSTANTS.ERRORS.INVALID_BASE_CASE);
  }
  
  if (typeof config.solveBaseCase !== 'function') {
    throw new Error(RE2_CONSTANTS.ERRORS.INVALID_SOLVER);
  }
  
  if (typeof config.decompose !== 'function') {
    throw new Error(RE2_CONSTANTS.ERRORS.INVALID_DECOMPOSER);
  }
  
  if (typeof config.combine !== 'function') {
    throw new Error(RE2_CONSTANTS.ERRORS.INVALID_COMBINER);
  }
  
  // Create event emitter for callbacks
  const eventEmitter = new EventEmitter();
  
  // Add event listener if provided
  if (config.onEvent) {
    eventEmitter.on('event', config.onEvent);
  }
  
  // Create initial decomposition
  let decomposition = createProblemDecomposition<T, R>(config.problem, {
    maxDepth: config.maxDepth,
    maxBreadth: config.maxBreadth,
    maxSubproblems: config.maxSubproblems,
    timeoutMs: config.timeoutMs,
    id: config.id,
  });
  
  // Emit started event
  const emitEvent = (event: DecompositionEvent<T, R>) => {
    eventEmitter.emit('event', event);
  };
  
  emitEvent({
    type: 'started',
    decomposition: { ...decomposition },
  });
  
  try {
    // Start the recursive decomposition
    await decomposeAndSolve(
      decomposition,
      config,
      emitEvent
    );
    
    // Get the final solution
    const rootSubproblem = Array.from(decomposition.subproblems.values())
      .find(sub => sub.parentId === null);
      
    if (!rootSubproblem || rootSubproblem.status !== 'solved' || rootSubproblem.solution === undefined) {
      throw new Error(RE2_CONSTANTS.ERRORS.NO_SOLUTION);
    }
    
    const solution = rootSubproblem.solution;
    
    // Update decomposition status
    decomposition = {
      ...decomposition,
      status: 'solved',
      solution,
      stats: {
        ...decomposition.stats,
        endTime: new Date(),
        durationMs: new Date().getTime() - decomposition.stats.startTime.getTime(),
      },
    };
    
    // Emit completed event
    emitEvent({
      type: 'completed',
      solution,
      decomposition: { ...decomposition },
    });
    
    return {
      solution,
      decomposition,
      success: true,
    };
    
  } catch (error) {
    // Update decomposition status
    decomposition = {
      ...decomposition,
      status: 'failed',
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      stats: {
        ...decomposition.stats,
        endTime: new Date(),
        durationMs: new Date().getTime() - decomposition.stats.startTime.getTime(),
      },
    };
    
    // Emit failed event
    emitEvent({
      type: 'failed',
      error: error as Error,
      decomposition: { ...decomposition },
    });
    
    return {
      decomposition,
      success: false,
      error: error as Error,
    };
  }
}

/**
 * Recursively decomposes and solves a problem
 */
async function decomposeAndSolve<T, R>(
  decomposition: ProblemDecomposition<T, R>,
  config: RecursiveDecompositionConfig<T, R>,
  emitEvent: (event: DecompositionEvent<T, R>) => void,
  subproblemId?: string,
  depth: number = 0
): Promise<void> {
  // Get the current subproblem (or root problem)
  const subproblem = subproblemId 
    ? decomposition.subproblems.get(subproblemId)
    : Array.from(decomposition.subproblems.values()).find(s => s.parentId === null);
    
  if (!subproblem) {
    throw new Error(`Subproblem ${subproblemId} not found`);
  }
  
  // Check if we've exceeded any limits
  const limitCheck = checkLimits(decomposition);
  if (limitCheck.exceeded) {
    throw new Error(limitCheck.reason);
  }
  
  // Mark as solving
  decomposition = updateSubproblem(decomposition, subproblem.id, {
    status: 'solving',
    meta: {
      ...subproblem.meta,
      startedAt: new Date(),
    },
  });
  
  // Check if this is a base case
  const isBase = await config.isBaseCase(subproblem.data, depth);
  
  if (isBase) {
    // Solve the base case
    try {
      const solution = await config.solveBaseCase(subproblem.data);
      
      // Update the subproblem with the solution
      decomposition = updateSubproblem(decomposition, subproblem.id, {
        status: 'solved',
        solution,
        meta: {
          ...subproblem.meta,
          completedAt: new Date(),
          durationMs: new Date().getTime() - (subproblem.meta.startedAt?.getTime() || new Date().getTime()),
        },
      });
      
      // Emit event
      emitEvent({
        type: 'baseCaseSolved',
        subproblem: decomposition.subproblems.get(subproblem.id)!,
        solution,
      });
      
    } catch (error) {
      // Mark as failed
      decomposition = updateSubproblem(decomposition, subproblem.id, {
        status: 'failed',
        error: {
          message: (error as Error).message,
          stack: error.stack,
        },
        meta: {
          ...subproblem.meta,
          completedAt: new Date(),
          durationMs: new Date().getTime() - (subproblem.meta.startedAt?.getTime() || new Date().getTime()),
        },
      });
      
      // Emit event
      emitEvent({
        type: 'subproblemFailed',
        subproblem: decomposition.subproblems.get(subproblem.id)!,
        error,
      });
      
      throw error;
    }
    
  } else {
    // Decompose the problem into subproblems
    let subproblems: T[] = [];
    
    try {
      subproblems = await config.decompose(subproblem.data, depth);
      
      // Apply breadth limit
      if (config.maxBreadth && subproblems.length > config.maxBreadth) {
        subproblems = subproblems.slice(0, config.maxBreadth);
      }
      
    } catch (error) {
      // Mark as failed
      decomposition = updateSubproblem(decomposition, subproblem.id, {
        status: 'failed',
        error: {
          message: `Failed to decompose: ${(error as Error).message}`,
          stack: error.stack,
        },
        meta: {
          ...subproblem.meta,
          completedAt: new Date(),
          durationMs: new Date().getTime() - (subproblem.meta.startedAt?.getTime() || new Date().getTime()),
        },
      });
      
      // Emit event
      emitEvent({
        type: 'subproblemFailed',
        subproblem: decomposition.subproblems.get(subproblem.id)!,
        error,
      });
      
      throw error;
    }
    
    // Create and solve subproblems
    const childSubproblems: Subproblem<T, R>[] = [];
    
    for (const subproblemData of subproblems) {
      // Check if we should process this subproblem
      const shouldProcess = config.shouldProcessSubproblem
        ? await config.shouldProcessSubproblem(subproblemData, depth + 1, subproblem.solution)
        : true;
        
      if (!shouldProcess) continue;
      
      // Create the subproblem
      const childSubproblem = createSubproblem<T, R>(
        subproblemData,
        subproblem.id,
        depth + 1
      );
      
      // Add to decomposition
      decomposition = addSubproblem(decomposition, childSubproblem);
      childSubproblems.push(childSubproblem);
      
      // Emit event
      emitEvent({
        type: 'subproblemCreated',
        subproblem: childSubproblem,
      });
      
      // Recursively solve the subproblem
      try {
        await decomposeAndSolve(
          decomposition,
          config,
          emitEvent,
          childSubproblem.id,
          depth + 1
        );
        
      } catch (error) {
        // If a subproblem fails, we might want to handle it differently
        // For now, we'll just rethrow the error
        throw error;
      }
    }
    
    // After all subproblems are solved, combine their solutions
    try {
      // Get the latest decomposition state
      const currentDecomposition = { ...decomposition };
      
      // Get solutions to all child subproblems
      const childSolutions = await Promise.all(
        childSubproblems.map(async (child) => {
          const solution = await getSubproblemSolution(
            currentDecomposition,
            child.id,
            config.combine
          );
          return { subproblem: child.data, solution };
        })
      );
      
      // Combine the solutions
      const combinedSolution = await config.combine(
        subproblem.data,
        childSolutions,
        depth
      );
      
      // Update the parent subproblem with the combined solution
      decomposition = updateSubproblem(decomposition, subproblem.id, {
        status: 'solved',
        solution: combinedSolution,
        meta: {
          ...subproblem.meta,
          completedAt: new Date(),
          durationMs: new Date().getTime() - (subproblem.meta.startedAt?.getTime() || new Date().getTime()),
        },
      });
      
      // Emit event
      emitEvent({
        type: 'solutionCombined',
        subproblem: decomposition.subproblems.get(subproblem.id)!,
        solution: combinedSolution,
      });
      
    } catch (error) {
      // Mark as failed
      decomposition = updateSubproblem(decomposition, subproblem.id, {
        status: 'failed',
        error: {
          message: `Failed to combine solutions: ${(error as Error).message}`,
          stack: error.stack,
        },
        meta: {
          ...subproblem.meta,
          completedAt: new Date(),
          durationMs: new Date().getTime() - (subproblem.meta.startedAt?.getTime() || new Date().getTime()),
        },
      });
      
      // Emit event
      emitEvent({
        type: 'subproblemFailed',
        subproblem: decomposition.subproblems.get(subproblem.id)!,
        error,
      });
      
      throw error;
    }
  }
}

// Export types
export * from './types';
export * from './constants';

export default recursiveDecompose;
