import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  CompositionInput, 
  CompositionOutput, 
  CompositionConfig, 
  DEFAULT_CONFIG as DEFAULT_COMPOSITION_CONFIG 
} from './types';
import { version } from './constants';

/**
 * CO14: Composition Model
 * 
 * This model implements the Composition mental model by combining elements
 * to create new wholes with emergent properties.
 */
export const createCO14Model = (config: Partial<CompositionConfig> = {}) => {
  // Merge default config with user config
  const {
    name = 'CO14',
    version: modelVersion = version,
    eventEmitter = new EventEmitter(),
    telemetryEnabled = false,
    logger = console,
  } = { ...DEFAULT_COMPOSITION_CONFIG, ...config };

  /**
   * Analyze input using the Composition model
   */
  const analyze = async (input: CompositionInput): Promise<CompositionOutput> => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      // Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
      }
      
      if (!input.elements || !Array.isArray(input.elements) || input.elements.length === 0) {
        throw new Error('Input must contain a non-empty "elements" array');
      }
      
      // Core Composition logic
      const composition = {
        elements: input.elements,
        relationships: input.relationships || [],
        emergentProperties: []
      };

      // Add some basic emergent properties based on the input
      if (input.elements.length > 1) {
        composition.emergentProperties.push(
          'Combined functionality of ' + input.elements.length + ' elements',
          'Emergent behavior from element interactions',
          'Potential for new use cases'
        );
      }

      const result: CompositionOutput = {
        id: requestId,
        analysis: {
          composition,
          insights: [
            'Identified ' + input.elements.length + ' elements for composition',
            'Analyzed relationships between elements',
            'Identified potential emergent properties'
          ]
        },
        confidence: 0.8,
        metadata: {
          modelVersion,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: telemetryEnabled ? {
            elementCount: input.elements.length,
            relationshipCount: input.relationships ? input.relationships.length : 0,
            contextKeys: input.context ? Object.keys(input.context) : []
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
    id: 'CO14',
    name,
    version: modelVersion,
    analyze
  };
};

export default createCO14Model;