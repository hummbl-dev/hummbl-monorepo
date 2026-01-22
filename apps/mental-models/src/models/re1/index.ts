import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  RefinementConfig,
  RefinementState,
  RefinementResult,
  RefinementCallback,
  Refiner,
  Evaluator,
  ShouldContinue,
} from './types';
import {
  RE1_CONSTANTS,
  createRefinementState,
  defaultShouldContinue,
  defaultEvaluator,
  defaultRefiner,
  updateRefinementState,
  hasConverged,
} from './constants';

/**
 * Creates a new Iterative Refinement model instance
 */
export function createIterativeRefinement<T>(
  config: RefinementConfig<T>
): { refine: () => Promise<RefinementResult<T>>; state: RefinementState<T> } {
  // Validate inputs
  if (!config.initialSolution) {
    throw new Error(RE1_CONSTANTS.ERRORS.INVALID_SOLUTION);
  }
  
  if (typeof config.refine !== 'function') {
    throw new Error(RE1_CONSTANTS.ERRORS.INVALID_REFINER);
  }
  
  if (typeof config.evaluate !== 'function') {
    throw new Error(RE1_CONSTANTS.ERRORS.INVALID_EVALUATOR);
  }
  
  // Initialize state
  const state = createRefinementState<T>({
    ...config,
    shouldContinue: config.shouldContinue || defaultShouldContinue,
  });
  
  const eventEmitter = new EventEmitter();
  
  // Helper to emit events
  const emit = (event: string, data?: any) => {
    eventEmitter.emit(event, { ...data, state });
  };
  
  // Add event listeners
  if (config.onIteration) {
    eventEmitter.on(RE1_CONSTANTS.EVENTS.ITERATION_END, config.onIteration);
  }
  
  if (config.onComplete) {
    eventEmitter.on(RE1_CONSTANTS.EVENTS.CONVERGED, config.onComplete);
    eventEmitter.on(RE1_CONSTANTS.EVENTS.STOPPED, config.onComplete);
  }
  
  if (config.onError) {
    eventEmitter.on(RE1_CONSTANTS.EVENTS.ERROR, config.onError);
  }
  
  // Main refinement function
  const refine = async (): Promise<RefinementResult<T>> => {
    try {
      // Initial evaluation
      const initialMetrics = await config.evaluate(state.currentSolution);
      
      // Update state with initial metrics
      state.history.push({
        iteration: 0,
        solution: state.currentSolution,
        metrics: initialMetrics,
      });
      
      state.metrics.iterations = 1;
      
      // Main refinement loop
      while (await (config.shouldContinue || defaultShouldContinue)(state)) {
        emit(RE1_CONSTANTS.EVENTS.ITERATION_START, { iteration: state.iteration });
        
        try {
          // Refine the solution
          const refinedSolution = await config.refine(
            state.currentSolution,
            [...state.history],
            state.iteration
          );
          
          // Evaluate the refined solution
          const metrics = await config.evaluate(refinedSolution);
          
          // Check for improvement
          const previousMetrics = state.history[state.history.length - 1]?.metrics || {};
          const improved = hasImproved(previousMetrics, metrics, state.config.metricsToTrack);
          
          // Update state
          state.iteration++;
          state.currentSolution = refinedSolution;
          state.history.push({
            iteration: state.iteration,
            solution: refinedSolution,
            metrics,
            feedback: improved ? ['Improved'] : [],
          });
          
          if (improved) {
            state.metrics.improvements++;
            state.metrics.lastImprovementIteration = state.iteration;
          }
          
          // Emit iteration end event
          emit(RE1_CONSTANTS.EVENTS.ITERATION_END, {
            iteration: state.iteration,
            solution: refinedSolution,
            metrics,
            improved,
          });
          
          // Check for convergence
          if (hasConverged(state)) {
            state.status = 'converged';
            emit(RE1_CONSTANTS.EVENTS.CONVERGED, {
              iteration: state.iteration,
              solution: state.currentSolution,
              metrics,
            });
            
            return createRefinementResult(state, 'converged');
          }
          
        } catch (error) {
          state.status = 'error';
          state.error = {
            message: error.message,
            iteration: state.iteration,
            stack: error.stack,
          };
          
          emit(RE1_CONSTANTS.EVENTS.ERROR, {
            error,
            iteration: state.iteration,
          });
          
          if (config.onError) {
            config.onError(error, state);
          }
          
          return createRefinementResult(state, 'error');
        }
      }
      
      // If we get here, we've stopped for some reason other than convergence
      state.status = 'stopped';
      const reason = determineStopReason(state);
      emit(RE1_CONSTANTS.EVENTS.STOPPED, {
        reason,
        iteration: state.iteration,
        solution: state.currentSolution,
      });
      
      return createRefinementResult(state, reason);
      
    } catch (error) {
      state.status = 'error';
      state.error = {
        message: error.message,
        iteration: state.iteration,
        stack: error.stack,
      };
      
      emit(RE1_CONSTANTS.EVENTS.ERROR, {
        error,
        iteration: state.iteration,
      });
      
      if (config.onError) {
        config.onError(error, state);
      }
      
      return createRefinementResult(state, 'error');
    } finally {
      // Clean up
      state.metrics.endTime = new Date();
      state.metrics.durationMs = state.metrics.endTime.getTime() - state.metrics.startTime.getTime();
    }
  };
  
  return { refine, state };
}

/**
 * Helper to determine if the solution has improved
 */
function hasImproved(
  previousMetrics: Record<string, number>,
  currentMetrics: Record<string, number>,
  metricsToTrack: string[]
): boolean {
  // If we don't have previous metrics, consider it an improvement
  if (!previousMetrics) return true;
  
  // Check each tracked metric for improvement
  for (const metric of metricsToTrack) {
    if (currentMetrics[metric] === undefined || previousMetrics[metric] === undefined) {
      continue;
    }
    
    // For metrics where higher is better (like accuracy)
    if (currentMetrics[metric] > previousMetrics[metric]) {
      return true;
    }
    
    // For metrics where lower is better (like loss)
    if (currentMetrics[metric] < previousMetrics[metric]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Determines the reason for stopping
 */
function determineStopReason<T>(state: RefinementState<T>): 'max_iterations' | 'no_improvement' | 'error' {
  if (state.status === 'error') return 'error';
  
  if (state.iteration >= state.config.maxIterations) {
    return 'max_iterations';
  }
  
  if (state.config.patience && state.metrics.lastImprovementIteration !== undefined) {
    const iterationsSinceImprovement = state.iteration - state.metrics.lastImprovementIteration;
    if (iterationsSinceImprovement >= state.config.patience) {
      return 'no_improvement';
    }
  }
  
  return 'max_iterations'; // Default fallback
}

/**
 * Creates a refinement result from the current state
 */
function createRefinementResult<T>(
  state: RefinementState<T>,
  reason: 'converged' | 'max_iterations' | 'no_improvement' | 'error' | 'stopped'
): RefinementResult<T> {
  const currentMetrics = state.history[state.history.length - 1]?.metrics || {};
  
  return {
    solution: state.currentSolution,
    metrics: currentMetrics,
    state: { ...state },
    converged: reason === 'converged',
    reason,
  };
}

// Export types
export * from './types';
export * from './constants';

export default createIterativeRefinement;
