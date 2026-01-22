import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createIN08Model } from '../index';
import { EventEmitter } from 'events';

describe('IN08', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createIN08Model({
      eventEmitter,
      telemetryEnabled: true
    });
  });
  
  it('should create a model with default config', () => {
    expect(model).toBeDefined();
    expect(model.id).toBe('IN08');
    expect(model.name).toBe('IN08');
    expect(model.version).toBe('1.0.0');
    expect(typeof model.analyze).toBe('function');
  });
  
  it('should analyze input', async () => {
    const input = { input: 'Test input' };
    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(mockEventEmit).toHaveBeenCalledWith('analysisComplete', expect.anything());
  });
  
  it('should include telemetry when enabled', async () => {
    const input = { 
      input: 'Test input',
      context: { key: 'value' }
    };
    
    const result = await model.analyze(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry.inputLength).toBe(input.input.length);
    expect(result.metadata.telemetry.contextKeys).toEqual(['key']);
  });
  
  it('should handle errors', async () => {
    // Test error handling
    await expect(model.analyze({})).rejects.toThrow();
  });
  
  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    testEmitter.on('analysisError', errorSpy);
    
    const failingModel = createIN08Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.analyze({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('Input must contain an "input" property');
  });
});