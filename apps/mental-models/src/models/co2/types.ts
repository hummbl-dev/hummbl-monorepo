/**
 * CO2: Conceptual Fusion
 * 
 * This model enables the merging of multiple conceptual models into a unified representation,
 * resolving conflicts and identifying synergies between different models.
 */

/**
 * Represents a concept within the fusion model
 */
export interface Concept {
  /** Unique identifier */
  id: string;
  
  /** Name of the concept */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Source models this concept came from */
  sourceModels: string[];
  
  /** Properties of the concept */
  properties: {
    [key: string]: {
      value: any;
      confidence: number;
      sources: string[];
    };
  };
  
  /** Relationships to other concepts */
  relationships: {
    targetId: string;
    type: string;
    strength: number;
    bidirectional: boolean;
  }[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastUpdatedBy: string;
    version: string;
  };
  
  /** Tags for categorization */
  tags: string[];
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Whether this concept is active */
  isActive: boolean;
}

/**
 * Represents a conflict between concepts or properties
 */
export interface Conflict {
  /** Type of conflict */
  type: 'naming' | 'property' | 'relationship' | 'cardinality' | 'constraint';
  
  /** Description of the conflict */
  description: string;
  
  /** Severity of the conflict */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Source models involved in the conflict */
  sources: string[];
  
  /** The conflicting elements */
  elements: {
    type: 'concept' | 'property' | 'relationship';
    id: string;
    value?: any;
  }[];
  
  /** Resolution status */
  status: 'unresolved' | 'resolved' | 'postponed' | 'rejected';
  
  /** Resolution details */
  resolution?: {
    method: 'auto' | 'merge' | 'prefer' | 'new' | 'custom';
    description: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
}

/**
 * Represents a fusion between two or more concepts
 */
export interface Fusion {
  /** Source concept IDs */
  sourceIds: string[];
  
  /** Resulting concept ID */
  resultId: string;
  
  /** Fusion method used */
  method: 'union' | 'intersection' | 'preferred' | 'custom';
  
  /** Confidence in the fusion (0-1) */
  confidence: number;
  
  /** Conflicts resolved during fusion */
  resolvedConflicts: string[]; // Conflict IDs
  
  /** Metadata */
  meta: {
    fusedAt: Date;
    fusedBy: string;
    notes?: string;
  };
}

/**
 * Represents a mapping between source and target concepts
 */
export interface ConceptMapping {
  sourceId: string;
  targetId: string;
  
  /** Type of mapping */
  type: 'exact' | 'narrower' | 'broader' | 'related' | 'custom';
  
  /** Confidence in the mapping (0-1) */
  confidence: number;
  
  /** Rules or conditions for the mapping */
  rules: string[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date;
    updatedBy?: string;
  };
}

/**
 * Represents a transformation rule for concept fusion
 */
export interface TransformationRule {
  /** Unique identifier */
  id: string;
  
  /** Name of the rule */
  name: string;
  
  /** Description of what the rule does */
  description: string;
  
  /** Priority of the rule (higher = applied first) */
  priority: number;
  
  /** Condition for when the rule applies */
  condition: string; // Could be a function string or DSL
  
  /** Action to take when condition is met */
  action: string; // Could be a function string or DSL
  
  /** Whether the rule is active */
  isActive: boolean;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date;
    updatedBy?: string;
  };
}

/**
 * Parameters for fusing concepts
 */
export interface FuseConceptsParams {
  /** IDs of concepts to fuse */
  conceptIds: string[];
  
  /** Strategy to use for fusion */
  strategy?: 'union' | 'intersection' | 'preferred' | 'custom';
  
  /** Custom fusion rules to apply */
  rules?: string[];
  
  /** Whether to auto-resolve conflicts */
  autoResolve?: boolean;
  
  /** Context for the fusion operation */
  context?: Record<string, any>;
}

/**
 * Result of a fusion operation
 */
export interface FusionResult {
  /** The resulting fused concept */
  result: Concept;
  
  /** Conflicts that were resolved */
  resolvedConflicts: Conflict[];
  
  /** Unresolved conflicts */
  unresolvedConflicts: Conflict[];
  
  /** Metrics about the fusion */
  metrics: {
    inputConcepts: number;
    propertiesMerged: number;
    conflictsResolved: number;
    conflictsRemaining: number;
    fusionTime: number; // ms
  };
}

/**
 * Parameters for finding similar concepts
 */
export interface FindSimilarConceptsParams {
  /** Concept to find similarities for */
  conceptId: string;
  
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Fields to consider for similarity */
  fields?: ('name' | 'description' | 'properties' | 'relationships')[];
}

/**
 * Result of a similarity search
 */
export interface SimilarityResult {
  /** The concept being compared */
  concept: Concept;
  
  /** Similarity score (0-1) */
  score: number;
  
  /** Breakdown of similarity by field */
  breakdown: {
    field: string;
    score: number;
    weight: number;
  }[];
}

/**
 * The main model interface for Conceptual Fusion
 */
export interface ConceptualFusionModel {
  // Core properties
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Configuration
  config: {
    defaultSimilarityThreshold: number;
    maxConceptsToFuse: number;
    autoResolveConflicts: boolean;
    defaultFusionStrategy: 'union' | 'intersection' | 'preferred';
    enableCaching: boolean;
    cacheTTL: number; // ms
  };
  
  // Core methods
  addConcept(concept: Omit<Concept, 'id' | 'meta'>): Concept;
  getConcept(id: string): Concept | null;
  updateConcept(id: string, updates: Partial<Concept>): Concept | null;
  removeConcept(id: string): boolean;
  
  // Fusion operations
  fuseConcepts(params: FuseConceptsParams): Promise<FusionResult>;
  findSimilarConcepts(params: FindSimilarConceptsParams): Promise<SimilarityResult[]>;
  
  // Conflict management
  detectConflicts(conceptIds: string[]): Conflict[];
  resolveConflict(conflictId: string, resolution: any): boolean;
  
  // Rule management
  addRule(rule: Omit<TransformationRule, 'id' | 'meta'>): TransformationRule;
  getRule(id: string): TransformationRule | null;
  updateRule(id: string, updates: Partial<TransformationRule>): TransformationRule | null;
  removeRule(id: string): boolean;
  
  // Utility methods
  calculateSimilarity(concept1: Concept, concept2: Concept, fields?: ('name' | 'description' | 'properties' | 'relationships')[]): { score: number; breakdown: Array<{ field: string; score: number; weight: number }> };
  validateConcept(concept: Concept): ValidationResult;
  
  // Lifecycle hooks
  on(event: 'beforeFusion' | 'afterFusion' | 'conflictDetected', 
     handler: (data: any) => void | Promise<void>): void;
  off(event: string, handler: Function): void;
}

/**
 * Validation result for concept validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
  details?: any;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  suggestion?: string;
}
