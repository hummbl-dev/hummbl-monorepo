import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createP16Model } from '../P16';
import { EventEmitter } from 'events';

describe('P16', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createP16Model({
      eventEmitter,
      telemetryEnabled: true,
    });
  });

  it('should create a model with default config', () => {
    const defaultModel = createP16Model();
    
    expect(defaultModel).toBeDefined();
    expect(defaultModel.id).toBe('p16');
    expect(defaultModel.name).toBe('P16 Model');
    expect(defaultModel.version).toBe('1.0.0');
  });

  it('should analyze input', async () => {
    const input = {
      input: 'test input',
      context: { test: true },
    };

    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(mockEventEmit).toHaveBeenCalledWith('analysisComplete', expect.any(Object));
  });

  it('should include telemetry when enabled', async () => {
    const input = { input: 'test' };
    const result = await model.analyze(input);
    
    expect(result.metadata.telemetry).toBeDefined();
  });

  it('should handle errors', async () => {
    // Test error handling
    await expect(model.analyze({})).rejects.toThrow();
  });

  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    
    testEmitter.on('analysisError', errorSpy);
    
    const failingModel = createP16Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.analyze({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
  });
});