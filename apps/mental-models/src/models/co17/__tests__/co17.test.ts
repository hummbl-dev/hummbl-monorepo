import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCO17Model } from '../index';
import { EventEmitter } from 'events';

describe('CO17', () => {
  let model;
  let mockEventEmit;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = createCO17Model({
      eventEmitter,
      telemetryEnabled: true
    });
  });
  
  it('should create a model with default config', () => {
    expect(model).toBeDefined();
    expect(model.id).toBe('CO17');
    expect(model.name).toBe('CO17');
    expect(model.version).toBe('1.0.0');
    expect(typeof model.analyze).toBe('function');
  });
  
  it('should analyze input with elements', async () => {
    const input = { 
      elements: [
        { id: 'e1', type: 'component', properties: { name: 'Component 1' } },
        { id: 'e2', type: 'component', properties: { name: 'Component 2' } }
      ],
      relationships: [
        { type: 'connectsTo', source: 'e1', target: 'e2' }
      ]
    };
    
    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.analysis.composition.elements).toHaveLength(2);
    expect(result.analysis.composition.relationships).toHaveLength(1);
    expect(result.analysis.composition.emergentProperties.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(mockEventEmit).toHaveBeenCalledWith('analysisComplete', expect.anything());
  });
  
  it('should include telemetry when enabled', async () => {
    const input = { 
      elements: [
        { id: 'e1', type: 'component', properties: { name: 'Component 1' } },
        { id: 'e2', type: 'component', properties: { name: 'Component 2' } }
      ],
      relationships: [
        { type: 'connectsTo', source: 'e1', target: 'e2' }
      ],
      context: { userId: 'test-user' }
    };
    
    const result = await model.analyze(input);
    
    expect(result.metadata.telemetry).toBeDefined();
    expect(result.metadata.telemetry.elementCount).toBe(2);
    expect(result.metadata.telemetry.relationshipCount).toBe(1);
    expect(result.metadata.telemetry.contextKeys).toContain('userId');
  });
  
  it('should handle errors for invalid input', async () => {
    // Test with missing elements array
    await expect(model.analyze({})).rejects.toThrow('must contain a non-empty "elements" array');
    
    // Test with empty elements array
    await expect(model.analyze({ elements: [] })).rejects.toThrow('must contain a non-empty "elements" array');
  });
  
  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    testEmitter.on('analysisError', errorSpy);
    
    const failingModel = createCO17Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.analyze({})).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
    expect(typeof eventData.error).toBe('string');
    expect(eventData.error).toContain('must contain a non-empty "elements" array');
  });
});