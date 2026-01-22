import { FunctionalComponent, PartitioningStrategy, ComponentInterface } from './types';

/**
 * Constants for the Functional Partitioning model
 */
export const DE1_CONSTANTS = {
  // Model metadata
  MODEL_ID: 'functional-partitioning-model',
  MODEL_NAME: 'Functional Partitioning Model',
  MODEL_DESCRIPTION: 'Divides complex systems into functional components with clear boundaries',
  VERSION: '1.0.0',
  
  // Default configuration
  DEFAULT_CONFIG: {
    defaultStrategyId: 'strategy-default',
    maxComponents: 50,
    enableAutoRefactoring: true,
    validationRules: ['required-fields', 'naming-convention', 'circular-dependency'],
    enableCaching: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  },
  
  // Default partitioning strategies
  DEFAULT_STRATEGIES: [
    {
      id: 'strategy-default',
      name: 'Default Partitioning',
      description: 'Balanced partitioning based on cohesion and coupling',
      criteria: ['cohesion', 'coupling', 'complexity'],
      weights: { cohesion: 0.4, coupling: 0.4, complexity: 0.2 },
      isDefault: true
    },
    {
      id: 'strategy-microservices',
      name: 'Microservices Architecture',
      description: 'Partitioning optimized for microservices architecture',
      criteria: ['bounded-context', 'business-capability', 'data-ownership'],
      weights: { 'bounded-context': 0.5, 'business-capability': 0.3, 'data-ownership': 0.2 },
      isDefault: false
    },
    {
      id: 'strategy-monolith',
      name: 'Monolithic Modules',
      description: 'Partitioning optimized for modular monoliths',
      criteria: ['functional-cohesion', 'team-structure', 'deployment-unit'],
      weights: { 'functional-cohesion': 0.6, 'team-structure': 0.2, 'deployment-unit': 0.2 },
      isDefault: false
    }
  ] as Omit<PartitioningStrategy, 'id'>[],
  
  // Default component types
  COMPONENT_TYPES: [
    'service', 'module', 'microservice', 'library', 'api-gateway', 
    'database', 'queue', 'event-bus', 'cache', 'frontend', 'backend'
  ],
  
  // Default interface types
  INTERFACE_TYPES: [
    'REST', 'GraphQL', 'gRPC', 'WebSocket', 'Event', 'Queue', 'Stream', 'RPC', 'CLI', 'File'
  ],
  
  // Default component template
  DEFAULT_COMPONENT: {
    name: '',
    description: '',
    type: 'service',
    parentId: null,
    children: [],
    inputs: [],
    outputs: [],
    dependencies: [],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0',
      tags: []
    }
  } as Omit<FunctionalComponent, 'id'>,
  
  // Default interface template
  DEFAULT_INTERFACE: {
    name: '',
    type: 'REST',
    description: '',
    specification: {},
    required: true,
    version: '1.0.0'
  } as Omit<ComponentInterface, 'id'>,
  
  // Error messages
  ERRORS: {
    COMPONENT_NOT_FOUND: 'Component not found',
    STRATEGY_NOT_FOUND: 'Partitioning strategy not found',
    INVALID_COMPONENT: 'Invalid component data',
    CIRCULAR_DEPENDENCY: 'Circular dependency detected',
    MAX_COMPONENTS_EXCEEDED: 'Maximum number of components exceeded',
    INVALID_PARTITIONING: 'Invalid partitioning parameters',
    VALIDATION_FAILED: 'Validation failed'
  },
  
  // Event names
  EVENTS: {
    COMPONENT_ADDED: 'componentAdded',
    COMPONENT_UPDATED: 'componentUpdated',
    COMPONENT_REMOVED: 'componentRemoved',
    BEFORE_PARTITION: 'beforePartition',
    AFTER_PARTITION: 'afterPartition',
    REFACTORING_SUGGESTED: 'refactoringSuggested'
  },
  
  // Default validation rules
  VALIDATION_RULES: [
    {
      id: 'required-fields',
      validate: (component: any) => {
        const errors = [];
        if (!component.name) {
          errors.push({
            code: 'missing-name',
            message: 'Component must have a name',
            path: 'name',
            severity: 'error'
          });
        }
        
        if (!component.type) {
          errors.push({
            code: 'missing-type',
            message: 'Component must have a type',
            path: 'type',
            severity: 'error'
          });
        }
        
        return errors;
      }
    },
    {
      id: 'naming-convention',
      validate: (component: any) => {
        const errors = [];
        
        // Check component name follows kebab-case
        if (component.name && !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(component.name)) {
          errors.push({
            code: 'invalid-name-format',
            message: 'Component name should be in kebab-case (e.g., user-service)',
            path: 'name',
            severity: 'warning'
          });
        }
        
        return errors;
      }
    },
    {
      id: 'circular-dependency',
      validate: (component: any, model: any) => {
        const errors: any[] = [];
        
        // This is a simplified check - actual implementation would traverse the dependency graph
        if (component.dependencies) {
          const dependencyIds = component.dependencies.map((d: any) => d.targetId);
          if (dependencyIds.includes(component.id)) {
            errors.push({
              code: 'self-dependency',
              message: 'Component cannot depend on itself',
              path: 'dependencies',
              severity: 'error'
            });
          }
        }
        
        return errors;
      }
    }
  ],
  
  // Default refactoring patterns
  REFACTORING_PATTERNS: [
    {
      id: 'extract-service',
      name: 'Extract Microservice',
      description: 'Extract a set of related functionality into a separate microservice',
      conditions: [
        'component.complexity > 0.7',
        'component.cohesion < 0.5',
        'component.coupling < 0.3'
      ],
      action: 'extract',
      priority: 1
    },
    {
      id: 'merge-services',
      name: 'Merge Services',
      description: 'Merge highly coupled services into a single service',
      conditions: [
        'coupling > 0.8',
        'communicationFrequency > 100',
        'similarity > 0.7'
      ],
      action: 'merge',
      priority: 2
    },
    {
      id: 'split-module',
      name: 'Split Module',
      description: 'Split a module that has grown too large',
      conditions: [
        'component.linesOfCode > 1000',
        'component.cohesion < 0.4',
        'component.responsibilities.length > 3'
      ],
      action: 'split',
      priority: 3
    }
  ]
};

/**
 * Example components for testing and demonstration
 */
export const EXAMPLE_COMPONENTS: Omit<FunctionalComponent, 'id'>[] = [
  {
    name: 'user-service',
    description: 'Handles user authentication and profile management',
    type: 'microservice',
    parentId: null,
    children: [],
    inputs: [
      {
        id: 'input-1',
        name: 'REST API',
        type: 'REST',
        description: 'RESTful API for user management',
        specification: {
          openapi: '3.0.0',
          paths: {
            '/users': {
              get: { summary: 'List users' },
              post: { summary: 'Create user' }
            },
            '/users/{id}': {
              get: { summary: 'Get user by ID' },
              put: { summary: 'Update user' },
              delete: { summary: 'Delete user' }
            }
          }
        },
        required: true,
        version: '1.0.0'
      }
    ],
    outputs: [
      {
        id: 'output-1',
        name: 'User Events',
        type: 'Event',
        description: 'Events published when users are created or updated',
        specification: {
          type: 'object',
          properties: {
            eventType: { type: 'string', enum: ['user.created', 'user.updated', 'user.deleted'] },
            userId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        required: true,
        version: '1.0.0'
      }
    ],
    dependencies: [
      {
        targetId: 'auth-service',
        type: 'calls',
        description: 'Calls auth service for token validation',
        strength: 'strong',
        direction: 'outbound',
        meta: { protocol: 'HTTP' }
      }
    ],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0',
      tags: ['authentication', 'user-management']
    }
  },
  {
    name: 'auth-service',
    description: 'Handles authentication and authorization',
    type: 'microservice',
    parentId: null,
    children: [],
    inputs: [
      {
        id: 'input-1',
        name: 'Auth API',
        type: 'REST',
        description: 'Authentication API endpoints',
        specification: {
          openapi: '3.0.0',
          paths: {
            '/auth/login': { post: { summary: 'Authenticate user' } },
            '/auth/validate': { post: { summary: 'Validate token' } },
            '/auth/refresh': { post: { summary: 'Refresh token' } }
          }
        },
        required: true,
        version: '1.0.0'
      }
    ],
    outputs: [],
    dependencies: [],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0',
      tags: ['authentication', 'authorization', 'security']
    }
  }
];

/**
 * Default export for convenience
 */
export default {
  ...DE1_CONSTANTS,
  EXAMPLE_COMPONENTS
};
