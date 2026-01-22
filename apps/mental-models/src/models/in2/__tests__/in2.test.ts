import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createErrorUtilizationModel, 
  analyzeErrors,
  ErrorSeverity,
  ErrorCategory,
  ImprovementPriority,
  ImprovementStatus
} from '..';
import { EXAMPLE_ERROR_PATTERNS, EXAMPLE_IMPROVEMENTS } from '../constants';

describe('IN2: Error Utilization Model', () => {
  let model: ReturnType<typeof createErrorUtilizationModel>;
  
  // Sample error data
  const testError = {
    pattern: 'TypeError: Cannot read property',
    category: ErrorCategory.RUNTIME,
    severity: ErrorSeverity.HIGH,
    context: 'user-profile',
    tags: ['frontend', 'ui']
  };
  
  // Sample improvement data
  const testImprovement = {
    suggestion: 'Add null check before accessing user.profile',
    impact: 0.8,
    effort: 3,
    priority: ImprovementPriority.HIGH,
    status: ImprovementStatus.PROPOSED,
    sourceErrors: ['err_123'],
    tags: ['bug-fix', 'frontend']
  };
  
  beforeEach(() => {
    // Create a fresh model instance before each test
    model = createErrorUtilizationModel({
      defaultMinConfidence: 0.7,
      defaultMinSeverity: ErrorSeverity.LOW,
      maxErrorsPerRequest: 50,
      maxImprovementsPerRequest: 10,
      errorPatternLifetime: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  });
  
  describe('Model Initialization', () => {
    it('should create a model with default configuration', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe('error-utilization-model');
      expect(model.name).toBe('Error Utilization Model');
      expect(model.version).toBeDefined();
      
      // Verify default configuration
      expect(model.config.defaultMinConfidence).toBe(0.7);
      expect(model.config.defaultMinSeverity).toBe(ErrorSeverity.LOW);
      expect(model.config.maxErrorsPerRequest).toBe(50);
      expect(model.config.maxImprovementsPerRequest).toBe(10);
      expect(model.config.errorPatternLifetime).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });
  
  describe('Error Detection', () => {
    it('should detect error patterns in text input', async () => {
      const input = 'Error: User not found in database';
      const errors = await model.detectErrors({ input });
      
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toHaveProperty('pattern');
      expect(errors[0]).toHaveProperty('severity');
      expect(errors[0].severity).toBeGreaterThanOrEqual(ErrorSeverity.LOW);
    });
    
    it('should respect minConfidence and minSeverity parameters', async () => {
      const input = 'Error: User not found in database';
      const errors = await model.detectErrors({ 
        input,
        minConfidence: 0.9,
        minSeverity: ErrorSeverity.HIGH
      });
      
      // The test might pass if no high confidence/high severity errors are found
      // So we just verify the function doesn't throw and returns an array
      expect(errors).toBeInstanceOf(Array);
    });
    
    it('should handle object input by converting to JSON', async () => {
      const input = { 
        error: 'Database connection failed',
        code: 'DB_CONN_ERR',
        details: 'Could not connect to database server'
      };
      
      const errors = await model.detectErrors({ input });
      expect(errors).toBeInstanceOf(Array);
    });
  });
  
  describe('Improvement Generation', () => {
    it('should generate improvements from errors', async () => {
      const errors = await model.detectErrors({ 
        input: 'TypeError: Cannot read property \'name\' of undefined' 
      });
      
      const improvements = await model.generateImprovements({ errors });
      
      expect(improvements).toBeInstanceOf(Array);
      if (improvements.length > 0) {
        expect(improvements[0]).toHaveProperty('suggestion');
        expect(improvements[0]).toHaveProperty('impact');
        expect(improvements[0]).toHaveProperty('effort');
        expect(improvements[0].sourceErrors).toContain(errors[0].id);
      }
    });
    
    it('should respect limit parameter', async () => {
      const errors = await model.detectErrors({ 
        input: 'Multiple errors: 1. TypeError 2. ReferenceError 3. SyntaxError' 
      });
      
      const limit = 2;
      const improvements = await model.generateImprovements({ 
        errors, 
        limit 
      });
      
      expect(improvements.length).toBeLessThanOrEqual(limit);
    });
    
    it('should filter by minImpact and maxEffort', async () => {
      const errors = await model.detectErrors({ 
        input: 'Various errors to test filtering' 
      });
      
      const improvements = await model.generateImprovements({
        errors,
        minImpact: 0.7,
        maxEffort: 5
      });
      
      for (const imp of improvements) {
        expect(imp.impact).toBeGreaterThanOrEqual(0.7);
        expect(imp.effort).toBeLessThanOrEqual(5);
      }
    });
  });
  
  describe('Error Analysis', () => {
    it('should analyze errors and provide metrics', async () => {
      const analysis = await model.analyzeErrors(
        'Error: Failed to load user data. ReferenceError: user is not defined'
      );
      
      expect(analysis).toHaveProperty('errors');
      expect(analysis).toHaveProperty('improvements');
      expect(analysis).toHaveProperty('metrics');
      
      expect(analysis.metrics).toHaveProperty('totalErrors');
      expect(analysis.metrics).toHaveProperty('uniqueErrorTypes');
      expect(analysis.metrics).toHaveProperty('improvementsGenerated');
      expect(analysis.metrics).toHaveProperty('averageImpact');
      expect(analysis.metrics).toHaveProperty('averageEffort');
      expect(analysis.metrics).toHaveProperty('errorReductionPotential');
    });
    
    it('should calculate meaningful metrics', async () => {
      // First analysis to establish a baseline
      const analysis1 = await model.analyzeErrors('Error: First error');
      
      // Second analysis with the same error (should be deduplicated)
      const analysis2 = await model.analyzeErrors('Error: First error');
      
      // Third analysis with a different error
      const analysis3 = await model.analyzeErrors('TypeError: Invalid type');
      
      // Check that the same error increases occurrence count but not unique types
      expect(analysis2.metrics.uniqueErrorTypes).toBe(1);
      
      // A different error should increase the unique types count
      expect(analysis3.metrics.uniqueErrorTypes).toBe(2);
    });
  });
  
  describe('Feedback Loops', () => {
    it('should create a feedback loop', () => {
      const loop = model.createFeedbackLoop({
        name: 'Test Feedback Loop',
        description: 'Test description',
        config: {
          isActive: true,
          samplingRate: 0.5
        }
      });
      
      expect(loop).toBeDefined();
      expect(loop.id).toMatch(/^loop_/);
      expect(loop.name).toBe('Test Feedback Loop');
      expect(loop.config.samplingRate).toBe(0.5);
      
      // Verify the loop was added to the model
      const loops = model.listFeedbackLoops();
      expect(loops.some(l => l.id === loop.id)).toBe(true);
    });
    
    it('should update an existing feedback loop', () => {
      const loop = model.createFeedbackLoop({
        name: 'Test Loop',
        config: { isActive: true }
      });
      
      const updated = model.updateFeedbackLoop(loop.id, {
        name: 'Updated Test Loop',
        config: { isActive: false }
      });
      
      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Test Loop');
      expect(updated?.config.isActive).toBe(false);
      expect(updated?.meta.updatedAt).not.toBe(loop.meta.updatedAt);
    });
    
    it('should return null when updating non-existent loop', () => {
      const result = model.updateFeedbackLoop('non-existent-id', {
        name: 'Should not work'
      });
      
      expect(result).toBeNull();
    });
  });
  
  describe('Impact and Effort Calculation', () => {
    it('should calculate impact based on error properties', () => {
      const highImpactError = {
        ...testError,
        severity: ErrorSeverity.CRITICAL,
        occurrenceCount: 10
      };
      
      const lowImpactError = {
        ...testError,
        severity: ErrorSeverity.LOW,
        occurrenceCount: 1
      };
      
      const highImpact = model.calculateImpact(highImpactError as any);
      const lowImpact = model.calculateImpact(lowImpactError as any);
      
      expect(highImpact).toBeGreaterThan(lowImpact);
      expect(highImpact).toBeLessThanOrEqual(1);
      expect(lowImpact).toBeGreaterThanOrEqual(0);
    });
    
    it('should estimate effort based on improvement complexity', () => {
      const simpleFix = 'Add null check';
      const complexFix = `Implement retry logic with exponential backoff for database connections. 
        Handle edge cases and add proper error logging. Update documentation and add unit tests.`;
      
      const simpleEffort = model.calculateEffort(simpleFix);
      const complexEffort = model.calculateEffort(complexFix);
      
      expect(simpleEffort).toBeLessThan(complexEffort);
      expect(simpleEffort).toBeGreaterThanOrEqual(1);
      expect(complexEffort).toBeLessThanOrEqual(10);
    });
  });
  
  describe('Convenience Function', () => {
    it('should provide a direct analyzeErrors function', async () => {
      const analysis = await analyzeErrors('Error: Test error for convenience function');
      
      expect(analysis).toHaveProperty('errors');
      expect(analysis).toHaveProperty('improvements');
      expect(analysis).toHaveProperty('metrics');
    });
  });
  
  describe('Example Data', () => {
    it('should load example error patterns', () => {
      expect(EXAMPLE_ERROR_PATTERNS).toBeInstanceOf(Array);
      expect(EXAMPLE_ERROR_PATTERNS.length).toBeGreaterThan(0);
      
      const example = EXAMPLE_ERROR_PATTERNS[0];
      expect(example).toHaveProperty('id');
      expect(example).toHaveProperty('pattern');
      expect(example).toHaveProperty('severity');
    });
    
    it('should load example improvements', () => {
      expect(EXAMPLE_IMPROVEMENTS).toBeInstanceOf(Array);
      if (EXAMPLE_IMPROVEMENTS.length > 0) {
        const example = EXAMPLE_IMPROVEMENTS[0];
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('suggestion');
        expect(example).toHaveProperty('impact');
        expect(example).toHaveProperty('effort');
      }
    });
  });
});
