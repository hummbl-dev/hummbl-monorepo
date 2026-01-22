import { v4 as uuidv4 } from 'uuid';
import { 
  ModelBinding, 
  ComponentReference, 
  Constraint, 
  BindingPattern,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CreateBindingParams,
  ValidateBindingParams,
  SyntacticBindingModel,
  BindingType,
  ConstraintType,
  ConstraintSeverity,
} from './types';
import { CO1_CONSTANTS } from './constants';

/**
 * Creates a new Syntactic Binding model instance
 */
export const createSyntacticBindingModel = (): SyntacticBindingModel => {
  // Initialize storage for bindings and patterns
  const bindings = new Map<string, ModelBinding>();
  const patterns = new Map<string, BindingPattern>();
  
  // Register built-in patterns
  CO1_CONSTANTS.BUILTIN_PATTERNS.forEach(pattern => {
    patterns.set(pattern.id, pattern);
  });

  // Initialize with default configuration
  const config = {
    maxBindingsPerComponent: CO1_CONSTANTS.DEFAULTS.MAX_BINDINGS_PER_COMPONENT,
    defaultPriority: CO1_CONSTANTS.DEFAULTS.DEFAULT_PRIORITY,
    enableAutoValidation: CO1_CONSTANTS.DEFAULTS.ENABLE_AUTO_VALIDATION,
    strictMode: CO1_CONSTANTS.DEFAULTS.STRICT_MODE,
  };

  /**
   * Creates a new binding between components
   */
  const createBinding = (params: CreateBindingParams): ModelBinding => {
    const now = new Date();
    const binding: ModelBinding = {
      id: `bind-${uuidv4()}`,
      type: params.type,
      components: params.components.map(comp => {
        const { constraints, meta, ...rest } = comp;
        return {
          ...rest,
          constraints: constraints || [],
          meta: meta || {},
        } as ComponentReference;
      }),
      constraints: params.constraints || [],
      direction: params.direction || BindingDirection.UNIDIRECTIONAL,
      priority: params.priority ?? config.defaultPriority,
      isActive: true,
      tags: params.tags || [],
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        lastUpdatedBy: 'system',
        ...(params.meta || {}),
      },
    };

    // Auto-validate if enabled
    if (config.enableAutoValidation) {
      const validation = validateBinding({ binding });
      if (!validation.isValid && config.strictMode) {
        throw new Error(
          `Failed to create binding: ${validation.errors[0]?.message || 'Invalid binding'}`
        );
      }
    }

    // Store the binding
    bindings.set(binding.id, binding);
    return binding;
  };

  /**
   * Validates a binding against its constraints
   */
  const validateBinding = ({
    binding,
    includeSuggestions = true,
    includeWarnings = true,
    context = {},
  }: ValidateBindingParams): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Helper to add validation messages
    const addError = (code: string, message: string, path: string, fix?: any) => {
      errors.push({
        code,
        message,
        path,
        severity: 'error',
        ...(fix && { fix }),
      });
    };

    const addWarning = (code: string, message: string, path: string) => {
      if (includeWarnings) {
        warnings.push({
          code,
          message,
          path,
          severity: 'warning',
        });
      }
    };

    // Validate binding type
    if (!Object.values(BindingType).includes(binding.type as BindingType)) {
      addError(
        'INVALID_BINDING_TYPE',
        `Invalid binding type: ${binding.type}`,
        'type',
        {
          description: `Use one of: ${Object.values(BindingType).join(', ')}`,
          action: () => {
            // Auto-fix by setting to default type
            if ('type' in binding) {
              binding.type = BindingType.SEQUENTIAL;
            }
          },
        }
      );
    }

    // Validate components
    if (!binding.components || binding.components.length === 0) {
      addError('NO_COMPONENTS', 'At least one component is required', 'components');
    } else {
      // Check for duplicate component references
      const componentRefs = new Map<string, number>();
      binding.components.forEach((comp, index) => {
        const ref = `${comp.componentId}:${comp.role}`;
        componentRefs.set(ref, (componentRefs.get(ref) || 0) + 1);
        
        if (componentRefs.get(ref)! > 1) {
          addError(
            'DUPLICATE_COMPONENT',
            `Duplicate component reference: ${ref}`,
            `components[${index}]`
          );
        }
      });

      // Check component constraints
      binding.components.forEach((comp, compIndex) => {
        comp.constraints?.forEach((constraint, constrIndex) => {
          if (!Object.values(ConstraintType).includes(constraint.type as ConstraintType)) {
            addError(
              'INVALID_CONSTRAINT_TYPE',
              `Invalid constraint type: ${constraint.type}`,
              `components[${compIndex}].constraints[${constrIndex}].type`
            );
          }
        });
      });
    }

    // Validate direction
    if (!Object.values(BindingDirection).includes(binding.direction as BindingDirection)) {
      addError(
        'INVALID_DIRECTION',
        `Invalid direction: ${binding.direction}`,
        'direction',
        {
          description: `Use one of: ${Object.values(BindingDirection).join(', ')}`,
          action: () => {
            if ('direction' in binding) {
              binding.direction = BindingDirection.UNIDIRECTIONAL;
            }
          },
        }
      );
    }

    // Generate suggestions if requested
    if (includeSuggestions) {
      if (binding.components.length > 3) {
        suggestions.push(
          'Consider splitting large bindings into smaller, more focused ones for better maintainability.'
        );
      }

      if (binding.constraints.length === 0) {
        suggestions.push(
          'Add constraints to ensure the binding is used as intended.'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  };

  /**
   * Applies a binding to the system
   */
  const applyBinding = async (binding: ModelBinding): Promise<boolean> => {
    // Validate the binding first
    const validation = validateBinding({ binding });
    if (!validation.isValid) {
      console.warn('Cannot apply invalid binding:', validation.errors);
      return false;
    }

    // Check for conflicts with existing bindings
    const conflicts = findConflictingBindings(binding);
    if (conflicts.length > 0) {
      console.warn('Binding conflicts with existing bindings:', conflicts);
      return false;
    }

    // Store the binding
    bindings.set(binding.id, binding);
    return true;
  };

  /**
   * Removes a binding by ID
   */
  const removeBinding = (bindingId: string): boolean => {
    return bindings.delete(bindingId);
  };

  /**
   * Finds bindings that conflict with the given binding
   */
  const findConflictingBindings = (binding: ModelBinding): ModelBinding[] => {
    const conflicts: ModelBinding[] = [];
    
    for (const existingBinding of bindings.values()) {
      // Skip self-comparison
      if ('id' in binding && existingBinding.id === binding.id) {
        continue;
      }

      // Check for overlapping components with conflicting constraints
      const overlappingComponents = existingBinding.components.some(existingComp =>
        binding.components.some(newComp => 
          existingComp.componentId === newComp.componentId &&
          existingComp.role === newComp.role
        )
      );

      if (overlappingComponents) {
        conflicts.push(existingBinding);
      }
    }

    return conflicts;
  };

  /**
   * Registers a new binding pattern
   */
  const registerPattern = (pattern: Omit<BindingPattern, 'id'>): BindingPattern => {
    const now = new Date();
    const newPattern: BindingPattern = {
      ...pattern,
      id: `pattern-${uuidv4()}`,
      meta: {
        ...pattern.meta,
        createdAt: now,
        updatedAt: now,
        createdBy: pattern.meta?.createdBy || 'system',
        lastUpdatedBy: pattern.meta?.lastUpdatedBy || 'system',
      },
    };

    patterns.set(newPattern.id, newPattern);
    return newPattern;
  };

  /**
   * Gets a binding pattern by ID
   */
  const getPattern = (patternId: string): BindingPattern | null => {
    return patterns.get(patternId) || null;
  };

  /**
   * Lists all registered patterns, optionally filtered by tags
   */
  const listPatterns = ({ tags = [] } = {}): BindingPattern[] => {
    let result = Array.from(patterns.values());
    
    if (tags.length > 0) {
      result = result.filter(pattern => 
        tags.some(tag => pattern.tags.includes(tag))
      );
    }
    
    return result;
  };

  /**
   * Gets a binding by ID
   */
  const getBinding = (bindingId: string): ModelBinding | null => {
    return bindings.get(bindingId) || null;
  };

  /**
   * Lists all bindings, optionally filtered
   */
  const listBindings = ({ 
    type,
    tags = [],
    componentId,
  }: { 
    type?: BindingType; 
    tags?: string[]; 
    componentId?: string;
  } = {}): ModelBinding[] => {
    let result = Array.from(bindings.values());
    
    if (type) {
      result = result.filter(binding => binding.type === type);
    }
    
    if (tags.length > 0) {
      result = result.filter(binding => 
        tags.some(tag => binding.tags.includes(tag))
      );
    }
    
    if (componentId) {
      result = result.filter(binding =>
        binding.components.some(comp => comp.componentId === componentId)
      );
    }
    
    return result;
  };

  /**
   * Suggests possible bindings for the given components
   */
  const suggestBindings = (components: ComponentReference[]): ModelBinding[] => {
    const suggestions: ModelBinding[] = [];
    
    // Find matching patterns
    for (const pattern of patterns.values()) {
      // Simple matching based on component roles
      const requiredRoles = pattern.template.components
        .filter(comp => comp.isRequired)
        .map(comp => comp.role);
      
      const availableRoles = components.map(comp => comp.role);
      const hasRequiredRoles = requiredRoles.every(role => 
        availableRoles.includes(role)
      );
      
      if (hasRequiredRoles) {
        // Create a binding based on the pattern
        const binding = createBinding({
          ...pattern.template,
          components: components.filter(comp => 
            pattern.template.components.some(pComp => pComp.role === comp.role)
          ),
        });
        
        suggestions.push(binding);
      }
    }
    
    return suggestions;
  };

  /**
   * Optimizes a set of bindings by merging or simplifying them
   */
  const optimizeBindings = (bindingsToOptimize: ModelBinding[]): ModelBinding[] => {
    // Simple optimization: remove duplicate bindings
    const uniqueBindings = new Map<string, ModelBinding>();
    
    for (const binding of bindingsToOptimize) {
      const key = JSON.stringify({
        type: binding.type,
        components: binding.components.map(c => ({
          componentId: c.componentId,
          role: c.role,
        })),
        direction: binding.direction,
      });
      
      if (!uniqueBindings.has(key)) {
        uniqueBindings.set(key, binding);
      }
    }
    
    return Array.from(uniqueBindings.values());
  };

  // Return the model instance
  return {
    id: CO1_CONSTANTS.MODEL_CODE.toLowerCase(),
    name: CO1_CONSTANTS.MODEL_NAME,
    description: 'Defines a compositional grammar for model interlinkage',
    version: CO1_CONSTANTS.VERSION,
    
    // Core methods
    createBinding,
    validateBinding,
    applyBinding,
    removeBinding,
    
    // Pattern management
    registerPattern,
    getPattern,
    listPatterns,
    
    // Binding management
    getBinding,
    listBindings,
    
    // Utility methods
    suggestBindings,
    optimizeBindings,
    
    // Configuration
    config,
  };
};

// Convenience function for direct usage
export const createBinding = (params: CreateBindingParams): ModelBinding => {
  const model = createSyntacticBindingModel();
  return model.createBinding(params);
};

// Default export for easier imports
export default {
  createSyntacticBindingModel,
  createBinding,
  constants: CO1_CONSTANTS,
};

// Re-export types
export * from './types';

// Re-export constants
export * from './constants';
