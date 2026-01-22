import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDE13Model } from '../index';
import { EventEmitter } from 'events';

describe('DE13', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createDE13Model({
      eventEmitter,
      telemetryEnabled: true
    });
  });
  
  it('should create a model with default config', () => {
    expect(model).toBeDefined();
    expect(model.id).toBe('DE13');
    expect(model.name).toBe('DE13');
    expect(model.version).toBe('1.0.0');
    expect(typeof model.analyze).toBe('function');
  });
  
  it('should deconstruct an object into components', async () => {
    const input = { 
      system: {
        name: 'Test System',
        version: '1.0.0',
        config: {
          enabled: true,
          maxItems: 10
        }
      }
    };
    
    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.analysis.components.length).toBeGreaterThan(0);
    expect(result.analysis.components.some(c => c.id === 'name')).toBe(true);
    expect(result.analysis.components.some(c => c.id === 'version')).toBe(true);
    expect(result.analysis.components.some(c => c.id === 'config')).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(mockEventEmit).toHaveBeenCalledWith('analysisComplete', expect.anything());
  });
  
  it('should deconstruct an array into components', async () => {
    const input = { 
      system: ['item1', 'item2', 'item3']
    };
    
    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.analysis.components.length).toBe(3);
    expect(result.analysis.components[0].id).toBe('item_0');
    expect(result.analysis.components[1].id).toBe('item_1');
    expect(result.analysis.components[2].id).toBe('item_2');
    expect(result.metadata.telemetry.inputType).toBe('array');
    expect(result.metadata.telemetry.inputSize).toBe(3);
  });
  
  it('should include telemetry when enabled', async () => {
    const input = { 
      system: {
        name: 'Test',
        value: 123
      },
      context: { userId: 'test-user' }
    };
    
    const result = await model.analyze(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry.componentCount).toBe(2);
    expect(result.metadata.telemetry.inputType).toBe('object');
  });
  
  it('should handle errors for invalid input', async () => {
    // Test with missing system
    await expect(model.analyze({})).rejects.toThrow('must contain a "system" property');
    
    // Test with null/undefined system
    await expect(model.analyze({ system: null })).rejects.toThrow('must contain a "system" property');
  });
  
  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    testEmitter.on('analysisError', errorSpy);
    
    const failingModel = createDE13Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.analyze({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('must contain a "system" property');
  });
});