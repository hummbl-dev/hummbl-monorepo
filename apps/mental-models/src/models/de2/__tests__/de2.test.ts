import { 
  createCognitiveTracingModel,
  createCognitiveStep,
  createDecisionPoint,
  createCognitiveTrace,
  DE2_CONSTANTS
} from '..';
import { 
  CognitiveStep, 
  DecisionPoint, 
  CognitiveTrace,
  TraceCognitiveStepsParams,
  CognitiveTraceResult
} from '../types';

describe('DE2: Cognitive Tracing Model', () => {
  let model: ReturnType<typeof createCognitiveTracingModel>;
  
  beforeAll(() => {
    model = createCognitiveTracingModel();
  });
  
  describe('Model Initialization', () => {
    it('should create a model with the correct properties', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe(DE2_CONSTANTS.MODEL_CODE.toLowerCase());
      expect(model.name).toBe(DE2_CONSTANTS.MODEL_NAME);
      expect(model.version).toBe(DE2_CONSTANTS.VERSION);
      expect(typeof model.traceSteps).toBe('function');
      expect(typeof model.continueTrace).toBe('function');
      expect(typeof model.analyzeDecisionPoint).toBe('function');
      expect(typeof model.explainTrace).toBe('function');
    });
    
    it('should have default configuration', () => {
      expect(model.config).toBeDefined();
      expect(model.config.defaultMaxDepth).toBe(DE2_CONSTANTS.DEFAULTS.DEFAULT_MAX_DEPTH);
      expect(model.config.defaultMaxBreadth).toBe(DE2_CONSTANTS.DEFAULTS.DEFAULT_MAX_BREADTH);
      expect(model.config.minConfidenceThreshold).toBe(DE2_CONSTANTS.DEFAULTS.MIN_CONFIDENCE_THRESHOLD);
    });
  });
  
  describe('createCognitiveStep', () => {
    it('should create a cognitive step with default values', () => {
      const step = createCognitiveStep('Test content', 'observation');
      
      expect(step).toBeDefined();
      expect(step.id).toMatch(/^step-\d+-[a-z0-9]+$/);
      expect(step.content).toBe('Test content');
      expect(step.type).toBe('observation');
      expect(step.confidence).toBe(DE2_CONSTANTS.CONFIDENCE_LEVELS.MEDIUM);
      expect(step.parentIds).toEqual([]);
      expect(step.childIds).toEqual([]);
      expect(step.meta).toBeDefined();
      expect(step.meta.timestamp).toBeInstanceOf(Date);
      expect(step.meta.tags).toEqual([]);
    });
    
    it('should create a cognitive step with custom values', () => {
      const parentIds = ['parent1', 'parent2'];
      const meta = {
        tags: ['test'],
        durationMs: 100,
        custom: 'value'
      };
      
      const step = createCognitiveStep('Test content', 'inference', parentIds, meta);
      
      expect(step.parentIds).toEqual(parentIds);
      expect(step.meta.tags).toEqual(meta.tags);
      expect(step.meta.durationMs).toBe(meta.durationMs);
      // @ts-expect-error - custom property should exist
      expect(step.meta.custom).toBe('value');
    });
  });
  
  describe('createDecisionPoint', () => {
    it('should create a decision point with default values', () => {
      const options = [
        { id: 'opt1', description: 'Option 1' },
        { id: 'opt2', description: 'Option 2' }
      ];
      const decisionPoint = createDecisionPoint('Test decision', options, 'step-123');
      
      expect(decisionPoint).toBeDefined();
      expect(decisionPoint.id).toMatch(/^dp-\d+-[a-z0-9]+$/);
      expect(decisionPoint.decision).toBe('Test decision');
      expect(decisionPoint.options).toHaveLength(2);
      expect(decisionPoint.options[0].id).toBe('opt1');
      expect(decisionPoint.options[0].description).toBe('Option 1');
      expect(decisionPoint.options[0].selected).toBe(false);
      expect(decisionPoint.stepId).toBe('step-123');
      expect(decisionPoint.selectedOptionId).toBeUndefined();
    });
    
    it('should create a decision point with a selected option', () => {
      const options = [
        { id: 'opt1', description: 'Option 1' },
        { id: 'opt2', description: 'Option 2' }
      ];
      const decisionPoint = createDecisionPoint('Test decision', options, 'step-123', 'opt2');
      
      expect(decisionPoint.options[0].selected).toBe(false);
      expect(decisionPoint.options[1].selected).toBe(true);
      expect(decisionPoint.selectedOptionId).toBe('opt2');
    });
  });
  
  describe('createCognitiveTrace', () => {
    it('should create a cognitive trace with default values', () => {
      const { trace } = createCognitiveTrace('Test input');
      
      expect(trace).toBeDefined();
      expect(trace.id).toMatch(/^trace-\d+$/);
      expect(trace.input).toBe('Test input');
      expect(trace.steps).toEqual([]);
      expect(trace.decisionPoints).toEqual([]);
      expect(trace.relationships).toEqual([]);
      expect(trace.meta.createdAt).toBeInstanceOf(Date);
      expect(trace.meta.updatedAt).toBeInstanceOf(Date);
      expect(trace.meta.modelVersion).toBe(DE2_CONSTANTS.VERSION);
      expect(trace.meta.tags).toEqual([]);
    });
  });
  
  describe('traceSteps', () => {
    it('should create a basic trace with at least one step', async () => {
      const result = await model.traceSteps({
        input: 'Test input',
        maxDepth: 2,
        maxBreadth: 2
      });
      
      expect(result).toBeDefined();
      expect(result.trace).toBeDefined();
      expect(result.trace.input).toBe('Test input');
      expect(result.trace.steps.length).toBeGreaterThan(0);
      
      // Check metrics
      expect(result.metrics.totalSteps).toBe(result.trace.steps.length);
      expect(result.metrics.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(result.metrics.averageConfidence).toBeLessThanOrEqual(1);
      expect(result.metrics.maxDepth).toBeGreaterThanOrEqual(1);
      expect(result.metrics.maxBreadth).toBeGreaterThanOrEqual(1);
      expect(result.metrics.processingTimeMs).toBeGreaterThan(0);
      
      // Check that the first step is the initial step
      const initialStep = result.trace.steps[0];
      expect(initialStep.content).toContain('Starting trace for input: Test input');
      expect(initialStep.type).toBe('observation');
      expect(initialStep.parentIds).toEqual([]);
      expect(initialStep.childIds.length).toBeGreaterThan(0);
    });
    
    it('should respect maxDepth parameter', async () => {
      const maxDepth = 3;
      const result = await model.traceSteps({
        input: 'Test max depth',
        maxDepth,
        maxBreadth: 2
      });
      
      // Calculate actual max depth
      const stepMap = new Map<string, number>();
      let maxCalculatedDepth = 0;
      
      // BFS to calculate depth of each step
      const queue: { id: string; depth: number }[] = [
        ...result.trace.steps
          .filter(step => step.parentIds.length === 0)
          .map(step => ({ id: step.id, depth: 1 }))
      ];
      
      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        stepMap.set(id, depth);
        maxCalculatedDepth = Math.max(maxCalculatedDepth, depth);
        
        const step = result.trace.steps.find(s => s.id === id);
        if (step) {
          step.childIds.forEach(childId => {
            if (!stepMap.has(childId)) {
              queue.push({ id: childId, depth: depth + 1 });
            }
          });
        }
      }
      
      expect(maxCalculatedDepth).toBeLessThanOrEqual(maxDepth);
    }, 10000); // Increased timeout for this test
    
    it('should respect minConfidence parameter', async () => {
      const minConfidence = 0.9; // High confidence threshold
      const result = await model.traceSteps({
        input: 'Test min confidence',
        maxDepth: 3,
        maxBreadth: 2,
        minConfidence
      });
      
      // Check that all steps have confidence >= minConfidence
      result.trace.steps.forEach(step => {
        expect(step.confidence).toBeGreaterThanOrEqual(minConfidence);
      });
      
      // Check that relationships also respect the confidence
      result.trace.relationships.forEach(rel => {
        expect(rel.strength).toBeGreaterThanOrEqual(minConfidence);
      });
    }, 10000); // Increased timeout for this test
  });
  
  describe('explainTrace', () => {
    it('should generate a human-readable explanation', async () => {
      // Create a simple trace
      const { trace } = createCognitiveTrace('Test explanation');
      
      // Add some steps
      const step1 = createCognitiveStep('First step', 'observation');
      const step2 = createCognitiveStep('Second step', 'inference', [step1.id]);
      const step3 = createCognitiveStep('Third step', 'decision', [step2.id]);
      
      trace.steps = [step1, step2, step3];
      
      // Add a relationship
      trace.relationships.push({
        sourceId: step1.id,
        targetId: step2.id,
        type: 'leads-to',
        strength: 0.8
      });
      
      // Add a decision point
      const decisionPoint = createDecisionPoint(
        'Test decision',
        [
          { id: 'opt1', description: 'Option 1' },
          { id: 'opt2', description: 'Option 2' }
        ],
        step3.id,
        'opt1'
      );
      trace.decisionPoints.push(decisionPoint);
      
      // Generate explanation
      const explanation = model.explainTrace(trace);
      
      // Check that the explanation contains expected content
      expect(explanation).toContain('# Cognitive Trace Analysis');
      expect(explanation).toContain('## Steps');
      expect(explanation).toContain('First step');
      expect(explanation).toContain('Second step');
      expect(explanation).toContain('Third step');
      expect(explanation).toContain('Key decisions:');
      expect(explanation).toContain('Test decision: Option 1');
      expect(explanation).toContain(`Total steps: 3`);
      expect(explanation).toContain(`Decision points: 1`);
      expect(explanation).toContain(`Trace ID: ${trace.id}`);
    });
  });
  
  describe('Helper Methods', () => {
    describe('calculateMaxDepth', () => {
      it('should calculate the maximum depth of a trace', () => {
        // Create a simple trace
        const { trace } = createCognitiveTrace('Test depth calculation');
        
        // Create steps with a depth of 3
        const step1 = createCognitiveStep('Step 1', 'observation');
        const step2 = createCognitiveStep('Step 2', 'inference', [step1.id]);
        const step3 = createCognitiveStep('Step 3', 'evaluation', [step2.id]);
        
        // Add a parallel path with depth 2
        const step4 = createCognitiveStep('Step 4', 'inference', [step1.id]);
        
        trace.steps = [step1, step2, step3, step4];
        
        // The max depth should be 3 (step1 -> step2 -> step3)
        // @ts-expect-error - Accessing private method for testing
        const maxDepth = model.calculateMaxDepth(trace);
        expect(maxDepth).toBe(3);
      });
      
      it('should return 0 for an empty trace', () => {
        const { trace } = createCognitiveTrace('Empty trace');
        // @ts-expect-error - Accessing private method for testing
        const maxDepth = model.calculateMaxDepth(trace);
        expect(maxDepth).toBe(0);
      });
    });
    
    describe('calculateMaxBreadth', () => {
      it('should calculate the maximum breadth of a trace', () => {
        // Create a simple trace
        const { trace } = createCognitiveTrace('Test breadth calculation');
        
        // Create steps where step1 has 3 children (breadth = 3)
        const step1 = createCognitiveStep('Step 1', 'observation');
        const step2 = createCognitiveStep('Step 2', 'inference', [step1.id]);
        const step3 = createCognitiveStep('Step 3', 'inference', [step1.id]);
        const step4 = createCognitiveStep('Step 4', 'inference', [step1.id]);
        
        // Add a step with 1 child
        const step5 = createCognitiveStep('Step 5', 'inference', [step2.id]);
        
        trace.steps = [step1, step2, step3, step4, step5];
        
        // The max breadth should be 3 (step1 has 3 children)
        // @ts-expect-error - Accessing private method for testing
        const maxBreadth = model.calculateMaxBreadth(trace);
        expect(maxBreadth).toBe(3);
      });
      
      it('should return 0 for an empty trace', () => {
        const { trace } = createCognitiveTrace('Empty trace');
        // @ts-expect-error - Accessing private method for testing
        const maxBreadth = model.calculateMaxBreadth(trace);
        expect(maxBreadth).toBe(0);
      });
    });
  });
});
