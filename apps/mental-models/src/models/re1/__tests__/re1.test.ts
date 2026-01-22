import { createIterativeRefinement } from '..';
import { RE1_CONSTANTS } from '../constants';

describe('RE1: Iterative Refinement Model', () => {
  // Simple test function to refine (minimize x^2)
  const testRefiner = async (x: number) => x * 0.9; // Move 10% closer to 0
  const testEvaluator = async (x: number) => ({ value: x * x });
  
  // Mock async functions for testing
  const mockRefiner = jest.fn(testRefiner);
  const mockEvaluator = jest.fn(testEvaluator);
  
  beforeEach(() => {
    mockRefiner.mockClear();
    mockEvaluator.mockClear();
  });
  
  describe('Model Initialization', () => {
    it('should create a model with the correct properties', () => {
      const { state } = createIterativeRefinement({
        initialSolution: 10,
        refine: mockRefiner,
        evaluate: mockEvaluator,
      });
      
      expect(state).toBeDefined();
      expect(state.id).toContain('refinement-');
      expect(state.iteration).toBe(0);
      expect(state.status).toBe('running');
      expect(state.metrics.iterations).toBe(0);
      expect(state.metrics.improvements).toBe(0);
    });
    
    it('should validate inputs', () => {
      // @ts-ignore - Testing invalid input
      expect(() => createIterativeRefinement({})).toThrow('Initial solution is required');
      
      // @ts-ignore - Testing invalid input
      expect(() => createIterativeRefinement({ initialSolution: 10 })).toThrow('Refiner must be a function');
      
      expect(() => 
        createIterativeRefinement({
          initialSolution: 10,
          refine: mockRefiner,
          // @ts-ignore - Testing invalid input
          evaluate: 'not a function',
        })
      ).toThrow('Evaluator must be a function');
    });
  });
  
  describe('Refinement Process', () => {
    it('should run the refinement process', async () => {
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: mockRefiner,
        evaluate: mockEvaluator,
        maxIterations: 5,
      });
      
      const result = await refine();
      
      expect(mockRefiner).toHaveBeenCalledTimes(5);
      expect(mockEvaluator).toHaveBeenCalledTimes(6); // Initial + 5 iterations
      expect(result.state.iteration).toBe(5);
      expect(result.state.status).toBe('stopped');
      expect(result.reason).toBe('max_iterations');
      expect(result.state.history).toHaveLength(6); // Initial + 5 iterations
    });
    
    it('should stop when converged', async () => {
      // This refiner quickly converges to 0
      const convergingRefiner = async (x: number) => x * 0.1;
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: convergingRefiner,
        evaluate: testEvaluator,
        maxIterations: 100,
        minImprovement: 0.01,
      });
      
      const result = await refine();
      
      // Should converge in a few iterations
      expect(result.state.iteration).toBeLessThan(10);
      expect(result.state.status).toBe('converged');
      expect(result.reason).toBe('converged');
      expect(result.converged).toBe(true);
      
      // Final value should be very close to 0
      const finalValue = result.state.currentSolution;
      expect(finalValue).toBeLessThan(0.01);
    });
    
    it('should stop early if no improvement', async () => {
      const noImprovementRefiner = async (x: number) => x; // No change
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: noImprovementRefiner,
        evaluate: testEvaluator,
        maxIterations: 10,
        patience: 2, // Stop after 2 iterations with no improvement
      });
      
      const result = await refine();
      
      // Should stop after initial + 2 no-improvement iterations
      expect(result.state.iteration).toBe(2);
      expect(result.state.status).toBe('stopped');
      expect(result.reason).toBe('no_improvement');
    });
  });
  
  describe('Event Handling', () => {
    it('should call iteration callbacks', async () => {
      const onIteration = jest.fn();
      const onComplete = jest.fn();
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: testRefiner,
        evaluate: testEvaluator,
        maxIterations: 3,
        onIteration,
        onComplete,
      });
      
      await refine();
      
      // Should be called once per iteration (3 iterations)
      expect(onIteration).toHaveBeenCalledTimes(3);
      
      // onComplete should be called once
      expect(onComplete).toHaveBeenCalledTimes(1);
      
      // Check that the callback received the correct data
      const callbackData = onIteration.mock.calls[0][0];
      expect(callbackData.iteration).toBe(1);
      expect(callbackData.state.iteration).toBe(1);
      expect(callbackData.improved).toBeDefined();
    });
    
    it('should handle errors in callbacks gracefully', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: testRefiner,
        evaluate: testEvaluator,
        maxIterations: 2,
        onIteration: errorCallback,
      });
      
      // Should not throw
      await expect(refine()).resolves.toBeDefined();
      
      // Callback should still have been called
      expect(errorCallback).toHaveBeenCalled();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors in refiner', async () => {
      const errorRefiner = jest.fn().mockRejectedValue(new Error('Refiner error'));
      const onError = jest.fn();
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: errorRefiner,
        evaluate: testEvaluator,
        maxIterations: 3,
        onError,
      });
      
      const result = await refine();
      
      expect(result.state.status).toBe('error');
      expect(result.reason).toBe('error');
      expect(result.state.error).toBeDefined();
      expect(result.state.error?.message).toBe('Refiner error');
      expect(onError).toHaveBeenCalled();
    });
    
    it('should handle errors in evaluator', async () => {
      const errorEvaluator = jest.fn().mockRejectedValueOnce(new Error('Evaluator error'));
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: testRefiner,
        evaluate: errorEvaluator,
        maxIterations: 3,
      });
      
      const result = await refine();
      
      expect(result.state.status).toBe('error');
      expect(result.reason).toBe('error');
      expect(result.state.error?.message).toBe('Evaluator error');
    });
  });
  
  describe('Custom Should Continue', () => {
    it('should respect custom shouldContinue function', async () => {
      const shouldContinue = jest.fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false); // Stop after 2 iterations
      
      const { refine } = createIterativeRefinement({
        initialSolution: 10,
        refine: testRefiner,
        evaluate: testEvaluator,
        shouldContinue,
        maxIterations: 10, // Should stop before this
      });
      
      const result = await refine();
      
      expect(shouldContinue).toHaveBeenCalledTimes(3); // Called once before each iteration
      expect(result.state.iteration).toBe(2);
      expect(result.state.status).toBe('stopped');
    });
  });
});
