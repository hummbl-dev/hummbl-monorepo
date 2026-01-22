/**
 * DE1: Functional Partitioning
 * 
 * This model provides functionality to divide complex systems into smaller, more manageable
 * functional components. It helps in creating clear boundaries and interfaces between different
 * parts of a system.
 */

/**
 * Represents a functional component in the system
 */
export interface FunctionalComponent {
  /** Unique identifier */
  id: string;
  
  /** Name of the component */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Type of component (e.g., 'service', 'module', 'microservice') */
  type: string;
  
  /** Parent component ID (if any) */
  parentId: string | null;
  
  /** Child components */
  children: string[];
  
  /** Input interfaces (APIs, events, etc.) */
  inputs: ComponentInterface[];
  
  /** Output interfaces (APIs, events, etc.) */
  outputs: ComponentInterface[];
  
  /** Dependencies on other components */
  dependencies: ComponentDependency[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastUpdatedBy: string;
    version: string;
    tags: string[];
  };
  
  /** Additional properties */
  [key: string]: any;
}

/**
 * Represents an interface of a component (input or output)
 */
export interface ComponentInterface {
  /** Unique identifier */
  id: string;
  
  /** Name of the interface */
  name: string;
  
  /** Type of interface (e.g., 'REST', 'gRPC', 'Event', 'Queue') */
  type: string;
  
  /** Description of the interface */
  description: string;
  
  /** Interface specification (OpenAPI, AsyncAPI, etc.) */
  specification: Record<string, any>;
  
  /** Whether this interface is required */
  required: boolean;
  
  /** Version of the interface */
  version: string;
  
  /** Deprecation information (if applicable) */
  deprecated?: {
    since: string;
    message: string;
    alternative?: string;
  };
}

/**
 * Represents a dependency between components
 */
export interface ComponentDependency {
  /** ID of the target component */
  targetId: string;
  
  /** Type of dependency (e.g., 'calls', 'dependsOn', 'uses') */
  type: string;
  
  /** Description of the dependency */
  description: string;
  
  /** Whether this is a strong (hard) or weak (soft) dependency */
  strength: 'strong' | 'weak';
  
  /** Direction of the dependency */
  direction: 'inbound' | 'outbound' | 'bidirectional';
  
  /** Additional metadata */
  meta: Record<string, any>;
}

/**
 * Represents a partitioning strategy
 */
export interface PartitioningStrategy {
  /** Unique identifier */
  id: string;
  
  /** Name of the strategy */
  name: string;
  
  /** Description of the strategy */
  description: string;
  
  /** Criteria used for partitioning */
  criteria: string[];
  
  /** Weighting of each criterion */
  weights: Record<string, number>;
  
  /** Whether this is the default strategy */
  isDefault: boolean;
}

/**
 * Represents a partitioning result
 */
export interface PartitioningResult {
  /** ID of the partitioning operation */
  id: string;
  
  /** Strategy used for partitioning */
  strategyId: string;
  
  /** Timestamp of the partitioning */
  timestamp: Date;
  
  /** Resulting components */
  components: FunctionalComponent[];
  
  /** Metrics about the partitioning */
  metrics: {
    totalComponents: number;
    averageCohesion: number;
    averageCoupling: number;
    modularity: number;
    executionTime: number; // ms
  };
  
  /** Any issues or warnings */
  issues: PartitioningIssue[];
}

/**
 * Represents an issue found during partitioning
 */
export interface PartitioningIssue {
  /** Type of issue */
  type: 'warning' | 'error' | 'info';
  
  /** Description of the issue */
  message: string;
  
  /** Component IDs involved */
  componentIds: string[];
  
  /** Severity level (1-5) */
  severity: number;
  
  /** Suggested fixes */
  suggestions: string[];
}

/**
 * Represents a refactoring operation
 */
export interface RefactoringOperation {
  /** Type of refactoring */
  type: 'extract' | 'merge' | 'split' | 'move' | 'rename' | 'delete';
  
  /** Description of the operation */
  description: string;
  
  /** Components affected */
  componentIds: string[];
  
  /** Parameters for the operation */
  parameters: Record<string, any>;
  
  /** Estimated effort (1-5) */
  effort: number;
  
  /** Expected impact (1-5) */
  impact: number;
  
  /** Priority (1-5) */
  priority: number;
}

/**
 * Parameters for partitioning
 */
export interface PartitioningParams {
  /** IDs of components to partition */
  componentIds: string[];
  
  /** ID of the strategy to use */
  strategyId?: string;
  
  /** Custom criteria (overrides strategy if provided) */
  criteria?: string[];
  
  /** Custom weights (overrides strategy if provided) */
  weights?: Record<string, number>;
  
  /** Maximum number of components to create (0 for no limit) */
  maxComponents?: number;
  
  /** Whether to include detailed metrics */
  includeMetrics?: boolean;
  
  /** Additional options */
  options?: Record<string, any>;
}

/**
 * Parameters for analyzing component cohesion
 */
export interface CohesionAnalysisParams {
  /** ID of the component to analyze */
  componentId: string;
  
  /** Depth of analysis (1 = direct children only) */
  depth?: number;
  
  /** Whether to include metrics */
  includeMetrics?: boolean;
}

/**
 * Result of cohesion analysis
 */
export interface CohesionAnalysisResult {
  /** ID of the analyzed component */
  componentId: string;
  
  /** Cohesion score (0-1) */
  cohesionScore: number;
  
  /** Metrics */
  metrics: {
    internalConnections: number;
    externalConnections: number;
    totalConnections: number;
    cohesionRatio: number;
  };
  
  /** Issues found */
  issues: PartitioningIssue[];
  
  /** Suggested improvements */
  suggestions: string[];
}

/**
 * Parameters for analyzing coupling between components
 */
export interface CouplingAnalysisParams {
  /** IDs of components to analyze */
  componentIds: string[];
  
  /** Whether to include metrics */
  includeMetrics?: boolean;
}

/**
 * Result of coupling analysis
 */
export interface CouplingAnalysisResult {
  /** Pairwise coupling between components */
  couplingMatrix: {
    [componentId: string]: {
      [otherComponentId: string]: {
        strength: number;
        type: string;
        description: string;
      };
    };
  };
  
  /** Overall coupling metrics */
  metrics: {
    averageCoupling: number;
    maxCoupling: number;
    minCoupling: number;
    highlyCoupledPairs: Array<{
      componentId1: string;
      componentId2: string;
      strength: number;
    }>;
  };
  
  /** Issues found */
  issues: PartitioningIssue[];
  
  /** Suggested improvements */
  suggestions: string[];
}

/**
 * The main model interface for Functional Partitioning
 */
export interface FunctionalPartitioningModel {
  // Core properties
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Configuration
  config: {
    defaultStrategyId: string;
    maxComponents: number;
    enableAutoRefactoring: boolean;
    validationRules: string[];
    enableCaching: boolean;
    cacheTTL: number; // ms
  };
  
  // Component management
  addComponent(component: Omit<FunctionalComponent, 'id' | 'meta' | 'children'>): FunctionalComponent;
  getComponent(id: string): FunctionalComponent | null;
  updateComponent(id: string, updates: Partial<FunctionalComponent>): FunctionalComponent | null;
  removeComponent(id: string): boolean;
  getComponentHierarchy(rootId?: string): FunctionalComponent[];
  
  // Partitioning operations
  partition(params: PartitioningParams): Promise<PartitioningResult>;
  analyzeCohesion(params: CohesionAnalysisParams): Promise<CohesionAnalysisResult>;
  analyzeCoupling(params: CouplingAnalysisParams): Promise<CouplingAnalysisResult>;
  suggestRefactoring(componentId: string): Promise<RefactoringOperation[]>;
  
  // Strategy management
  addStrategy(strategy: Omit<PartitioningStrategy, 'id'>): PartitioningStrategy;
  getStrategy(id: string): PartitioningStrategy | null;
  updateStrategy(id: string, updates: Partial<PartitioningStrategy>): PartitioningStrategy | null;
  removeStrategy(id: string): boolean;
  listStrategies(): PartitioningStrategy[];
  
  // Utility methods
  validateComponent(component: FunctionalComponent): ValidationResult;
  calculateComplexity(component: FunctionalComponent): number;
  
  // Event handling
  on(event: 'componentAdded' | 'componentUpdated' | 'componentRemoved' | 
         'beforePartition' | 'afterPartition' | 'refactoringSuggested', 
      handler: (data: any) => void | Promise<void>): void;
  off(event: string, handler: Function): void;
}

/**
 * Validation result for component validation
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
