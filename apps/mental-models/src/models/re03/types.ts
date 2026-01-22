import { EventEmitter } from 'events';

export interface ReconstructionComponent {
  /** Unique identifier for the component */
  id: string;
  
  /** Type/category of the component */
  type: string;
  
  /** Properties of the component */
  properties: Record<string, any>;
  
  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface ReconstructionRelationship {
  /** Unique identifier for the relationship */
  id: string;
  
  /** Type of relationship */
  type: string;
  
  /** IDs of the source and target components */
  source: string;
  target: string;
  
  /** Properties of the relationship */
  properties?: Record<string, any>;
}

export interface ReconstructionInput {
  /** Unique identifier for the system being reconstructed */
  systemId?: string;
  
  /** Name of the system */
  name?: string;
  
  /** Components to be reconstructed */
  components: ReconstructionComponent[];
  
  /** Relationships between components */
  relationships?: ReconstructionRelationship[];
  
  /** Strategy for reconstruction */
  strategy?: 'default' | 'optimize' | 'minimal' | 'comprehensive';
  
  /** Additional context for the reconstruction */
  context?: Record<string, any>;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface ReconstructionMetrics {
  /** Number of components in the reconstructed system */
  componentCount: number;
  
  /** Number of relationships in the reconstructed system */
  relationshipCount: number;
  
  /** Time taken for reconstruction in milliseconds */
  reconstructionTimeMs: number;
  
  /** Improvement metric (0-1) */
  improvement: number;
  
  /** Any additional metrics */
  [key: string]: any;
}

export interface ReconstructionOutput {
  /** Unique identifier for this reconstruction */
  id: string;
  
  /** The reconstructed system */
  system: {
    id: string;
    name: string;
    components: ReconstructionComponent[];
    relationships: ReconstructionRelationship[];
    metadata: Record<string, any>;
  };
  
  /** Metrics about the reconstruction */
  metrics: ReconstructionMetrics;
  
  /** Additional metadata */
  metadata: {
    /** Version of the model */
    modelVersion: string;
    
    /** When the reconstruction was performed */
    timestamp: string;
    
    /** How long the reconstruction took in milliseconds */
    executionTimeMs: number;
    
    /** Telemetry data (if enabled) */
    telemetry?: {
      /** Number of input components */
      inputComponentCount: number;
      
      /** Number of input relationships */
      inputRelationshipCount: number;
      
      /** Reconstruction strategy used */
      strategy: string;
      
      /** Any additional telemetry data */
      [key: string]: any;
    };
  };
}

export interface ReconstructionConfig {
  /** Name of the model */
  name: string;
  
  /** Version of the model */
  version: string;
  
  /** Event emitter for analytics and monitoring */
  eventEmitter: EventEmitter;
  
  /** Whether to enable telemetry */
  telemetryEnabled: boolean;
  
  /** Logger instance */
  logger: Console | any;
}

export const DEFAULT_CONFIG: ReconstructionConfig = {
  name: 'RE03',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: false,
  logger: console,
};

// Event types
export interface ReconstructionCompleteEvent {
  requestId: string;
  result: ReconstructionOutput;
  timestamp: string;
}

export interface ReconstructionErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

export type ReconstructionEventHandler<T> = (event: T) => void;

declare global {
  interface Window {
    RE03Analytics?: {
      onReconstructionComplete: (handler: ReconstructionEventHandler<ReconstructionCompleteEvent>) => void;
      onReconstructionError: (handler: ReconstructionEventHandler<ReconstructionErrorEvent>) => void;
    };
  }
}