import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRE06Model } from '../index';
import { EventEmitter } from 'events';

describe('RE06', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createRE06Model({
      eventEmitter,
      telemetryEnabled: true
    });
  });
  
  it('should create a model with default config', () => {
    expect(model).toBeDefined();
    expect(model.id).toBe('RE06');
    expect(model.name).toBe('RE06');
    expect(model.version).toBe('1.0.0');
    expect(typeof model.reconstruct).toBe('function');
  });
  
  it('should reconstruct a system from components', async () => {
    const input = {
      systemId: 'test-system',
      name: 'Test System',
      components: [
        { id: 'c1', type: 'service', properties: { name: 'Service A' } },
        { id: 'c2', type: 'database', properties: { name: 'Database A' } }
      ],
      relationships: [
        { id: 'r1', source: 'c1', target: 'c2', type: 'uses' }
      ]
    };
    
    const result = await model.reconstruct(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.system.id).toBe('test-system');
    expect(result.system.name).toBe('Test System');
    expect(result.system.components).toHaveLength(2);
    expect(result.system.relationships).toHaveLength(1);
    expect(result.metrics.componentCount).toBe(2);
    expect(result.metrics.relationshipCount).toBe(1);
    expect(mockEventEmit).toHaveBeenCalledWith('reconstructionComplete', expect.anything());
  });
  
  it('should generate relationships if none provided', async () => {
    const input = {
      components: [
        { id: 'c1', type: 'service', properties: { name: 'Service A' } },
        { id: 'c2', type: 'database', properties: { name: 'Database A' } },
        { id: 'c3', type: 'cache', properties: { name: 'Cache A' } }
      ],
      strategy: 'optimize'
    };
    
    const result = await model.reconstruct(input);
    
    expect(result.system.relationships.length).toBeGreaterThan(0);
    expect(result.system.relationships[0]).toHaveProperty('source');
    expect(result.system.relationships[0]).toHaveProperty('target');
  });
  
  it('should include telemetry when enabled', async () => {
    const input = {
      components: [
        { id: 'c1', type: 'service', properties: { name: 'Service A' } },
        { id: 'c2', type: 'database', properties: { name: 'Database A' } }
      ],
      context: { userId: 'test-user' }
    };
    
    const result = await model.reconstruct(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry.inputComponentCount).toBe(2);
    expect(result.metadata.telemetry.strategy).toBe('default');
  });
  
  it('should handle errors for invalid input', async () => {
    // Test with missing components
    await expect(model.reconstruct({})).rejects.toThrow('must contain a non-empty "components" array');
    
    // Test with empty components array
    await expect(model.reconstruct({ components: [] })).rejects.toThrow('must contain a non-empty "components" array');
  });
  
  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    testEmitter.on('reconstructionError', errorSpy);
    
    const failingModel = createRE06Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.reconstruct({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('must contain a non-empty "components" array');
  });
});