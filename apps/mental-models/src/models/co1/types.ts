/**
 * CO1: Syntactic Binding
 * 
 * This model defines a compositional grammar for model interlinkage.
 * It's part of the Composition transformation category.
 */

/**
 * Represents a binding between two or more model components
 */
export interface ModelBinding {
  /** Unique identifier for this binding */
  id: string;
  
  /** Type of binding */
  type: BindingType;
  
  /** Components being bound together */
  components: ComponentReference[];
  
  /** Constraints that apply to this binding */
  constraints: Constraint[];
  
  /** Directionality of the binding */
  direction: BindingDirection;
  
  /** Priority of this binding (higher = more important) */
  priority: number;
  
  /** Whether this binding is currently active */
  isActive: boolean;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastUpdatedBy: string;
    source?: string;
  };
}

/**
 * Reference to a component in a binding
 */
export interface ComponentReference {
  /** ID of the component */
  componentId: string;
  
  /** Role this component plays in the binding */
  role: string;
  
  /** Whether this component is required for the binding */
  isRequired: boolean;
  
  /** Constraints specific to this component in the binding */
  constraints: Constraint[];
  
  /** Metadata */
  meta: {
    description?: string;
    [key: string]: any;
  };
}

/**
 * Constraint that applies to a binding or component
 */
export interface Constraint {
  /** Type of constraint */
  type: ConstraintType;
  
  /** Constraint parameters */
  params: Record<string, any>;
  
  /** Error message if constraint is violated */
  message: string;
  
  /** Severity of the constraint */
  severity: ConstraintSeverity;
}

/**
 * Represents a binding pattern that can be reused
 */
export interface BindingPattern {
  /** Unique identifier */
  id: string;
  
  /** Name of the pattern */
  name: string;
  
  /** Description of when to use this pattern */
  description: string;
  
  /** Template for the binding */
  template: Omit<ModelBinding, 'id' | 'meta'>;
  
  /** Example usage */
  example: {
    description: string;
    binding: ModelBinding;
  };
  
  /** Related patterns */
  relatedPatterns: string[];
  
  /** Tags for categorization */
  tags: string[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastUpdatedBy: string;
  };
}

/**
 * Result of validating a binding
 */
export interface ValidationResult {
  /** Whether the binding is valid */
  isValid: boolean;
  
  /** Validation errors, if any */
  errors: ValidationError[];
  
  /** Warnings, if any */
  warnings: ValidationWarning[];
  
  /** Suggestions for improvement */
  suggestions: string[];
}

/**
 * A validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Path to the error in the binding */
  path: string;
  
  /** Severity of the error */
  severity: 'error' | 'warning' | 'info';
  
  /** How to fix the error */
  fix?: {
    description: string;
    action: () => void;
  };
}

/**
 * A validation warning
 */
export type ValidationWarning = Omit<ValidationError, 'severity'> & {
  severity: 'warning';
};

/**
 * Parameters for creating a new binding
 */
export interface CreateBindingParams {
  /** Type of binding */
  type: BindingType;
  
  /** Components to bind */
  components: Array<{
    componentId: string;
    role: string;
    isRequired?: boolean;
    constraints?: Constraint[];
  }>;
  
  /** Constraints that apply to the binding */
  constraints?: Constraint[];
  
  /** Directionality of the binding */
  direction?: BindingDirection;
  
  /** Priority of the binding */
  priority?: number;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Additional metadata */
  meta?: {
    [key: string]: any;
  };
}

/**
 * Parameters for validating a binding
 */
export interface ValidateBindingParams {
  /** The binding to validate */
  binding: ModelBinding | CreateBindingParams;
  
  /** Whether to include suggestions in the result */
  includeSuggestions?: boolean;
  
  /** Whether to include warnings in the result */
  includeWarnings?: boolean;
  
  /** Additional context for validation */
  context?: Record<string, any>;
}

/**
 * Types of bindings
 */
export enum BindingType {
  // Data flow bindings
  DATA_TRANSFORM = 'data_transform',  // Transform data from one format to another
  DATA_AGGREGATION = 'data_aggregation',  // Combine data from multiple sources
  DATA_FILTER = 'data_filter',  // Filter data based on conditions
  
  // Control flow bindings
  SEQUENTIAL = 'sequential',  // Execute components in sequence
  PARALLEL = 'parallel',  // Execute components in parallel
  CONDITIONAL = 'conditional',  // Execute components conditionally
  
  // Structural bindings
  COMPOSITION = 'composition',  // Compose components into a larger component
  DECORATOR = 'decorator',  // Add behavior to a component
  ADAPTER = 'adapter',  // Adapt one interface to another
  
  // Communication bindings
  PUB_SUB = 'pub_sub',  // Publish/subscribe pattern
  REQUEST_RESPONSE = 'request_response',  // Request/response pattern
  EVENT_DRIVEN = 'event_driven',  // Event-driven architecture
  
  // State management bindings
  STATE_SHARING = 'state_sharing',  // Share state between components
  STATE_SYNC = 'state_sync',  // Synchronize state between components
  
  // Custom binding type
  CUSTOM = 'custom',  // Custom binding type
}

/**
 * Binding directionality
 */
export enum BindingDirection {
  UNIDIRECTIONAL = 'unidirectional',  // One-way binding
  BIDIRECTIONAL = 'bidirectional',  // Two-way binding
  MULTIDIRECTIONAL = 'multidirectional',  // Multi-way binding
}

/**
 * Types of constraints
 */
export enum ConstraintType {
  // Type constraints
  TYPE_MATCH = 'type_match',  // Types must match
  TYPE_COMPATIBLE = 'type_compatible',  // Types must be compatible
  
  // Cardinality constraints
  MIN_CARDINALITY = 'min_cardinality',  // Minimum number of components
  MAX_CARDINALITY = 'max_cardinality',  // Maximum number of components
  EXACT_CARDINALITY = 'exact_cardinality',  // Exact number of components
  
  // Dependency constraints
  REQUIRES = 'requires',  // Requires another component
  EXCLUDES = 'excludes',  // Excludes another component
  
  // Validation constraints
  VALIDATION_RULE = 'validation_rule',  // Custom validation rule
  
  // Performance constraints
  MAX_LATENCY = 'max_latency',  // Maximum allowed latency
  MIN_THROUGHPUT = 'min_throughput',  // Minimum required throughput
  
  // Security constraints
  AUTHENTICATION_REQUIRED = 'authentication_required',  // Authentication is required
  AUTHORIZATION_REQUIRED = 'authorization_required',  // Authorization is required
  ENCRYPTION_REQUIRED = 'encryption_required',  // Encryption is required
  
  // Custom constraint type
  CUSTOM = 'custom',  // Custom constraint type
}

/**
 * Constraint severity levels
 */
export enum ConstraintSeverity {
  ERROR = 'error',  // Must be satisfied
  WARNING = 'warning',  // Should be satisfied
  INFO = 'info',  // Optional, for information only
}

/**
 * The main model interface
 */
export interface SyntacticBindingModel {
  /** Model metadata */
  id: string;
  name: string;
  description: string;
  version: string;
  
  /** Core methods */
  createBinding(params: CreateBindingParams): ModelBinding;
  validateBinding(params: ValidateBindingParams): ValidationResult;
  applyBinding(binding: ModelBinding): Promise<boolean>;
  removeBinding(bindingId: string): boolean;
  
  /** Pattern management */
  registerPattern(pattern: Omit<BindingPattern, 'id'>): BindingPattern;
  getPattern(patternId: string): BindingPattern | null;
  listPatterns(filter?: { tags?: string[] }): BindingPattern[];
  
  /** Binding management */
  getBinding(bindingId: string): ModelBinding | null;
  listBindings(filter?: { 
    type?: BindingType;
    tags?: string[];
    componentId?: string;
  }): ModelBinding[];
  
  /** Utility methods */
  suggestBindings(components: ComponentReference[]): ModelBinding[];
  optimizeBindings(bindings: ModelBinding[]): ModelBinding[];
  
  /** Configuration */
  config: {
    maxBindingsPerComponent: number;
    defaultPriority: number;
    enableAutoValidation: boolean;
    strictMode: boolean;
  };
}
