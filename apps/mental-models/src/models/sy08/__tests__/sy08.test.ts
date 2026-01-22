import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSY08Model } from '../index';
import { EventEmitter } from 'events';

describe('SY08', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createSY08Model({
      eventEmitter,
      telemetryEnabled: true,
      options: {
        maxDepth: 2,
        includeExamples: true,
        includeReasoning: true,
        confidenceThreshold: 0.5
      }
    });
  });
  
  it('should create a model with default config', () => {
    expect(model).toBeDefined();
    expect(model.id).toBe('sy08');
    expect(model.name).toBe('SY08 Synthesis Model');
    expect(model.version).toBe('1.0.0');
    expect(typeof model.synthesize).toBe('function');
  });
  
  it('should synthesize multiple models', async () => {
    const input = {
      models: [
        { type: 'perspective', id: 'p1', analysis: 'Analysis 1', confidence: 0.8 },
        { type: 'inversion', id: 'i1', analysis: 'Analysis 2', confidence: 0.9 }
      ],
      context: { userId: 'test-user' },
      options: {
        depth: 2,
        includeExamples: true
      }
    };
    
    const result = await model.synthesize(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.synthesizedResult.models).toHaveLength(2);
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(mockEventEmit).toHaveBeenCalledWith('synthesisComplete', expect.anything());
  });
  
  it('should handle confidence threshold', async () => {
    // Create a model with a very high confidence threshold
    const highThresholdModel = createSY08Model({
      options: {
        confidenceThreshold: 0.99 // Very high threshold that will trigger low confidence
      }
    });
    
    // Input with models that have confidence below the threshold
    const input = {
      models: [
        { type: 'perspective', id: 'p1', analysis: 'Analysis 1', confidence: 0.5 },
        { type: 'inversion', id: 'i1', analysis: 'Analysis 2', confidence: 0.6 }
      ],
      // Add context to ensure the test is more realistic
      context: { test: 'confidence-threshold-test' },
      // Explicitly enable telemetry for this test
      options: {
        includeExamples: true
      }
    };
    
    const result = await highThresholdModel.synthesize(input);
    
    // Verify the low confidence message is in the insights
    expect(result.insights.some(insight => 
      typeof insight === 'string' && insight.includes('Low confidence result')
    )).toBe(true);
    
    // Also verify the confidence is below the threshold
    expect(result.confidence).toBeLessThan(0.7);
  });
  
  it('should include telemetry when enabled', async () => {
    const input = {
      models: [
        { type: 'perspective', id: 'p1', analysis: 'Analysis 1' },
        { type: 'inversion', id: 'i1', analysis: 'Analysis 2' }
      ],
      context: { userId: 'test-user' }
    };
    
    const result = await model.synthesize(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry.modelCount).toBe(2);
    expect(result.metadata.telemetry.contextKeys).toContain('userId');
  });
  
  it('should handle errors for invalid input', async () => {
    // Test with missing models
    await expect(model.synthesize({})).rejects.toThrow('At least one model output is required');
    
    // Test with empty models array
    await expect(model.synthesize({ models: [] })).rejects.toThrow('At least one model output is required');
  });
  
  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    testEmitter.on('synthesisError', errorSpy);
    
    const failingModel = createSY08Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.synthesize({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('At least one model output is required');
  });
});