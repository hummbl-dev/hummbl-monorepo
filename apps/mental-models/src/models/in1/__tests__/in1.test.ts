import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { 
  createIN1Model, 
  IN1Model, 
  invertQuestion, 
  generateFailureModes, 
  generateAvoidanceStrategies, 
  generateInsights 
} from '../IN1Model';

describe('IN1Model', () => {
  let model: IN1Model;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    model = createIN1Model({
      eventEmitter,
      telemetryEnabled: true,
    });
  });

  describe('Model Instantiation', () => {
    it('should create an instance with default config', () => {
      const defaultModel = createIN1Model();
      expect(defaultModel).toBeInstanceOf(IN1Model);
    });

    it('should override default config with provided values', () => {
      const customModel = createIN1Model({
        id: 'custom-id',
        name: 'Custom Model',
        version: '2.0.0',
      });
      expect(customModel).toBeInstanceOf(IN1Model);
    });
  });

  describe('analyze()', () => {
    it('should analyze a simple problem', async () => {
      const result = await model.analyze({
        problem: 'How to be happy?',
      });

      // Test basic response structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('problem', 'How to be happy?');
      expect(result).toHaveProperty('solution');
      expect(result).toHaveProperty('inverseProblem');
      expect(Array.isArray(result.failureModes)).toBe(true);
      expect(Array.isArray(result.avoidanceStrategies)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
      expect(typeof result.confidence).toBe('number');
      
      // Test metadata
      expect(result.metadata).toHaveProperty('modelVersion');
      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata).toHaveProperty('executionTimeMs');
      expect(result.metadata.executionTimeMs).toBeGreaterThan(0);
    });

    it('should handle complex problems with context', async () => {
      const context = {
        industry: 'software',
        teamSize: 5,
        deadline: '2023-12-31',
      };

      const result = await model.analyze({
        problem: 'How to deliver a successful software project?',
        context,
        options: {
          maxDepth: 3,
          includeExamples: true,
        },
      });

      expect(result.problem).toBe('How to deliver a successful software project?');
      expect(result.failureModes.length).toBeGreaterThan(0);
      expect(result.avoidanceStrategies.length).toBeGreaterThan(0);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should emit analysisComplete event on success', async () => {
      const onComplete = vi.fn();
      eventEmitter.on('analysisComplete', onComplete);

      await model.analyze({
        problem: 'Test problem',
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      const [eventData] = onComplete.mock.calls[0];
      expect(eventData).toHaveProperty('requestId');
      expect(eventData).toHaveProperty('result');
      expect(eventData).toHaveProperty('timestamp');
    });

    it('should handle errors during analysis', async () => {
      // Create a new model with the event emitter
      const model = new IN1Model({
        eventEmitter,
        telemetryEnabled: true,
      });
      
      // Create a mock error
      const mockError = new Error('Test error');
      
      // Spy on the imported function and mock its implementation
      const invertQuestionSpy = vi.spyOn({ invertQuestion }, 'invertQuestion')
        .mockImplementation(() => {
          throw mockError;
        });

      const onError = vi.fn();
      eventEmitter.on('analysisError', onError);

      // We expect this to throw
      await expect(model.analyze({ problem: 'Will fail' })).rejects.toThrow('Test error');

      // Restore the original implementation
      invertQuestionSpy.mockRestore();
      
      // Verify the error event was emitted
      expect(onError).toHaveBeenCalledTimes(1);
      
      // Verify the event data structure
      const [eventData] = onError.mock.calls[0];
      expect(eventData).toHaveProperty('error', 'Test error');
      expect(eventData).toHaveProperty('requestId');
      expect(eventData).toHaveProperty('timestamp');
      expect(typeof eventData.requestId).toBe('string');
      expect(typeof eventData.timestamp).toBe('string');
    });
  });

  describe('Helper Functions', () => {

    describe('invertQuestion()', () => {
      it('should invert "How to" questions', () => {
        expect(invertQuestion('How to be happy?'))
          .toBe('How to fail at be happy?');
      });

      it('should handle questions without question marks', () => {
        expect(invertQuestion('How to learn TypeScript'))
          .toBe('How to fail at learn TypeScript');
      });

      it('should handle statements', () => {
        expect(invertQuestion('Build a successful startup'))
          .toBe('What would cause complete failure at: Build a successful startup');
      });
    });

    describe('generateFailureModes()', () => {
      it('should generate failure modes', () => {
        const failureModes = generateFailureModes('How to fail at being happy?');
        expect(Array.isArray(failureModes)).toBe(true);
        expect(failureModes.length).toBeGreaterThan(0);
        failureModes.forEach(mode => {
          expect(typeof mode).toBe('string');
          expect(mode.length).toBeGreaterThan(0);
        });
      });

      it('should include context-specific failures', () => {
        const context = {
          industry: 'healthcare',
          teamSize: 15
        };
        
        const failureModes = generateFailureModes('How to fail at healthcare?', context);
        
        // Check that context-specific failures are included
        const failureModesLower = failureModes.map(mode => mode.toLowerCase());
        
        // Check for industry-specific failures
        const industryTerms = ['healthcare', 'regulation', 'compliance'];
        const hasIndustryFailure = industryTerms.some(term => 
          failureModesLower.some(mode => mode.includes(term))
        );
        
        // Check for team-specific failures
        const teamTerms = ['team', 'coordination', 'communication', 'large team'];
        const hasTeamFailure = teamTerms.some(term => 
          failureModesLower.some(mode => mode.includes(term))
        );
        
        // Log the actual failure modes for debugging
        console.log('Generated failure modes:', failureModes);
        
        // Expect either industry or team failures to be present
        expect(hasIndustryFailure || hasTeamFailure).toBe(true);
      });
    });

    describe('generateAvoidanceStrategies()', () => {
      it('should convert failure modes to avoidance strategies', () => {
        const failureModes = [
          'Poor communication',
          'Lack of planning',
          'Ignoring feedback'
        ];
        
        const strategies = generateAvoidanceStrategies(failureModes);
        
        expect(strategies).toHaveLength(failureModes.length);
        // Check that each strategy is a string
        strategies.forEach(strategy => {
          expect(typeof strategy).toBe('string');
          expect(strategy.length).toBeGreaterThan(0);
        });
      });
    });

    describe('generateInsights()', () => {
      it('should generate insights from failure modes', () => {
        const failureModes = ['Risk 1', 'Risk 2', 'Risk 3'];
        const insights = generateInsights(failureModes);
        
        expect(Array.isArray(insights)).toBe(true);
        expect(insights.length).toBeGreaterThan(0);
        insights.forEach(insight => {
          expect(typeof insight).toBe('string');
          expect(insight.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty problem string', async () => {
      const result = await model.analyze({
        problem: '',
      });
      
      expect(result).toHaveProperty('problem', '');
      expect(result.failureModes.length).toBeGreaterThan(0);
    });

    it('should handle very long problem statements', async () => {
      const longProblem = 'How to ' + 'very '.repeat(100) + 'long problem?';
      const result = await model.analyze({
        problem: longProblem,
      });
      
      expect(result.problem).toBe(longProblem);
      expect(result.failureModes.length).toBeGreaterThan(0);
    });

    it('should handle special characters in problem statement', async () => {
      const specialProblem = 'How to handle $peci@l ch@r@cters & symbols? !@#$%^&*()';
      const result = await model.analyze({
        problem: specialProblem,
      });
      
      expect(result.problem).toBe(specialProblem);
      expect(result.failureModes.length).toBeGreaterThan(0);
    });
  });
});