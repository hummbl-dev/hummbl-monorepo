import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  DeconstructionInput, 
  DeconstructionOutput, 
  DeconstructionConfig, 
  DEFAULT_CONFIG as DEFAULT_DECONSTRUCTION_CONFIG 
} from './types';
import { version } from './constants';

/**
 * DE11: Deconstruction Model
 * 
 * This model implements the Deconstruction mental model by breaking down
 * complex systems into their fundamental components and relationships.
 */
export const createDE11Model = (config: Partial<DeconstructionConfig> = {}) => {
  // Merge default config with user config
  const {
    name = 'DE11',
    version: modelVersion = version,
    eventEmitter = new EventEmitter(),
    telemetryEnabled = false,
    logger = console,
  } = { ...DEFAULT_DECONSTRUCTION_CONFIG, ...config };

  /**
   * Analyze input using the Deconstruction model
   */
  const analyze = async (input: DeconstructionInput): Promise<DeconstructionOutput> => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      // Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
      }
      
      if (!input.system) {
        throw new Error('Input must contain a "system" property to deconstruct');
      }
      
      // Core Deconstruction logic
      const components = [];
      const relationships = [];
      
      // Simple deconstruction based on input type
      if (typeof input.system === 'object' && !Array.isArray(input.system)) {
        // Deconstruct object into its properties
        components.push(...Object.keys(input.system).map(key => ({
          id: key,
          type: typeof input.system[key],
          properties: { value: input.system[key] }
        })));
        
        // Add relationships if there are multiple components
        if (components.length > 1) {
          for (let i = 0; i < components.length - 1; i++) {
            relationships.push({
              type: 'related',
              source: components[i].id,
              target: components[i + 1].id,
              properties: { type: 'sequential' }
            });
          }
        }
      } else if (Array.isArray(input.system)) {
        // Deconstruct array into items with indices
        components.push(...input.system.map((item, index) => ({
          id: 'item_' + index,
          type: 'array_item',
          properties: { 
            index,
            value: item,
            valueType: typeof item
          }
        })));
      } else {
        // Simple value deconstruction
        components.push({
          id: 'value',
          type: 'primitive',
          properties: {
            type: typeof input.system,
            value: input.system
          }
        });
      }

      const result: DeconstructionOutput = {
        id: requestId,
        analysis: {
          components,
          relationships,
          insights: [
            'Deconstructed system into ' + components.length + ' components',
            relationships.length > 0 ? 'Identified ' + relationships.length + ' relationships' : 'No relationships identified',
            'Applied basic deconstruction patterns'
          ].filter(Boolean) as string[]
        },
        confidence: 0.8,
        metadata: {
          modelVersion,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: telemetryEnabled ? {
            componentCount: components.length,
            relationshipCount: relationships.length,
            inputType: Array.isArray(input.system) ? 'array' : typeof input.system,
            inputSize: typeof input.system === 'string' ? input.system.length : 
                     Array.isArray(input.system) ? input.system.length :
                     typeof input.system === 'object' ? Object.keys(input.system).length : 1
          } : undefined,
        },
      };

      // Emit success event
      eventEmitter.emit('analysisComplete', {
        requestId,
        result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis';
      
      // Emit error event
      eventEmitter.emit('analysisError', {
        requestId,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  };

  return {
    id: 'DE11',
    name,
    version: modelVersion,
    analyze
  };
};

export default createDE11Model;