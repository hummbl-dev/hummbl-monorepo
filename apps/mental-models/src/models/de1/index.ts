import { v4 as uuidv4 } from 'uuid';
import { 
  FunctionalComponent, 
  PartitioningStrategy, 
  PartitioningParams, 
  PartitioningResult,
  CohesionAnalysisParams,
  CohesionAnalysisResult,
  CouplingAnalysisParams,
  CouplingAnalysisResult,
  RefactoringOperation,
  FunctionalPartitioningModel,
  ValidationResult,
  ComponentDependency,
  ComponentInterface
} from './types';
import { 
  DE1_CONSTANTS, 
  EXAMPLE_COMPONENTS 
} from './constants';

type EventHandler = (data: any) => void | Promise<void>;
type EventType = 'componentAdded' | 'componentUpdated' | 'componentRemoved' | 
                 'beforePartition' | 'afterPartition' | 'refactoringSuggested';

/**
 * Creates a new Functional Partitioning model instance
 */
export const createFunctionalPartitioningModel = (
  config: Partial<FunctionalPartitioningModel['config']> = {}
): FunctionalPartitioningModel => {
  // Initialize state
  const components = new Map<string, FunctionalComponent>();
  const strategies = new Map<string, PartitioningStrategy>();
  const eventHandlers = new Map<EventType, Set<EventHandler>>();
  const cache = new Map<string, { data: any; expires: number }>();
  
  // Merge default config with provided config
  const modelConfig = { 
    ...DE1_CONSTANTS.DEFAULT_CONFIG, 
    ...config 
  };
  
  // Add default strategies
  DE1_CONSTANTS.DEFAULT_STRATEGIES.forEach(strategy => {
    addStrategy(strategy);
  });
  
  // Add example components if empty
  if (components.size === 0) {
    EXAMPLE_COMPONENTS.forEach(component => {
      addComponent(component);
    });
  }

  //#region Event Handling
  
  /**
   * Register an event handler
   */
  const on = (event: EventType, handler: EventHandler): void => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    eventHandlers.get(event)?.add(handler);
  };
  
  /**
   * Remove an event handler
   */
  const off = (event: EventType, handler: EventHandler): void => {
    eventHandlers.get(event)?.delete(handler);
  };
  
  /**
   * Emit an event
   */
  const emit = async (event: EventType, data: any = {}): Promise<void> => {
    const handlers = eventHandlers.get(event) || new Set();
    for (const handler of handlers) {
      try {
        await Promise.resolve(handler(data));
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  };
  
  //#endregion
  
  //#region Component Management
  
  /**
   * Add a new component to the model
   */
  const addComponent = (componentData: Omit<FunctionalComponent, 'id' | 'meta' | 'children'>): FunctionalComponent => {
    // Generate a unique ID
    const id = `comp_${uuidv4()}`;
    const now = new Date();
    
    // Create the component with metadata
    const component: FunctionalComponent = {
      ...componentData,
      id,
      children: [],
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        lastUpdatedBy: 'system',
        version: '1.0.0',
        tags: [],
        ...(componentData as any).meta // Allow overriding meta
      },
      // Ensure arrays are properly initialized
      inputs: [...(componentData.inputs || [])],
      outputs: [...(componentData.outputs || [])],
      dependencies: [...(componentData.dependencies || [])]
    };
    
    // Validate the component
    const validation = validateComponent(component);
    if (!validation.isValid) {
      throw new Error(
        `Invalid component: ${validation.errors.map(e => e.message).join('; ')}`
      );
    }
    
    // Add to parent's children if parentId is specified
    if (component.parentId) {
      const parent = components.get(component.parentId);
      if (parent) {
        parent.children.push(id);
      } else {
        throw new Error(`Parent component with ID ${component.parentId} not found`);
      }
    }
    
    // Add to storage
    components.set(id, component);
    
    // Clear relevant caches
    clearCache();
    
    // Emit event
    emit('componentAdded', { component });
    
    return { ...component };
  };
  
  /**
   * Get a component by ID
   */
  const getComponent = (id: string): FunctionalComponent | null => {
    const component = components.get(id);
    return component ? { ...component } : null;
  };
  
  /**
   * Update an existing component
   */
  const updateComponent = (id: string, updates: Partial<Omit<FunctionalComponent, 'id' | 'meta'>>): FunctionalComponent | null => {
    const existing = components.get(id);
    if (!existing) return null;
    
    // Handle parent changes
    if ('parentId' in updates && updates.parentId !== existing.parentId) {
      // Remove from old parent's children
      if (existing.parentId) {
        const oldParent = components.get(existing.parentId);
        if (oldParent) {
          oldParent.children = oldParent.children.filter(childId => childId !== id);
        }
      }
      
      // Add to new parent's children
      if (updates.parentId) {
        const newParent = components.get(updates.parentId);
        if (newParent) {
          newParent.children.push(id);
        } else {
          throw new Error(`New parent component with ID ${updates.parentId} not found`);
        }
      }
    }
    
    // Create updated component
    const updated: FunctionalComponent = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      meta: {
        ...existing.meta,
        updatedAt: new Date(),
        lastUpdatedBy: 'system',
        version: incrementVersion(existing.meta.version)
      },
      // Ensure arrays are properly merged
      children: [...(updates.children || existing.children)],
      inputs: updates.inputs !== undefined ? [...updates.inputs] : [...existing.inputs],
      outputs: updates.outputs !== undefined ? [...updates.outputs] : [...existing.outputs],
      dependencies: updates.dependencies !== undefined ? [...updates.dependencies] : [...existing.dependencies]
    };
    
    // Validate the updated component
    const validation = validateComponent(updated);
    if (!validation.isValid) {
      throw new Error(
        `Invalid component update: ${validation.errors.map(e => e.message).join('; ')}`
      );
    }
    
    // Update storage
    components.set(id, updated);
    
    // Clear relevant caches
    clearCache();
    
    // Emit event
    emit('componentUpdated', { previous: existing, updated });
    
    return { ...updated };
  };
  
  /**
   * Remove a component by ID
   */
  const removeComponent = (id: string): boolean => {
    const component = components.get(id);
    if (!component) return false;
    
    // Remove from parent's children
    if (component.parentId) {
      const parent = components.get(component.parentId);
      if (parent) {
        parent.children = parent.children.filter(childId => childId !== id);
      }
    }
    
    // Remove all children recursively
    const removeChildren = (childId: string) => {
      const child = components.get(childId);
      if (child) {
        // First remove all children
        child.children.forEach(grandChildId => removeChildren(grandChildId));
        
        // Then remove the child itself
        components.delete(childId);
        emit('componentRemoved', { component: child });
      }
    };
    
    // Remove all children
    component.children.forEach(childId => removeChildren(childId));
    
    // Remove the component
    components.delete(id);
    
    // Clear relevant caches
    clearCache();
    
    // Emit event
    emit('componentRemoved', { component });
    
    return true;
  };
  
  /**
   * Get the complete component hierarchy starting from the specified root
   */
  const getComponentHierarchy = (rootId?: string): FunctionalComponent[] => {
    const result: FunctionalComponent[] = [];
    
    // If no rootId is provided, find all root components (no parent)
    const rootComponents = rootId 
      ? [components.get(rootId)] 
      : Array.from(components.values()).filter(c => !c.parentId);
    
    // Recursively add components to the result
    const addToResult = (component: FunctionalComponent | undefined, level: number = 0) => {
      if (!component) return;
      
      // Add the component with its level
      result.push({
        ...component,
        meta: {
          ...component.meta,
          level // Add level for hierarchical display
        }
      });
      
      // Add children recursively
      component.children.forEach(childId => {
        const child = components.get(childId);
        addToResult(child, level + 1);
      });
    };
    
    // Start from root components
    rootComponents.forEach(comp => addToResult(comp));
    
    return result;
  };
  
  //#endregion
  
  //#region Partitioning Operations
  
  /**
   * Partition components based on the specified strategy
   */
  const partition = async (params: PartitioningParams): Promise<PartitioningResult> => {
    const startTime = Date.now();
    const { 
      componentIds, 
      strategyId = modelConfig.defaultStrategyId,
      criteria,
      weights,
      maxComponents = modelConfig.maxComponents,
      includeMetrics = true,
      options = {}
    } = params;
    
    // Validate input
    if (componentIds.length < 2) {
      throw new Error('At least two components are required for partitioning');
    }
    
    // Get the strategy
    const strategy = strategies.get(strategyId);
    if (!strategy) {
      throw new Error(DE1_CONSTANTS.ERRORS.STRATEGY_NOT_FOUND);
    }
    
    // Get all components
    const componentsToPartition = componentIds
      .map(id => components.get(id))
      .filter((c): c is FunctionalComponent => c !== undefined);
    
    if (componentsToPartition.length !== componentIds.length) {
      throw new Error('One or more components not found');
    }
    
    // Emit beforePartition event
    await emit('beforePartition', { 
      components: componentsToPartition, 
      strategy,
      params
    });
    
    // Use the specified criteria and weights, or fall back to strategy defaults
    const effectiveCriteria = criteria || strategy.criteria;
    const effectiveWeights = weights || strategy.weights;
    
    // Normalize weights to ensure they sum to 1
    const totalWeight = Object.values(effectiveWeights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = Object.fromEntries(
      Object.entries(effectiveWeights).map(([k, v]) => [k, v / totalWeight])
    );
    
    // Calculate similarity matrix
    const similarityMatrix = calculateSimilarityMatrix(componentsToPartition, effectiveCriteria, normalizedWeights);
    
    // Apply partitioning algorithm (e.g., hierarchical clustering, k-means, etc.)
    // This is a simplified implementation - in practice, you might use a more sophisticated algorithm
    const clusters = hierarchicalClustering(componentsToPartition, similarityMatrix, {
      maxClusters: maxComponents > 0 ? Math.min(maxComponents, componentsToPartition.length) : undefined,
      ...options
    });
    
    // Create new components for each cluster
    const resultComponents: FunctionalComponent[] = [];
    const componentMap = new Map<string, string>(); // oldId -> newId
    
    for (const [clusterIndex, cluster] of clusters.entries()) {
      if (cluster.length === 0) continue;
      
      // If it's a single component, use it as is
      if (cluster.length === 1) {
        const component = cluster[0];
        componentMap.set(component.id, component.id);
        resultComponents.push(component);
        continue;
      }
      
      // Create a new component for the cluster
      const newComponent: Omit<FunctionalComponent, 'id'> = {
        name: `cluster-${clusterIndex + 1}`,
        description: `Partitioned component containing: ${cluster.map(c => c.name).join(', ')}`,
        type: 'module',
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
          tags: ['partitioned', 'cluster'],
          originalComponents: cluster.map(c => c.id)
        }
      };
      
      // Add the new component
      const addedComponent = addComponent(newComponent);
      resultComponents.push(addedComponent);
      
      // Update the component map
      cluster.forEach(comp => {
        componentMap.set(comp.id, addedComponent.id);
      });
      
      // Move children under the new component
      for (const component of cluster) {
        // Skip if already processed (e.g., as part of a parent)
        if (components.has(component.id)) {
          updateComponent(component.id, { parentId: addedComponent.id });
        }
      }
    }
    
    // Update dependencies between clusters
    const updatedComponents = new Set<string>();
    
    for (const component of componentsToPartition) {
      const newComponentId = componentMap.get(component.id);
      if (!newComponentId || updatedComponents.has(newComponentId)) continue;
      
      const newComponent = components.get(newComponentId);
      if (!newComponent) continue;
      
      // Collect all dependencies from the original components in this cluster
      const clusterDependencies = cluster
        .filter(comp => componentMap.get(comp.id) === newComponentId)
        .flatMap(comp => 
          comp.dependencies
            .map(dep => ({
              ...dep,
              // Map target ID to new cluster if applicable
              targetId: componentMap.get(dep.targetId) || dep.targetId
            }))
            // Filter out self-dependencies and dependencies within the same cluster
            .filter(dep => 
              dep.targetId !== comp.id && 
              componentMap.get(dep.targetId) !== newComponentId
            )
        );
      
      // Merge similar dependencies
      const mergedDependencies = mergeDependencies(clusterDependencies);
      
      // Update the component with the merged dependencies
      updateComponent(newComponentId, { 
        dependencies: mergedDependencies 
      });
      
      updatedComponents.add(newComponentId);
    }
    
    // Calculate metrics if requested
    const metrics = includeMetrics 
      ? calculatePartitioningMetrics(resultComponents, componentsToPartition) 
      : {
          totalComponents: resultComponents.length,
          averageCohesion: 0,
          averageCoupling: 0,
          modularity: 0,
          executionTime: 0
        };
    
    // Create the result
    const result: PartitioningResult = {
      id: `partition_${Date.now()}`,
      strategyId: strategy.id,
      timestamp: new Date(),
      components: resultComponents,
      metrics: {
        ...metrics,
        executionTime: Date.now() - startTime
      },
      issues: [] // Would be populated with any issues found
    };
    
    // Emit afterPartition event
    await emit('afterPartition', { result });
    
    return result;
  };
  
  /**
   * Analyze cohesion of a component
   */
  const analyzeCohesion = async (params: CohesionAnalysisParams): Promise<CohesionAnalysisResult> => {
    const { componentId, depth = 1, includeMetrics = true } = params;
    
    // Get the component
    const component = components.get(componentId);
    if (!component) {
      throw new Error(DE1_CONSTANTS.ERRORS.COMPONENT_NOT_FOUND);
    }
    
    // Get all components in the hierarchy up to the specified depth
    const componentHierarchy = getComponentHierarchy(componentId);
    const allComponents = componentHierarchy.filter(c => 
      c.meta.level <= (componentHierarchy[0]?.meta.level || 0) + depth
    );
    
    // Calculate internal and external connections
    let internalConnections = 0;
    let externalConnections = 0;
    const componentIds = new Set(allComponents.map(c => c.id));
    
    for (const comp of allComponents) {
      // Count dependencies within the component hierarchy as internal
      const internalDeps = comp.dependencies.filter(dep => 
        componentIds.has(dep.targetId)
      ).length;
      
      // Count dependencies outside the component hierarchy as external
      const externalDeps = comp.dependencies.length - internalDeps;
      
      internalConnections += internalDeps;
      externalConnections += externalDeps;
    }
    
    // Calculate cohesion score (0-1)
    const totalConnections = internalConnections + externalConnections;
    const cohesionScore = totalConnections > 0 
      ? internalConnections / totalConnections 
      : 1; // Default to 1 if no connections
    
    // Generate issues and suggestions
    const issues: any[] = [];
    const suggestions: string[] = [];
    
    if (cohesionScore < 0.3) {
      issues.push({
        type: 'warning',
        message: 'Low cohesion detected',
        componentIds: [componentId],
        severity: 3
      });
      
      suggestions.push(
        'Consider splitting the component into smaller, more focused components',
        'Group related functionality together',
        'Review the Single Responsibility Principle for this component'
      );
    }
    
    return {
      componentId,
      cohesionScore,
      metrics: includeMetrics ? {
        internalConnections,
        externalConnections,
        totalConnections,
        cohesionRatio: cohesionScore
      } : {
        internalConnections: 0,
        externalConnections: 0,
        totalConnections: 0,
        cohesionRatio: 0
      },
      issues,
      suggestions
    };
  };
  
  /**
   * Analyze coupling between components
   */
  const analyzeCoupling = async (params: CouplingAnalysisParams): Promise<CouplingAnalysisResult> => {
    const { componentIds, includeMetrics = true } = params;
    
    // Get all components
    const componentsToAnalyze = componentIds
      .map(id => components.get(id))
      .filter((c): c is FunctionalComponent => c !== undefined);
    
    if (componentsToAnalyze.length !== componentIds.length) {
      throw new Error('One or more components not found');
    }
    
    // Initialize coupling matrix
    const couplingMatrix: Record<string, Record<string, { strength: number; type: string; description: string }>> = {};
    
    // Initialize matrix with zeros
    for (const comp1 of componentsToAnalyze) {
      if (!couplingMatrix[comp1.id]) {
        couplingMatrix[comp1.id] = {};
      }
      
      for (const comp2 of componentsToAnalyze) {
        if (comp1.id !== comp2.id) {
          couplingMatrix[comp1.id][comp2.id] = {
            strength: 0,
            type: 'none',
            description: 'No direct coupling'
          };
        }
      }
    }
    
    // Calculate coupling between components
    for (const source of componentsToAnalyze) {
      for (const dep of source.dependencies) {
        const targetId = dep.targetId;
        
        // Only consider dependencies between the selected components
        if (componentIds.includes(targetId) && targetId !== source.id) {
          // Simple strength calculation (could be more sophisticated)
          const strength = dep.strength === 'strong' ? 1.0 : 0.5;
          
          couplingMatrix[source.id][targetId] = {
            strength,
            type: dep.type,
            description: dep.description || `Dependency from ${source.name} to ${components.get(targetId)?.name || targetId}`
          };
        }
      }
    }
    
    // Calculate metrics if requested
    let metrics = {
      averageCoupling: 0,
      maxCoupling: 0,
      minCoupling: 0,
      highlyCoupledPairs: [] as Array<{ componentId1: string; componentId2: string; strength: number }>
    };
    
    if (includeMetrics) {
      let totalCoupling = 0;
      let count = 0;
      let maxCoupling = 0;
      let minCoupling = Number.MAX_SAFE_INTEGER;
      const couplingStrengths: Array<{ componentId1: string; componentId2: string; strength: number }> = [];
      
      for (const sourceId in couplingMatrix) {
        for (const targetId in couplingMatrix[sourceId]) {
          const { strength } = couplingMatrix[sourceId][targetId];
          totalCoupling += strength;
          count++;
          
          if (strength > maxCoupling) {
            maxCoupling = strength;
          }
          
          if (strength < minCoupling) {
            minCoupling = strength;
          }
          
          if (strength > 0) {
            couplingStrengths.push({
              componentId1: sourceId,
              componentId2: targetId,
              strength
            });
          }
        }
      }
      
      // Sort by strength (descending)
      couplingStrengths.sort((a, b) => b.strength - a.strength);
      
      metrics = {
        averageCoupling: count > 0 ? totalCoupling / count : 0,
        maxCoupling,
        minCoupling: minCoupling === Number.MAX_SAFE_INTEGER ? 0 : minCoupling,
        highlyCoupledPairs: couplingStrengths.slice(0, 5) // Top 5 most coupled pairs
      };
    }
    
    // Generate issues and suggestions
    const issues: any[] = [];
    const suggestions: string[] = [];
    
    // Check for highly coupled components
    const highlyCoupled = metrics.highlyCoupledPairs.filter(pair => pair.strength > 0.8);
    if (highlyCoupled.length > 0) {
      issues.push({
        type: 'warning',
        message: 'High coupling detected between components',
        componentIds: [
          ...new Set(highlyCoupled.flatMap(pair => [pair.componentId1, pair.componentId2]))
        ],
        severity: 3
      });
      
      suggestions.push(
        'Consider introducing an interface or facade between highly coupled components',
        'Evaluate if the components should be merged',
        'Use the Dependency Inversion Principle to reduce coupling'
      );
    }
    
    return {
      couplingMatrix,
      metrics,
      issues,
      suggestions
    };
  };
  
  /**
   * Suggest refactoring operations for a component
   */
  const suggestRefactoring = async (componentId: string): Promise<RefactoringOperation[]> => {
    const component = components.get(componentId);
    if (!component) {
      throw new Error(DE1_CONSTANTS.ERRORS.COMPONENT_NOT_FOUND);
    }
    
    const operations: RefactoringOperation[] = [];
    
    // Analyze cohesion
    const cohesion = await analyzeCohesion({ componentId });
    
    // If cohesion is low, suggest splitting the component
    if (cohesion.cohesionScore < 0.3) {
      operations.push({
        type: 'split',
        description: 'Split component into smaller, more cohesive units',
        componentIds: [componentId],
        parameters: {
          reason: `Low cohesion score: ${cohesion.cohesionScore.toFixed(2)}`,
          suggestedGroups: suggestComponentGroups(component)
        },
        effort: 3,
        impact: 4,
        priority: 2
      });
    }
    
    // Get all dependencies
    const allDependencies = component.dependencies;
    const dependentComponents = new Set<string>();
    
    // Find components that depend on this component
    for (const [id, comp] of components.entries()) {
      if (id !== componentId && comp.dependencies.some(dep => dep.targetId === componentId)) {
        dependentComponents.add(id);
      }
    }
    
    // If there are many dependencies, consider extracting an interface
    if (allDependencies.length > 5 || dependentComponents.size > 3) {
      operations.push({
        type: 'extract',
        description: 'Extract interface to reduce coupling',
        componentIds: [componentId, ...Array.from(dependentComponents)],
        parameters: {
          interfaceName: `I${component.name.charAt(0).toUpperCase() + component.name.slice(1)}`,
          methods: component.outputs.map(output => ({
            name: output.name,
            parameters: output.specification?.parameters || []
          }))
        },
        effort: 2,
        impact: 3,
        priority: 3
      });
    }
    
    // Check if this component has too many responsibilities
    const responsibilityCount = [
      ...component.inputs,
      ...component.outputs,
      ...component.dependencies
    ].length;
    
    if (responsibilityCount > 10) {
      operations.push({
        type: 'split',
        description: 'Component has too many responsibilities',
        componentIds: [componentId],
        parameters: {
          reason: `High number of responsibilities: ${responsibilityCount}`,
          suggestedGroups: suggestResponsibilityGroups(component)
        },
        effort: 4,
        impact: 5,
        priority: 1
      });
    }
    
    // Sort operations by priority (descending) and effort (ascending)
    operations.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.effort - b.effort;
    });
    
    // Emit event
    await emit('refactoringSuggested', { 
      componentId, 
      operations,
      metrics: {
        cohesionScore: cohesion.cohesionScore,
        responsibilityCount,
        dependencyCount: allDependencies.length,
        dependentComponentCount: dependentComponents.size
      }
    });
    
    return operations;
  };
  
  //#endregion
  
  //#region Strategy Management
  
  /**
   * Add a partitioning strategy
   */
  const addStrategy = (strategyData: Omit<PartitioningStrategy, 'id'>): PartitioningStrategy => {
    const id = `strategy_${uuidv4()}`;
    const now = new Date();
    
    const strategy: PartitioningStrategy = {
      ...strategyData,
      id,
      // Ensure criteria and weights are properly initialized
      criteria: [...(strategyData.criteria || [])],
      weights: { ...(strategyData.weights || {}) }
    };
    
    // If this is set as default, unset any existing default
    if (strategy.isDefault) {
      for (const existingStrategy of strategies.values()) {
        if (existingStrategy.id !== id && existingStrategy.isDefault) {
          strategies.set(existingStrategy.id, {
            ...existingStrategy,
            isDefault: false
          });
        }
      }
      
      // Update default strategy in config
      modelConfig.defaultStrategyId = id;
    }
    
    strategies.set(id, strategy);
    return { ...strategy };
  };
  
  /**
   * Get a strategy by ID
   */
  const getStrategy = (id: string): PartitioningStrategy | null => {
    const strategy = strategies.get(id);
    return strategy ? { ...strategy } : null;
  };
  
  /**
   * Update a strategy
   */
  const updateStrategy = (id: string, updates: Partial<PartitioningStrategy>): PartitioningStrategy | null => {
    const existing = strategies.get(id);
    if (!existing) return null;
    
    const updated: PartitioningStrategy = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      criteria: updates.criteria !== undefined ? [...updates.criteria] : [...existing.criteria],
      weights: updates.weights !== undefined ? { ...updates.weights } : { ...existing.weights }
    };
    
    // If this is set as default, unset any existing default
    if (updates.isDefault === true) {
      for (const [strategyId, strategy] of strategies.entries()) {
        if (strategyId !== id && strategy.isDefault) {
          strategies.set(strategyId, {
            ...strategy,
            isDefault: false
          });
        }
      }
      
      // Update default strategy in config
      modelConfig.defaultStrategyId = id;
    }
    
    strategies.set(id, updated);
    return { ...updated };
  };
  
  /**
   * Remove a strategy
   */
  const removeStrategy = (id: string): boolean => {
    // Don't allow removing the default strategy
    const strategy = strategies.get(id);
    if (strategy?.isDefault) {
      throw new Error('Cannot remove the default strategy');
    }
    
    return strategies.delete(id);
  };
  
  /**
   * List all available strategies
   */
  const listStrategies = (): PartitioningStrategy[] => {
    return Array.from(strategies.values()).map(s => ({ ...s }));
  };
  
  //#endregion
  
  //#region Utility Methods
  
  /**
   * Validate a component against the model's rules
   */
  const validateComponent = (component: FunctionalComponent): ValidationResult => {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Apply validation rules
    for (const ruleId of modelConfig.validationRules) {
      const rule = DE1_CONSTANTS.VALIDATION_RULES.find(r => r.id === ruleId);
      if (rule) {
        const ruleErrors = rule.validate(component, { 
          getComponent: (id: string) => components.get(id) 
        });
        
        for (const error of ruleErrors) {
          if (error.severity === 'error') {
            errors.push(error);
          } else if (error.severity === 'warning') {
            warnings.push(error);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  /**
   * Calculate the complexity of a component
   */
  const calculateComplexity = (component: FunctionalComponent): number => {
    // Simple complexity calculation based on:
    // - Number of inputs and outputs
    // - Number of dependencies
    // - Depth in the hierarchy
    // - Number of children
    
    const inputCount = component.inputs.length;
    const outputCount = component.outputs.length;
    const dependencyCount = component.dependencies.length;
    const childCount = component.children.length;
    
    // Calculate depth (number of ancestors)
    let depth = 0;
    let current = component.parentId ? components.get(component.parentId) : null;
    while (current) {
      depth++;
      current = current.parentId ? components.get(current.parentId) : null;
    }
    
    // Weighted sum of complexity factors
    const complexity = (
      (inputCount * 0.2) +
      (outputCount * 0.2) +
      (dependencyCount * 0.3) +
      (childCount * 0.2) +
      (depth * 0.1)
    );
    
    // Normalize to 0-1 range
    return Math.min(1, Math.max(0, complexity / 10));
  };
  
  //#endregion
  
  //#region Private Helper Methods
  
  /**
   * Calculate similarity matrix between components
   */
  const calculateSimilarityMatrix = (
    components: FunctionalComponent[],
    criteria: string[],
    weights: Record<string, number>
  ): number[][] => {
    const n = components.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    // Calculate similarity for each pair of components
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Perfect self-similarity
          continue;
        }
        
        const comp1 = components[i];
        const comp2 = components[j];
        
        // Calculate weighted similarity based on criteria
        let totalWeight = 0;
        let weightedSum = 0;
        
        for (const criterion of criteria) {
          const weight = weights[criterion] || 0;
          if (weight <= 0) continue;
          
          let similarity = 0;
          
          switch (criterion) {
            case 'cohesion':
              similarity = calculateCohesionSimilarity(comp1, comp2);
              break;
              
            case 'coupling':
              similarity = calculateCouplingSimilarity(comp1, comp2);
              break;
              
            case 'complexity':
              similarity = 1 - Math.abs(calculateComplexity(comp1) - calculateComplexity(comp2));
              break;
              
            case 'bounded-context':
              similarity = calculateBoundedContextSimilarity(comp1, comp2);
              break;
              
            case 'business-capability':
              similarity = calculateBusinessCapabilitySimilarity(comp1, comp2);
              break;
              
            case 'data-ownership':
              similarity = calculateDataOwnershipSimilarity(comp1, comp2);
              break;
              
            case 'functional-cohesion':
              similarity = calculateFunctionalCohesion(comp1, comp2);
              break;
              
            case 'team-structure':
              similarity = calculateTeamStructureSimilarity(comp1, comp2);
              break;
              
            case 'deployment-unit':
              similarity = calculateDeploymentUnitSimilarity(comp1, comp2);
              break;
              
            default:
              // Unknown criterion, skip
              continue;
          }
          
          weightedSum += similarity * weight;
          totalWeight += weight;
        }
        
        // Calculate weighted average
        const similarity = totalWeight > 0 ? weightedSum / totalWeight : 0;
        
        // Symmetric matrix
        matrix[i][j] = similarity;
        matrix[j][i] = similarity;
      }
    }
    
    return matrix;
  };
  
  /**
   * Hierarchical clustering algorithm
   */
  const hierarchicalClustering = (
    components: FunctionalComponent[],
    similarityMatrix: number[][],
    options: {
      maxClusters?: number;
      minSimilarity?: number;
      [key: string]: any;
    } = {}
  ): FunctionalComponent[][] => {
    const { maxClusters, minSimilarity = 0.3 } = options;
    const n = components.length;
    
    // Start with each component in its own cluster
    let clusters: number[][] = Array.from({ length: n }, (_, i) => [i]);
    
    // Continue until we reach the desired number of clusters or can't merge anymore
    while (clusters.length > 1) {
      // Check if we've reached the maximum number of clusters
      if (maxClusters !== undefined && clusters.length <= maxClusters) {
        break;
      }
      
      // Find the two most similar clusters
      let maxSimilarity = -1;
      let cluster1Idx = -1;
      let cluster2Idx = -1;
      
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          // Calculate average similarity between clusters
          let totalSimilarity = 0;
          let count = 0;
          
          for (const comp1 of clusters[i]) {
            for (const comp2 of clusters[j]) {
              totalSimilarity += similarityMatrix[comp1][comp2];
              count++;
            }
          }
          
          const avgSimilarity = count > 0 ? totalSimilarity / count : 0;
          
          if (avgSimilarity > maxSimilarity) {
            maxSimilarity = avgSimilarity;
            cluster1Idx = i;
            cluster2Idx = j;
          }
        }
      }
      
      // Stop if no similar clusters found
      if (maxSimilarity < minSimilarity) {
        break;
      }
      
      // Merge the two most similar clusters
      const newCluster = [...clusters[cluster1Idx], ...clusters[cluster2Idx]];
      
      // Remove the old clusters and add the new one
      clusters = clusters.filter((_, idx) => idx !== cluster1Idx && idx !== cluster2Idx);
      clusters.push(newCluster);
    }
    
    // Convert cluster indices back to components
    return clusters.map(clusterIndices => 
      clusterIndices.map(idx => components[idx])
    );
  };
  
  /**
   * Merge similar dependencies
   */
  const mergeDependencies = (dependencies: ComponentDependency[]): ComponentDependency[] => {
    const merged = new Map<string, ComponentDependency>();
    
    for (const dep of dependencies) {
      const key = `${dep.targetId}:${dep.type}:${dep.direction}`;
      
      if (merged.has(key)) {
        // Update existing dependency
        const existing = merged.get(key)!;
        
        // Update strength to the maximum
        if (dep.strength === 'strong' && existing.strength === 'weak') {
          existing.strength = 'strong';
        }
        
        // Merge descriptions
        if (dep.description && !existing.description.includes(dep.description)) {
          existing.description = `${existing.description}; ${dep.description}`;
        }
        
        // Merge metadata
        existing.meta = { ...existing.meta, ...dep.meta };
      } else {
        // Add new dependency
        merged.set(key, { ...dep });
      }
    }
    
    return Array.from(merged.values());
  };
  
  /**
   * Calculate partitioning metrics
   */
  const calculatePartitioningMetrics = (
    resultComponents: FunctionalComponent[],
    originalComponents: FunctionalComponent[]
  ) => {
    // Calculate average cohesion within clusters
    let totalCohesion = 0;
    let totalCoupling = 0;
    
    for (const component of resultComponents) {
      const cohesion = calculateCohesionForComponent(component);
      totalCohesion += cohesion;
      
      // Calculate coupling to other components
      const dependencies = component.dependencies || [];
      const externalDeps = dependencies.filter(dep => 
        !component.meta.originalComponents?.includes(dep.targetId)
      );
      
      totalCoupling += externalDeps.length;
    }
    
    const avgCohesion = resultComponents.length > 0 
      ? totalCohesion / resultComponents.length 
      : 0;
      
    const avgCoupling = resultComponents.length > 0 
      ? totalCoupling / resultComponents.length 
      : 0;
    
    // Calculate modularity (higher is better)
    const modularity = Math.max(0, avgCohesion * (1 - avgCoupling));
    
    return {
      totalComponents: resultComponents.length,
      averageCohesion: parseFloat(avgCohesion.toFixed(4)),
      averageCoupling: parseFloat(avgCoupling.toFixed(4)),
      modularity: parseFloat(modularity.toFixed(4))
    };
  };
  
  /**
   * Calculate cohesion for a single component
   */
  const calculateCohesionForComponent = (component: FunctionalComponent): number => {
    // Simple cohesion calculation based on:
    // - Number of internal connections
    // - Number of external connections
    
    const internalConnections = component.dependencies.filter(dep => 
      component.meta.originalComponents?.includes(dep.targetId)
    ).length;
    
    const externalConnections = component.dependencies.length - internalConnections;
    const totalConnections = internalConnections + externalConnections;
    
    return totalConnections > 0 ? internalConnections / totalConnections : 1;
  };
  
  /**
   * Suggest component groups for splitting
   */
  const suggestComponentGroups = (component: FunctionalComponent): string[][] => {
    // This is a simplified implementation
    // In a real system, you might use more sophisticated clustering
    
    const groups: string[][] = [];
    
    // Group by input types
    const inputGroups = new Map<string, string[]>();
    for (const input of component.inputs) {
      const type = input.type;
      if (!inputGroups.has(type)) {
        inputGroups.set(type, []);
      }
      inputGroups.get(type)!.push(`input:${input.name}`);
    }
    
    // Group by output types
    const outputGroups = new Map<string, string[]>();
    for (const output of component.outputs) {
      const type = output.type;
      if (!outputGroups.has(type)) {
        outputGroups.set(type, []);
      }
      outputGroups.get(type)!.push(`output:${output.name}`);
    }
    
    // Add input-based groups
    for (const [type, items] of inputGroups.entries()) {
      if (items.length > 1) {
        groups.push([...items, `group:${type}-handlers`]);
      }
    }
    
    // Add output-based groups
    for (const [type, items] of outputGroups.entries()) {
      if (items.length > 1) {
        groups.push([...items, `group:${type}-publishers`]);
      }
    }
    
    // If no specific groups found, suggest splitting by functionality
    if (groups.length === 0) {
      groups.push(
        ['input:*', 'core-logic', 'group:core-module'],
        ['output:*', 'group:interface-module']
      );
    }
    
    return groups;
  };
  
  /**
   * Suggest responsibility groups for a component
   */
  const suggestResponsibilityGroups = (component: FunctionalComponent): string[][] => {
    // This is a simplified implementation
    const groups: string[][] = [];
    
    // Group by responsibility type
    const responsibilityGroups: Record<string, string[]> = {
      input: [],
      output: [],
      storage: [],
      businessLogic: [],
      integration: []
    };
    
    // Categorize inputs
    for (const input of component.inputs) {
      if (input.type === 'REST' || input.type === 'GraphQL') {
        responsibilityGroups.input.push(`api:${input.name}`);
      } else if (input.type === 'Event' || input.type === 'Queue') {
        responsibilityGroups.integration.push(`event:${input.name}`);
      }
    }
    
    // Categorize outputs
    for (const output of component.outputs) {
      if (output.type === 'REST' || output.type === 'GraphQL') {
        responsibilityGroups.output.push(`api:${output.name}`);
      } else if (output.type === 'Event' || output.type === 'Queue') {
        responsibilityGroups.integration.push(`event:${output.name}`);
      } else if (output.type === 'Database') {
        responsibilityGroups.storage.push(`storage:${output.name}`);
      }
    }
    
    // Categorize dependencies
    for (const dep of component.dependencies) {
      if (dep.type.includes('Database') || dep.type.includes('Storage')) {
        responsibilityGroups.storage.push(`dep:${dep.targetId}`);
      } else if (dep.type.includes('Service') || dep.type.includes('API')) {
        responsibilityGroups.integration.push(`dep:${dep.targetId}`);
      }
    }
    
    // Add non-empty groups
    for (const [category, items] of Object.entries(responsibilityGroups)) {
      if (items.length > 0) {
        groups.push([...items, `group:${category}`]);
      }
    }
    
    return groups;
  };
  
  // Similarity calculation helpers
  
  const calculateCohesionSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Similarity based on shared inputs/outputs
    const sharedInputs = comp1.inputs.filter(i1 => 
      comp2.inputs.some(i2 => i1.type === i2.type)
    ).length;
    
    const sharedOutputs = comp1.outputs.filter(o1 => 
      comp2.outputs.some(o2 => o1.type === o2.type)
    ).length;
    
    const totalInputs = new Set([...comp1.inputs, ...comp2.inputs]).size;
    const totalOutputs = new Set([...comp1.outputs, ...comp2.outputs]).size;
    
    const inputSimilarity = totalInputs > 0 ? sharedInputs / totalInputs : 0;
    const outputSimilarity = totalOutputs > 0 ? sharedOutputs / totalOutputs : 0;
    
    return (inputSimilarity + outputSimilarity) / 2;
  };
  
  const calculateCouplingSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Check if components are directly coupled
    const comp1DependsOnComp2 = comp1.dependencies.some(dep => dep.targetId === comp2.id);
    const comp2DependsOnComp1 = comp2.dependencies.some(dep => dep.targetId === comp1.id);
    
    if (comp1DependsOnComp2 && comp2DependsOnComp1) {
      return 1.0; // Strong bidirectional coupling
    } else if (comp1DependsOnComp2 || comp2DependsOnComp1) {
      return 0.7; // Unidirectional coupling
    }
    
    // Check if components share dependencies
    const comp1Deps = new Set(comp1.dependencies.map(d => d.targetId));
    const comp2Deps = new Set(comp2.dependencies.map(d => d.targetId));
    
    const sharedDeps = new Set([...comp1Deps].filter(x => comp2Deps.has(x)));
    const totalDeps = new Set([...comp1Deps, ...comp2Deps]);
    
    return totalDeps.size > 0 ? sharedDeps.size / totalDeps.size : 0;
  };
  
  const calculateBoundedContextSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Check if components share the same domain or context
    const tags1 = new Set(comp1.meta.tags || []);
    const tags2 = new Set(comp2.meta.tags || []);
    
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    const union = new Set([...tags1, ...tags2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  };
  
  const calculateBusinessCapabilitySimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // This is a simplified implementation
    // In a real system, you might have explicit business capability mappings
    const name1 = comp1.name.toLowerCase();
    const name2 = comp2.name.toLowerCase();
    
    // Check for common business capability indicators
    const capabilities = ['user', 'order', 'payment', 'inventory', 'reporting', 'notification'];
    
    for (const cap of capabilities) {
      if (name1.includes(cap) && name2.includes(cap)) {
        return 0.8; // High similarity if they share the same capability
      }
    }
    
    return 0.2; // Low similarity by default
  };
  
  const calculateDataOwnershipSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Check if components operate on the same data
    const dataEntities1 = extractDataEntities(comp1);
    const dataEntities2 = extractDataEntities(comp2);
    
    if (dataEntities1.size === 0 && dataEntities2.size === 0) {
      return 0; // No data entities to compare
    }
    
    const intersection = new Set([...dataEntities1].filter(x => dataEntities2.has(x)));
    const union = new Set([...dataEntities1, ...dataEntities2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  };
  
  const calculateFunctionalCohesion = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Similar to cohesion similarity but more focused on functional aspects
    const func1 = extractFunctionality(comp1);
    const func2 = extractFunctionality(comp2);
    
    if (func1.size === 0 && func2.size === 0) {
      return 0; // No functionality to compare
    }
    
    const intersection = new Set([...func1].filter(x => func2.has(x)));
    const union = new Set([...func1, ...func2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  };
  
  const calculateTeamStructureSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Check if components are owned by the same team
    const team1 = comp1.meta.team || 'default';
    const team2 = comp2.meta.team || 'default';
    
    return team1 === team2 ? 0.9 : 0.1;
  };
  
  const calculateDeploymentUnitSimilarity = (comp1: FunctionalComponent, comp2: FunctionalComponent): number => {
    // Check if components are deployed together
    const unit1 = comp1.meta.deploymentUnit || 'default';
    const unit2 = comp2.meta.deploymentUnit || 'default';
    
    return unit1 === unit2 ? 0.8 : 0.2;
  };
  
  // Helper functions for similarity calculations
  
  const extractDataEntities = (component: FunctionalComponent): Set<string> => {
    const entities = new Set<string>();
    
    // Extract from component name
    const name = component.name.toLowerCase();
    if (name.includes('user')) entities.add('user');
    if (name.includes('order')) entities.add('order');
    if (name.includes('product')) entities.add('product');
    // Add more patterns as needed
    
    // Extract from inputs/outputs
    for (const io of [...component.inputs, ...component.outputs]) {
      if (io.specification?.schema?.$ref) {
        const ref = io.specification.schema.$ref;
        if (ref.includes('User')) entities.add('user');
        if (ref.includes('Order')) entities.add('order');
        if (ref.includes('Product')) entities.add('product');
        // Add more patterns as needed
      }
    }
    
    return entities;
  };
  
  const extractFunctionality = (component: FunctionalComponent): Set<string> => {
    const funcs = new Set<string>();
    
    // Extract from component name and description
    const text = `${component.name} ${component.description}`.toLowerCase();
    
    if (text.includes('create') || text.includes('add')) funcs.add('create');
    if (text.includes('read') || text.includes('get') || text.includes('fetch')) funcs.add('read');
    if (text.includes('update') || text.includes('modify')) funcs.add('update');
    if (text.includes('delete') || text.includes('remove')) funcs.add('delete');
    if (text.includes('validate') || text.includes('check')) funcs.add('validate');
    if (text.includes('transform') || text.includes('convert')) funcs.add('transform');
    
    // Extract from inputs/outputs
    for (const io of [...component.inputs, ...component.outputs]) {
      if (io.type === 'REST' || io.type === 'GraphQL') {
        const methods = io.specification?.paths ? Object.values(io.specification.paths).flatMap((p: any) => Object.keys(p)) : [];
        methods.forEach((method: string) => funcs.add(method.toLowerCase()));
      }
    }
    
    return funcs;
  };
  
  /**
   * Clear cached data
   */
  const clearCache = (prefix?: string): void => {
    if (prefix) {
      // Clear only entries with the specified prefix
      for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
          cache.delete(key);
        }
      }
    } else {
      // Clear all cached data
      cache.clear();
    }
  };
  
  /**
   * Increment a semantic version string
   */
  const incrementVersion = (version: string): string => {
    const parts = version.split('.').map(Number);
    
    // Simple increment of patch version
    parts[2] = (parts[2] || 0) + 1;
    
    return parts.join('.');
  };
  
  //#endregion
  
  // Return the model instance
  return {
    // Core properties
    id: DE1_CONSTANTS.MODEL_ID,
    name: DE1_CONSTANTS.MODEL_NAME,
    description: DE1_CONSTANTS.MODEL_DESCRIPTION,
    version: DE1_CONSTANTS.VERSION,
    
    // Configuration
    config: {
      defaultStrategyId: modelConfig.defaultStrategyId,
      maxComponents: modelConfig.maxComponents,
      enableAutoRefactoring: modelConfig.enableAutoRefactoring,
      validationRules: [...modelConfig.validationRules],
      enableCaching: modelConfig.enableCaching,
      cacheTTL: modelConfig.cacheTTL
    },
    
    // Component management
    addComponent,
    getComponent,
    updateComponent,
    removeComponent,
    getComponentHierarchy,
    
    // Partitioning operations
    partition,
    analyzeCohesion,
    analyzeCoupling,
    suggestRefactoring,
    
    // Strategy management
    addStrategy,
    getStrategy,
    updateStrategy,
    removeStrategy,
    listStrategies,
    
    // Utility methods
    validateComponent,
    calculateComplexity,
    
    // Event handling
    on,
    off
  };
};

// Convenience function for direct usage
export const partitionComponents = async (params: any): Promise<any> => {
  const model = createFunctionalPartitioningModel();
  return model.partition(params);
};

// Default export for easier imports
export default {
  createFunctionalPartitioningModel,
  partitionComponents,
  constants: DE1_CONSTANTS,
  types: {
    FunctionalComponent: {} as FunctionalComponent,
    PartitioningStrategy: {} as PartitioningStrategy,
    PartitioningResult: {} as any,
    CohesionAnalysisResult: {} as any,
    CouplingAnalysisResult: {} as any,
    RefactoringOperation: {} as any
  }
};

// Re-export types
export * from './types';

// Re-export constants
export * from './constants';
