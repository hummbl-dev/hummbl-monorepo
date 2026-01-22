import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSynthesisModel } from '../index';
import { EventEmitter } from 'events';

describe('SY1: Base Synthesis Model', () => {
  let model: ReturnType<typeof createSynthesisModel>;
  let mockEventEmit: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createSynthesisModel({
      eventEmitter,
      telemetryEnabled: true,
    });
  });

  it('should create a synthesis model with default config', () => {
    const defaultModel = createSynthesisModel();
    
    expect(defaultModel).toBeDefined();
    expect(defaultModel.id).toBe('sy1');
    expect(defaultModel.name).toBe('Base Synthesis Model');
    expect(defaultModel.version).toBe('1.0.0');
  });

  it('should synthesize multiple models', async () => {
    const input = {
      models: [
        { id: 'model1', output: 'result1' },
        { id: 'model2', output: 'result2' },
      ],
      context: { test: true },
    };

    const result = await model.synthesize(input);
    
    // Verify the result structure
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.synthesizedResult).toBeDefined();
    expect(result.insights).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    
    // Verify the synthesized result
    expect(result.synthesizedResult.combined).toHaveLength(2);
    expect(result.synthesizedResult.summary).toContain('2 models');
    
    // Verify events were emitted
    expect(mockEventEmit).toHaveBeenCalledWith('synthesisComplete', expect.any(Object));
  });

  it('should handle empty model list', async () => {
    await expect(model.synthesize({ models: [] }))
      .rejects
      .toThrow('At least one model output is required for synthesis');
  });

  it('should include telemetry when enabled', async () => {
    const input = {
      models: [{ id: 'model1' }, { id: 'model2' }],
      context: { test: true },
    };

    const result = await model.synthesize(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry?.modelCount).toBe(2);
    expect(result.metadata.telemetry?.contextKeys).toContain('test');
  });

  it('should emit error events on failure', async () => {
    // Create a new event emitter for this test
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    
    // Set up the spy before creating the model
    testEmitter.on('synthesisError', errorSpy);
    
    // Create the model with our test emitter
    const failingModel = createSynthesisModel({
      eventEmitter: testEmitter,
    });
    
    // This should trigger the error event
    await expect(failingModel.synthesize({ models: [] })).rejects.toThrow();
    
    // Verify error event was emitted with expected structure
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('At least one model output is required');
  });
});
