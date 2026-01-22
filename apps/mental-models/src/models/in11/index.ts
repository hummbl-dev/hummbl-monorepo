import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  InversionInput, 
  InversionOutput, 
  InversionConfig, 
  DEFAULT_CONFIG as DEFAULT_INVERSION_CONFIG 
} from './types';
import { version } from './constants';

/**
 * IN11: Inversion Model
 * 
 * This model implements the Inversion mental model by challenging assumptions
 * and considering the opposite of conventional thinking.
 */
export const createIN11Model = (config: Partial<InversionConfig> = {}) => {
  // Merge default config with user config
  const {
    name = 'IN11',
    version: modelVersion = version,
    eventEmitter = new EventEmitter(),
    telemetryEnabled = false,
    logger = console,
  } = { ...DEFAULT_INVERSION_CONFIG, ...config };

  /**
   * Analyze input using the Inversion model
   */
  const analyze = async (input: InversionInput): Promise<InversionOutput> => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      // Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
      }
      
      if (!input.input) {
        throw new Error('Input must contain an "input" property');
      }
      
      // Core Inversion logic
      const invertedInput = {
        ...input,
        input: 'Inverted: ' + input.input,
        originalInput: input.input
      };

      const result: InversionOutput = {
        id: requestId,
        analysis: {
          inverted: invertedInput,
          insights: [
            'Considered the opposite perspective',
            'Challenged initial assumptions',
            'Identified potential blind spots'
          ]
        },
        confidence: 0.8,
        metadata: {
          modelVersion,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: telemetryEnabled ? {
            inputLength: input.input?.length || 0,
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
    id: 'IN11',
    name,
    version: modelVersion,
    analyze
  };
};

export default createIN11Model;