import { 
  BindingPattern, 
  ModelBinding, 
  ComponentReference, 
  Constraint, 
  ConstraintType, 
  ConstraintSeverity,
  BindingType,
  BindingDirection
} from './types';

/**
 * Constants for the Syntactic Binding model (CO1)
 */

export const CO1_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'CO1',
  MODEL_NAME: 'Syntactic Binding',
  TRANSFORMATION: 'Composition',
  VERSION: '1.0.0',
  
  // Default configuration values
  DEFAULTS: {
    MAX_BINDINGS_PER_COMPONENT: 10,
    DEFAULT_PRIORITY: 5,
    ENABLE_AUTO_VALIDATION: true,
    STRICT_MODE: false,
  },
  
  // Common constraint templates
  CONSTRAINT_TEMPLATES: {
    // Type constraints
    TYPE_MATCH: (expectedType: string): Constraint => ({
      type: ConstraintType.TYPE_MATCH,
      params: { expectedType },
      message: `Value must be of type ${expectedType}`,
      severity: ConstraintSeverity.ERROR,
    }),
    
    // Cardinality constraints
    MIN_CARDINALITY: (min: number): Constraint => ({
      type: ConstraintType.MIN_CARDINALITY,
      params: { min },
      message: `At least ${min} component(s) required`,
      severity: ConstraintSeverity.ERROR,
    }),
    
    MAX_CARDINALITY: (max: number): Constraint => ({
      type: ConstraintType.MAX_CARDINALITY,
      params: { max },
      message: `At most ${max} component(s) allowed`,
      severity: ConstraintSeverity.ERROR,
    }),
    
    // Dependency constraints
    REQUIRES: (componentId: string): Constraint => ({
      type: ConstraintType.REQUIRES,
      params: { componentId },
      message: `Requires component with ID: ${componentId}`,
      severity: ConstraintSeverity.ERROR,
    }),
    
    EXCLUDES: (componentId: string): Constraint => ({
      type: ConstraintType.EXCLUDES,
      params: { componentId },
      message: `Cannot be used with component: ${componentId}`,
      severity: ConstraintSeverity.ERROR,
    }),
    
    // Performance constraints
    MAX_LATENCY: (maxMs: number): Constraint => ({
      type: ConstraintType.MAX_LATENCY,
      params: { maxMs },
      message: `Maximum allowed latency: ${maxMs}ms`,
      severity: ConstraintSeverity.WARNING,
    }),
  },
  
  // Built-in binding patterns
  BUILTIN_PATTERNS: [
    {
      id: 'pipeline',
      name: 'Processing Pipeline',
      description: 'Sequential processing of data through multiple components',
      template: {
        type: BindingType.SEQUENTIAL,
        components: [
          {
            componentId: 'source',
            role: 'source',
            isRequired: true,
            constraints: [
              {
                type: ConstraintType.MIN_CARDINALITY,
                params: { min: 1 },
                message: 'At least one source component is required',
                severity: ConstraintSeverity.ERROR,
              },
            ],
          },
          {
            componentId: 'processor',
            role: 'processor',
            isRequired: true,
            constraints: [
              {
                type: ConstraintType.MIN_CARDINALITY,
                params: { min: 1 },
                message: 'At least one processor component is required',
                severity: ConstraintSeverity.ERROR,
              },
            ],
          },
          {
            componentId: 'sink',
            role: 'sink',
            isRequired: true,
            constraints: [
              {
                type: ConstraintType.MIN_CARDINALITY,
                params: { min: 1 },
                message: 'At least one sink component is required',
                severity: ConstraintSeverity.ERROR,
              },
            ],
          },
        ],
        constraints: [
          {
            type: ConstraintType.MAX_LATENCY,
            params: { maxMs: 1000 },
            message: 'Pipeline must complete within 1000ms',
            severity: ConstraintSeverity.WARNING,
          },
        ],
        direction: BindingDirection.UNIDIRECTIONAL,
        priority: 5,
        isActive: true,
        tags: ['pipeline', 'sequential', 'data-processing'],
      },
      example: {
        description: 'Image processing pipeline that loads, transforms, and saves images',
        binding: {
          id: 'image-pipeline',
          type: BindingType.SEQUENTIAL,
          components: [
            {
              componentId: 'image-loader',
              role: 'source',
              isRequired: true,
              constraints: [],
            },
            {
              componentId: 'image-resizer',
              role: 'processor',
              isRequired: false,
              constraints: [],
            },
            {
              componentId: 'image-filter',
              role: 'processor',
              isRequired: false,
              constraints: [],
            },
            {
              componentId: 'image-saver',
              role: 'sink',
              isRequired: true,
              constraints: [],
            },
          ],
          constraints: [],
          direction: BindingDirection.UNIDIRECTIONAL,
          priority: 5,
          isActive: true,
          tags: ['image-processing', 'pipeline'],
          meta: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            lastUpdatedBy: 'system',
          },
        },
      },
      relatedPatterns: ['filter', 'map-reduce'],
      tags: ['data-processing', 'pipeline', 'sequential'],
      meta: {
        createdAt: new Date('2023-10-01T00:00:00Z'),
        updatedAt: new Date('2023-10-01T00:00:00Z'),
        createdBy: 'system',
        lastUpdatedBy: 'system',
      },
    },
    // More patterns can be added here
  ] as BindingPattern[],
  
  // Example bindings for testing and documentation
  EXAMPLE_BINDINGS: [
    {
      id: 'data-processing-flow',
      type: BindingType.SEQUENTIAL,
      components: [
        {
          componentId: 'data-source',
          role: 'source',
          isRequired: true,
          constraints: [],
        },
        {
          componentId: 'data-transformer',
          role: 'processor',
          isRequired: true,
          constraints: [],
        },
        {
          componentId: 'data-storage',
          role: 'sink',
          isRequired: true,
          constraints: [],
        },
      ],
      constraints: [
        {
          type: ConstraintType.MAX_LATENCY,
          params: { maxMs: 2000 },
          message: 'Data processing must complete within 2000ms',
          severity: ConstraintSeverity.WARNING,
        },
      ],
      direction: BindingDirection.UNIDIRECTIONAL,
      priority: 5,
      isActive: true,
      tags: ['data-processing', 'pipeline'],
      meta: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastUpdatedBy: 'system',
      },
    },
  ] as ModelBinding[],
  
  // Example scenario for documentation
  EXAMPLE_SCENARIO: {
    title: 'E-commerce Checkout Flow',
    description: 'A binding that connects the shopping cart, payment processor, and order management system',
    bindings: [
      {
        type: BindingType.SEQUENTIAL,
        components: [
          { componentId: 'shopping-cart', role: 'source' },
          { componentId: 'payment-processor', role: 'processor' },
          { componentId: 'order-manager', role: 'sink' },
        ],
      },
    ],
  },
} as const;
