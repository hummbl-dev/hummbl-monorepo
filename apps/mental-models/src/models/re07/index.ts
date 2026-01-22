import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  ReconstructionInput, 
  ReconstructionOutput, 
  ReconstructionConfig, 
  DEFAULT_CONFIG as DEFAULT_RECONSTRUCTION_CONFIG,
  ReconstructionComponent,
  ReconstructionRelationship,
  ReconstructionEvent
} from './types';
import { version } from './constants';

/**
 * RE07: Reconstruction Model
 * 
 * This model implements the Reconstruction mental model by reassembling
 * components into a coherent system with improved structure and relationships.
 */
export const createRE07Model = (config: Partial<ReconstructionConfig> = {}) => {
  // Merge default config with user config
  const {
    name = 'RE07',
    version: modelVersion = version,
    eventEmitter = new EventEmitter(),
    telemetryEnabled = false,
    logger = console,
  } = { ...DEFAULT_RECONSTRUCTION_CONFIG, ...config };

  /**
   * Reconstruct a system from its components
   */
  const reconstruct = async (input: ReconstructionInput): Promise<ReconstructionOutput> => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      // Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
      }
      
      if (!input.components || !Array.isArray(input.components) || input.components.length === 0) {
        throw new Error('Input must contain a non-empty "components" array');
      }
      
      // Core Reconstruction logic
      const reconstructedSystem = {
        id: input.systemId || 'system_' + uuidv4(),
        name: input.name || 'Reconstructed System',
        components: [...input.components],
        relationships: input.relationships || [],
        metadata: {
          ...input.metadata,
          reconstructedAt: new Date().toISOString(),
          reconstructedBy: 'RE07'
        }
      };

      // Apply any transformations or improvements
      if (input.strategy === 'optimize') {
        // Apply optimization logic
        reconstructedSystem.components = reconstructedSystem.components.map(comp => ({
          ...comp,
          optimized: true,
          lastOptimized: new Date().toISOString()
        }));
        
        if (reconstructedSystem.relationships.length === 0 && reconstructedSystem.components.length > 1) {
          // Create default relationships if none provided
          reconstructedSystem.relationships = [];
          for (let i = 0; i < reconstructedSystem.components.length - 1; i++) {
            reconstructedSystem.relationships.push({
              id: 'rel_' + uuidv4(),
              source: reconstructedSystem.components[i].id,
              target: reconstructedSystem.components[i + 1].id,
              type: 'depends_on',
              weight: 1.0
            });
          }
        }
      }

      const result: ReconstructionOutput = {
        id: requestId,
        system: reconstructedSystem,
        metrics: {
          componentCount: reconstructedSystem.components.length,
          relationshipCount: reconstructedSystem.relationships.length,
          reconstructionTimeMs: Date.now() - startTime,
          improvement: 0.75 // Placeholder for actual improvement metric
        },
        metadata: {
          modelVersion,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: telemetryEnabled ? {
            inputComponentCount: input.components.length,
            inputRelationshipCount: input.relationships ? input.relationships.length : 0,
            strategy: input.strategy || 'default'
          } : undefined,
        },
      };

      // Emit success event
      eventEmitter.emit('reconstructionComplete', {
        requestId,
        result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during reconstruction';
      
      // Emit error event
      eventEmitter.emit('reconstructionError', {
        requestId,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  };

  return {
    id: 'RE07',
    name,
    version: modelVersion,
    reconstruct
  };
};

export default createRE07Model;