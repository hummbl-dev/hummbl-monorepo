import { Concept, TransformationRule } from './types';

/**
 * Constants for the Conceptual Fusion model
 */
export const CO2_CONSTANTS = {
  // Model metadata
  MODEL_ID: 'conceptual-fusion-model',
  MODEL_NAME: 'Conceptual Fusion Model',
  MODEL_DESCRIPTION: 'Enables merging of multiple conceptual models into a unified representation',
  VERSION: '1.0.0',
  
  // Default configuration
  DEFAULT_CONFIG: {
    defaultSimilarityThreshold: 0.7,
    maxConceptsToFuse: 10,
    autoResolveConflicts: true,
    defaultFusionStrategy: 'union' as const,
    enableCaching: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  },
  
  // Default transformation rules
  DEFAULT_RULES: [
    {
      id: 'rule-merge-identical-properties',
      name: 'Merge Identical Properties',
      description: 'Merges properties with identical names and values',
      priority: 100,
      condition: `
        (concept1, concept2) => {
          const commonProps = Object.keys(concept1.properties)
            .filter(key => concept2.properties[key] !== undefined);
          
          return commonProps.length > 0;
        }
      `,
      action: `
        (concept1, concept2) => {
          const result = { ...concept1 };
          const commonProps = Object.keys(concept1.properties)
            .filter(key => concept2.properties[key] !== undefined);
          
          commonProps.forEach(prop => {
            // Merge property metadata
            result.properties[prop] = {
              ...concept1.properties[prop],
              sources: [
                ...new Set([
                  ...(concept1.properties[prop].sources || []),
                  ...(concept2.properties[prop].sources || [])
                ])
              ],
              // Average confidence
              confidence: (concept1.properties[prop].confidence + 
                concept2.properties[prop].confidence) / 2
            };
          });
          
          return result;
        }
      `,
      isActive: true,
      tags: ['property', 'merge', 'automatic']
    },
    {
      id: 'rule-resolve-naming-conflicts',
      name: 'Resolve Naming Conflicts',
      description: 'Resolves conflicts when the same concept has different names',
      priority: 90,
      condition: `
        (concept1, concept2) => {
          // Different names but similar enough to be the same concept
          return concept1.name !== concept2.name && 
            calculateSimilarity(concept1.name, concept2.name) > 0.8;
        }
      `,
      action: `
        (concept1, concept2, context) => {
          // Prefer the name from the more authoritative source
          const sourcePriority = context?.sourcePriority || [];
          let preferredName = concept1.name;
          
          // Find the first source in the priority list
          for (const source of sourcePriority) {
            if (concept2.sourceModels.includes(source)) {
              preferredName = concept2.name;
              break;
            } else if (concept1.sourceModels.includes(source)) {
              preferredName = concept1.name;
              break;
            }
          }
          
          const result = { ...concept1, name: preferredName };
          
          // Add both names as aliases
          if (!result.meta.aliases) result.meta.aliases = [];
          if (concept1.name !== preferredName) result.meta.aliases.push(concept1.name);
          if (concept2.name !== preferredName) result.meta.aliases.push(concept2.name);
          
          return result;
        }
      `,
      isActive: true,
      tags: ['naming', 'conflict-resolution', 'semi-automatic']
    }
  ] as Omit<TransformationRule, 'id' | 'meta'>[],
  
  // Similarity weights for different concept fields
  SIMILARITY_WEIGHTS: {
    name: 0.4,
    description: 0.3,
    properties: 0.5,
    relationships: 0.3,
    tags: 0.2
  },
  
  // Default concept template
  DEFAULT_CONCEPT: {
    id: '',
    name: '',
    description: '',
    sourceModels: [],
    properties: {},
    relationships: [],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0'
    },
    tags: [],
    confidence: 1.0,
    isActive: true
  } as Omit<Concept, 'id'>,
  
  // Error messages
  ERRORS: {
    CONCEPT_NOT_FOUND: 'Concept not found',
    INVALID_CONCEPT: 'Invalid concept data',
    FUSION_FAILED: 'Failed to fuse concepts',
    RULE_VALIDATION_FAILED: 'Rule validation failed',
    CONFLICT_DETECTED: 'Conflict detected during fusion',
    MAX_CONCEPTS_EXCEEDED: 'Maximum number of concepts to fuse exceeded'
  },
  
  // Event names
  EVENTS: {
    BEFORE_FUSION: 'beforeFusion',
    AFTER_FUSION: 'afterFusion',
    CONFLICT_DETECTED: 'conflictDetected',
    CONCEPT_ADDED: 'conceptAdded',
    CONCEPT_UPDATED: 'conceptUpdated',
    CONCEPT_REMOVED: 'conceptRemoved'
  },
  
  // Default validation rules
  VALIDATION_RULES: [
    {
      id: 'required-fields',
      validate: (concept: Concept) => {
        const errors = [];
        if (!concept.name) {
          errors.push({
            code: 'missing-name',
            message: 'Concept must have a name',
            path: 'name',
            severity: 'error'
          });
        }
        
        if (!concept.sourceModels || concept.sourceModels.length === 0) {
          errors.push({
            code: 'missing-source',
            message: 'Concept must have at least one source model',
            path: 'sourceModels',
            severity: 'error'
          });
        }
        
        return errors;
      }
    },
    {
      id: 'property-validation',
      validate: (concept: Concept) => {
        const errors = [];
        
        // Check property names
        for (const propName in concept.properties) {
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(propName)) {
            errors.push({
              code: 'invalid-property-name',
              message: `Property name '${propName}' is invalid. Must start with a letter or underscore and contain only alphanumeric characters and underscores.`,
              path: `properties.${propName}`,
              severity: 'error'
            });
          }
          
          const prop = concept.properties[propName];
          if (prop.confidence < 0 || prop.confidence > 1) {
            errors.push({
              code: 'invalid-confidence',
              message: `Confidence for property '${propName}' must be between 0 and 1`,
              path: `properties.${propName}.confidence`,
              severity: 'error'
            });
          }
        }
        
        return errors;
      }
    }
  ]
};

/**
 * Example concepts for testing and demonstration
 */
export const EXAMPLE_CONCEPTS: Omit<Concept, 'id'>[] = [
  {
    name: 'Customer',
    description: 'A person or organization that purchases goods or services',
    sourceModels: ['CRM', 'Billing'],
    properties: {
      name: {
        value: 'string',
        confidence: 0.95,
        sources: ['CRM', 'Billing']
      },
      email: {
        value: 'string',
        confidence: 0.9,
        sources: ['CRM']
      },
      billingAddress: {
        value: 'Address',
        confidence: 0.85,
        sources: ['Billing']
      }
    },
    relationships: [
      {
        targetId: 'Order',
        type: 'hasMany',
        strength: 0.9,
        bidirectional: true
      }
    ],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0'
    },
    tags: ['core', 'business'],
    confidence: 0.9,
    isActive: true
  },
  {
    name: 'Client',
    description: 'A customer in the sales system',
    sourceModels: ['Sales'],
    properties: {
      fullName: {
        value: 'string',
        confidence: 0.92,
        sources: ['Sales']
      },
      contactEmail: {
        value: 'string',
        confidence: 0.88,
        sources: ['Sales']
      },
      company: {
        value: 'string',
        confidence: 0.8,
        sources: ['Sales']
      }
    },
    relationships: [
      {
        targetId: 'Order',
        type: 'places',
        strength: 0.85,
        bidirectional: false
      }
    ],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      version: '1.0.0',
      aliases: ['Customer']
    },
    tags: ['sales', 'external'],
    confidence: 0.85,
    isActive: true
  }
];

/**
 * Default export for convenience
 */
export default {
  ...CO2_CONSTANTS,
  EXAMPLE_CONCEPTS
};
