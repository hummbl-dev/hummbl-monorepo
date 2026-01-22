import { v4 as uuidv4 } from 'uuid';
import { 
  Concept, 
  Conflict, 
  Fusion, 
  TransformationRule, 
  ConceptualFusionModel,
  FuseConceptsParams, 
  FusionResult,
  FindSimilarConceptsParams,
  SimilarityResult,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './types';
import { 
  CO2_CONSTANTS, 
  EXAMPLE_CONCEPTS 
} from './constants';

type EventHandler = (data: any) => void | Promise<void>;
type EventType = 'beforeFusion' | 'afterFusion' | 'conflictDetected' | 'conceptAdded' | 'conceptUpdated' | 'conceptRemoved';

/**
 * Creates a new Conceptual Fusion model instance
 */
export const createConceptualFusionModel = (config: Partial<ConceptualFusionModel['config']> = {}): ConceptualFusionModel => {
  // Initialize state
  const concepts = new Map<string, Concept>();
  const fusions = new Map<string, Fusion>();
  const rules = new Map<string, TransformationRule>();
  const eventHandlers = new Map<EventType, Set<EventHandler>>();
  
  // Merge default config with provided config
  const modelConfig = { 
    ...CO2_CONSTANTS.DEFAULT_CONFIG, 
    ...config 
  };
  
  // Add default rules
  CO2_CONSTANTS.DEFAULT_RULES.forEach(rule => {
    addRule(rule);
  });
  
  // Add example concepts if empty
  if (concepts.size === 0) {
    EXAMPLE_CONCEPTS.forEach(concept => {
      addConcept(concept);
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
  
  //#region Concept Management
  
  /**
   * Add a new concept to the model
   */
  const addConcept = (conceptData: Omit<Concept, 'id' | 'meta'>): Concept => {
    // Generate a unique ID
    const id = `concept_${uuidv4()}`;
    const now = new Date();
    
    // Create the concept with metadata
    const concept: Concept = {
      ...conceptData,
      id,
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        lastUpdatedBy: 'system',
        version: '1.0.0',
        ...(conceptData as any).meta // Allow overriding meta
      },
      // Ensure required arrays are initialized
      sourceModels: [...(conceptData.sourceModels || [])],
      properties: { ...(conceptData.properties || {}) },
      relationships: [...(conceptData.relationships || [])],
      tags: [...(conceptData.tags || [])]
    };
    
    // Validate the concept
    const validation = validateConcept(concept);
    if (!validation.isValid) {
      throw new Error(
        `Invalid concept: ${validation.errors.map(e => e.message).join('; ')}`
      );
    }
    
    // Add to storage
    concepts.set(id, concept);
    
    // Emit event
    emit('conceptAdded', { concept });
    
    return { ...concept };
  };
  
  /**
   * Get a concept by ID
   */
  const getConcept = (id: string): Concept | null => {
    const concept = concepts.get(id);
    return concept ? { ...concept } : null;
  };
  
  /**
   * Update an existing concept
   */
  const updateConcept = (id: string, updates: Partial<Omit<Concept, 'id' | 'meta'>>): Concept | null => {
    const existing = concepts.get(id);
    if (!existing) return null;
    
    // Create updated concept
    const updated: Concept = {
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
      sourceModels: updates.sourceModels !== undefined 
        ? [...updates.sourceModels] 
        : [...existing.sourceModels],
      properties: updates.properties !== undefined 
        ? { ...updates.properties } 
        : { ...existing.properties },
      relationships: updates.relationships !== undefined 
        ? [...updates.relationships] 
        : [...existing.relationships],
      tags: updates.tags !== undefined 
        ? [...updates.tags] 
        : [...existing.tags]
    };
    
    // Validate the updated concept
    const validation = validateConcept(updated);
    if (!validation.isValid) {
      throw new Error(
        `Invalid concept update: ${validation.errors.map(e => e.message).join('; ')}`
      );
    }
    
    // Update storage
    concepts.set(id, updated);
    
    // Emit event
    emit('conceptUpdated', { previous: existing, updated });
    
    return { ...updated };
  };
  
  /**
   * Remove a concept by ID
   */
  const removeConcept = (id: string): boolean => {
    const concept = concepts.get(id);
    if (!concept) return false;
    
    // Remove concept
    concepts.delete(id);
    
    // Remove any fusions involving this concept
    for (const [fusionId, fusion] of fusions.entries()) {
      if (fusion.sourceIds.includes(id) || fusion.resultId === id) {
        fusions.delete(fusionId);
      }
    }
    
    // Emit event
    emit('conceptRemoved', { concept });
    
    return true;
  };
  
  //#endregion
  
  //#region Fusion Operations
  
  /**
   * Fuse multiple concepts into a single unified concept
   */
  const fuseConcepts = async (params: FuseConceptsParams): Promise<FusionResult> => {
    const startTime = Date.now();
    const { conceptIds, strategy = modelConfig.defaultFusionStrategy, autoResolve = true, context = {} } = params;
    
    // Validate input
    if (conceptIds.length < 2) {
      throw new Error('At least two concepts are required for fusion');
    }
    
    if (conceptIds.length > modelConfig.maxConceptsToFuse) {
      throw new Error(CO2_CONSTANTS.ERRORS.MAX_CONCEPTS_EXCEEDED);
    }
    
    // Get all concepts
    const conceptsToFuse = conceptIds
      .map(id => getConcept(id))
      .filter((c): c is Concept => c !== null);
    
    if (conceptsToFuse.length !== conceptIds.length) {
      throw new Error('One or more concepts not found');
    }
    
    // Emit beforeFusion event
    await emit('beforeFusion', { concepts: conceptsToFuse, strategy, context });
    
    // Detect conflicts
    const conflicts = detectConflicts(conceptIds);
    
    // Auto-resolve conflicts if enabled
    const resolvedConflicts: Conflict[] = [];
    const unresolvedConflicts: Conflict[] = [];
    
    if (autoResolve) {
      for (const conflict of conflicts) {
        const resolved = await autoResolveConflict(conflict, conceptsToFuse, strategy, context);
        if (resolved) {
          resolvedConflicts.push({
            ...conflict,
            status: 'resolved',
            resolution: {
              method: 'auto',
              description: 'Automatically resolved by the system',
              resolvedBy: 'system',
              resolvedAt: new Date()
            }
          });
        } else {
          unresolvedConflicts.push(conflict);
        }
      }
    } else {
      unresolvedConflicts.push(...conflicts);
    }
    
    // Create fused concept
    const fusedConcept = createFusedConcept(conceptsToFuse, strategy, context);
    
    // Add the fused concept
    const resultConcept = addConcept(fusedConcept);
    
    // Record the fusion
    const fusionId = `fusion_${uuidv4()}`;
    const fusion: Fusion = {
      sourceIds: conceptIds,
      resultId: resultConcept.id,
      method: strategy,
      confidence: calculateFusionConfidence(conceptsToFuse, resolvedConflicts, unresolvedConflicts),
      resolvedConflicts: resolvedConflicts.map(c => c.id || ''),
      meta: {
        fusedAt: new Date(),
        fusedBy: 'system',
        context
      }
    };
    fusions.set(fusionId, fusion);
    
    // Calculate metrics
    const metrics = {
      inputConcepts: conceptsToFuse.length,
      propertiesMerged: Object.keys(resultConcept.properties).length,
      conflictsResolved: resolvedConflicts.length,
      conflictsRemaining: unresolvedConflicts.length,
      fusionTime: Date.now() - startTime
    };
    
    // Create result
    const result: FusionResult = {
      result: resultConcept,
      resolvedConflicts,
      unresolvedConflicts,
      metrics
    };
    
    // Emit afterFusion event
    await emit('afterFusion', { result });
    
    return result;
  };
  
  /**
   * Find concepts similar to a given concept
   */
  const findSimilarConcepts = async (params: FindSimilarConceptsParams): Promise<SimilarityResult[]> => {
    const { conceptId, threshold = modelConfig.defaultSimilarityThreshold, limit = 10, fields } = params;
    
    const targetConcept = getConcept(conceptId);
    if (!targetConcept) {
      throw new Error(CO2_CONSTANTS.ERRORS.CONCEPT_NOT_FOUND);
    }
    
    // Get all concepts except the target
    const otherConcepts = Array.from(concepts.values())
      .filter(c => c.id !== conceptId);
    
    // Calculate similarity scores
    const results: SimilarityResult[] = [];
    
    for (const concept of otherConcepts) {
      const similarity = calculateSimilarity(targetConcept, concept, fields);
      
      if (similarity.score >= threshold) {
        results.push({
          concept,
          score: similarity.score,
          breakdown: similarity.breakdown
        });
      }
    }
    
    // Sort by score (descending) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };
  
  //#endregion
  
  //#region Conflict Management
  
  /**
   * Detect conflicts between concepts
   */
  const detectConflicts = (conceptIds: string[]): Conflict[] => {
    const conflicts: Conflict[] = [];
    const conceptsList = conceptIds
      .map(id => getConcept(id))
      .filter((c): c is Concept => c !== null);
    
    // Check for naming conflicts
    const nameCounts = new Map<string, string[]>();
    conceptsList.forEach(concept => {
      const name = concept.name.toLowerCase();
      if (!nameCounts.has(name)) {
        nameCounts.set(name, []);
      }
      nameCounts.get(name)?.push(concept.id);
    });
    
    for (const [name, ids] of nameCounts.entries()) {
      if (ids.length > 1) {
        conflicts.push(createConflict(
          'naming',
          `Multiple concepts have the same name: ${name}`,
          'medium',
          conceptsList.filter(c => ids.includes(c.id)).map(c => c.sourceModels).flat(),
          ids.map(id => ({
            type: 'concept',
            id,
            value: getConcept(id)?.name
          }))
        ));
      }
    }
    
    // Check for property conflicts
    const propertyConflicts = new Map<string, {
      conceptIds: string[];
      values: Set<any>;
      sources: Set<string>;
    }>();
    
    // Group properties by name
    conceptsList.forEach(concept => {
      Object.entries(concept.properties).forEach(([propName, prop]) => {
        const key = `${concept.id}.${propName}`;
        if (!propertyConflicts.has(key)) {
          propertyConflicts.set(key, {
            conceptIds: [],
            values: new Set(),
            sources: new Set()
          });
        }
        
        const conflict = propertyConflicts.get(key)!;
        conflict.conceptIds.push(concept.id);
        conflict.values.add(prop.value);
        prop.sources.forEach(s => conflict.sources.add(s));
      });
    });
    
    // Create conflicts for properties with different values
    for (const [key, data] of propertyConflicts.entries()) {
      if (data.values.size > 1) {
        const [conceptId, propName] = key.split('.');
        conflicts.push(createConflict(
          'property',
          `Property '${propName}' has different values across concepts`,
          'high',
          Array.from(data.sources),
          data.conceptIds.map(id => ({
            type: 'property',
            id: `${id}.${propName}`,
            value: getConcept(id)?.properties[propName]?.value
          }))
        ));
      }
    }
    
    // Check for relationship conflicts
    const relationshipConflicts = new Map<string, {
      sourceId: string;
      targetId: string;
      types: Map<string, number>;
      conceptIds: string[];
    }>();
    
    conceptsList.forEach(concept => {
      concept.relationships.forEach(rel => {
        const key = `${concept.id}-${rel.targetId}`;
        if (!relationshipConflicts.has(key)) {
          relationshipConflicts.set(key, {
            sourceId: concept.id,
            targetId: rel.targetId,
            types: new Map(),
            conceptIds: []
          });
        }
        
        const conflict = relationshipConflicts.get(key)!;
        const count = conflict.types.get(rel.type) || 0;
        conflict.types.set(rel.type, count + 1);
        conflict.conceptIds.push(concept.id);
      });
    });
    
    // Create conflicts for relationships with multiple types
    for (const conflict of relationshipConflicts.values()) {
      if (conflict.types.size > 1) {
        conflicts.push(createConflict(
          'relationship',
          `Multiple relationship types between ${conflict.sourceId} and ${conflict.targetId}`,
          'medium',
          [], // TODO: Add proper sources
          Array.from(conflict.types.entries()).map(([type, count]) => ({
            type: 'relationship',
            id: `${conflict.sourceId}-${conflict.targetId}`,
            value: type
          }))
        ));
      }
    }
    
    return conflicts;
  };
  
  /**
   * Resolve a conflict
   */
  const resolveConflict = (conflictId: string, resolution: any): boolean => {
    // Implementation depends on conflict type and resolution strategy
    // This is a simplified version
    return false;
  };
  
  //#endregion
  
  //#region Rule Management
  
  /**
   * Add a transformation rule
   */
  const addRule = (ruleData: Omit<TransformationRule, 'id' | 'meta'>): TransformationRule => {
    const id = `rule_${uuidv4()}`;
    const now = new Date();
    
    const rule: TransformationRule = {
      ...ruleData,
      id,
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        lastUpdatedBy: 'system'
      }
    };
    
    rules.set(id, rule);
    return { ...rule };
  };
  
  /**
   * Get a rule by ID
   */
  const getRule = (id: string): TransformationRule | null => {
    const rule = rules.get(id);
    return rule ? { ...rule } : null;
  };
  
  /**
   * Update a rule
   */
  const updateRule = (id: string, updates: Partial<Omit<TransformationRule, 'id' | 'meta'>>): TransformationRule | null => {
    const existing = rules.get(id);
    if (!existing) return null;
    
    const updated: TransformationRule = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      meta: {
        ...existing.meta,
        updatedAt: new Date(),
        lastUpdatedBy: 'system'
      }
    };
    
    rules.set(id, updated);
    return { ...updated };
  };
  
  /**
   * Remove a rule by ID
   */
  const removeRule = (id: string): boolean => {
    return rules.delete(id);
  };
  
  //#endregion
  
  //#region Utility Methods
  
  /**
   * Calculate similarity between two concepts
   */
  const calculateSimilarity = (
    concept1: Concept, 
    concept2: Concept,
    fields?: ('name' | 'description' | 'properties' | 'relationships')[]
  ): { score: number; breakdown: Array<{ field: string; score: number; weight: number }> } => {
    const fieldsToCheck = fields || ['name', 'description', 'properties', 'relationships'];
    const weights = CO2_CONSTANTS.SIMILARITY_WEIGHTS;
    
    let totalScore = 0;
    let totalWeight = 0;
    const breakdown: Array<{ field: string; score: number; weight: number }> = [];
    
    // Name similarity
    if (fieldsToCheck.includes('name')) {
      const score = stringSimilarity(concept1.name, concept2.name);
      const weight = weights.name;
      totalScore += score * weight;
      totalWeight += weight;
      breakdown.push({ field: 'name', score, weight });
    }
    
    // Description similarity
    if (fieldsToCheck.includes('description')) {
      const score = stringSimilarity(concept1.description, concept2.description);
      const weight = weights.description;
      totalScore += score * weight;
      totalWeight += weight;
      breakdown.push({ field: 'description', score, weight });
    }
    
    // Properties similarity
    if (fieldsToCheck.includes('properties')) {
      const props1 = Object.keys(concept1.properties);
      const props2 = Object.keys(concept2.properties);
      
      if (props1.length > 0 || props2.length > 0) {
        const commonProps = props1.filter(p => props2.includes(p));
        const unionProps = new Set([...props1, ...props2]);
        
        // Jaccard similarity for property names
        const propNameSimilarity = unionProps.size > 0 
          ? commonProps.length / unionProps.size 
          : 0;
        
        // Value similarity for common properties
        let valueSimilarity = 0;
        if (commonProps.length > 0) {
          const similarities = commonProps.map(prop => {
            const val1 = concept1.properties[prop].value;
            const val2 = concept2.properties[prop].value;
            return typeof val1 === 'string' && typeof val2 === 'string'
              ? stringSimilarity(val1, val2)
              : val1 === val2 ? 1 : 0;
          });
          valueSimilarity = similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
        }
        
        // Combined property similarity (50% name, 50% value)
        const score = 0.5 * propNameSimilarity + 0.5 * valueSimilarity;
        const weight = weights.properties;
        totalScore += score * weight;
        totalWeight += weight;
        breakdown.push({ field: 'properties', score, weight });
      }
    }
    
    // Relationships similarity
    if (fieldsToCheck.includes('relationships')) {
      const rels1 = concept1.relationships;
      const rels2 = concept2.relationships;
      
      if (rels1.length > 0 || rels2.length > 0) {
        // Simple Jaccard similarity for relationships
        const rels1Set = new Set(rels1.map(r => `${r.targetId}:${r.type}`));
        const rels2Set = new Set(rels2.map(r => `${r.targetId}:${r.type}`));
        
        const intersection = new Set(
          [...rels1Set].filter(r => rels2Set.has(r))
        );
        
        const union = new Set([...rels1Set, ...rels2Set]);
        
        const score = union.size > 0 ? intersection.size / union.size : 0;
        const weight = weights.relationships;
        totalScore += score * weight;
        totalWeight += weight;
        breakdown.push({ field: 'relationships', score, weight });
      }
    }
    
    // Normalize score by total weight
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return {
      score: finalScore,
      breakdown: breakdown.map(b => ({
        ...b,
        // Normalize breakdown scores
        score: totalWeight > 0 ? (b.score * b.weight) / totalWeight : 0
      }))
    };
  };
  
  /**
   * Validate a concept against the model's rules
   */
  const validateConcept = (concept: Concept): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Apply validation rules
    for (const rule of CO2_CONSTANTS.VALIDATION_RULES) {
      const ruleErrors = rule.validate(concept);
      errors.push(...ruleErrors.filter(e => e.severity === 'error'));
      warnings.push(...ruleErrors.filter(e => e.severity === 'warning'));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  //#endregion
  
  //#region Private Helper Methods
  
  /**
   * Create a fused concept from multiple source concepts
   */
  const createFusedConcept = (
    sourceConcepts: Concept[],
    strategy: FuseConceptsParams['strategy'],
    context: Record<string, any>
  ): Omit<Concept, 'id'> => {
    if (sourceConcepts.length === 0) {
      throw new Error('At least one source concept is required');
    }
    
    // Start with a base concept
    const baseConcept = {
      ...CO2_CONSTANTS.DEFAULT_CONCEPT,
      name: `Fused_${sourceConcepts.map(c => c.name).join('_')}`,
      description: `Fused concept combining: ${sourceConcepts.map(c => c.name).join(', ')}`,
      sourceModels: Array.from(new Set(sourceConcepts.flatMap(c => c.sourceModels))),
      tags: Array.from(new Set(sourceConcepts.flatMap(c => c.tags))),
      // Average confidence of source concepts
      confidence: sourceConcepts.reduce((sum, c) => sum + (c.confidence || 0), 0) / sourceConcepts.length,
      meta: {
        ...CO2_CONSTANTS.DEFAULT_CONCEPT.meta,
        fusedFrom: sourceConcepts.map(c => c.id),
        fusionStrategy: strategy,
        fusionContext: context
      }
    };
    
    // Apply fusion strategy
    switch (strategy) {
      case 'union':
        return fuseUnionStrategy(baseConcept, sourceConcepts);
      case 'intersection':
        return fuseIntersectionStrategy(baseConcept, sourceConcepts);
      case 'preferred':
        return fusePreferredStrategy(baseConcept, sourceConcepts, context);
      case 'custom':
        return fuseCustomStrategy(baseConcept, sourceConcepts, context);
      default:
        throw new Error(`Unknown fusion strategy: ${strategy}`);
    }
  };
  
  /**
   * Union strategy: include all properties and relationships from all concepts
   */
  const fuseUnionStrategy = (
    base: Omit<Concept, 'id'>,
    sources: Concept[]
  ): Omit<Concept, 'id'> => {
    const result = { ...base };
    
    // Merge properties (take all, resolve conflicts by taking the first occurrence)
    result.properties = {};
    const seenProps = new Set<string>();
    
    for (const source of sources) {
      for (const [propName, prop] of Object.entries(source.properties)) {
        if (!seenProps.has(propName)) {
          result.properties[propName] = { ...prop };
          seenProps.add(propName);
        }
      }
    }
    
    // Merge relationships (take all, deduplicate by targetId and type)
    result.relationships = [];
    const seenRels = new Set<string>();
    
    for (const source of sources) {
      for (const rel of source.relationships) {
        const key = `${rel.targetId}:${rel.type}`;
        if (!seenRels.has(key)) {
          result.relationships.push({ ...rel });
          seenRels.add(key);
        }
      }
    }
    
    return result;
  };
  
  /**
   * Intersection strategy: include only properties and relationships present in all concepts
   */
  const fuseIntersectionStrategy = (
    base: Omit<Concept, 'id'>,
    sources: Concept[]
  ): Omit<Concept, 'id'> => {
    if (sources.length === 0) return base;
    
    const result = { ...base };
    
    // Find common properties
    const propCounts = new Map<string, number>();
    const propValues = new Map<string, any>();
    
    for (const source of sources) {
      for (const [propName, prop] of Object.entries(source.properties)) {
        const count = propCounts.get(propName) || 0;
        propCounts.set(propName, count + 1);
        
        // Keep the first occurrence of each property
        if (!propValues.has(propName)) {
          propValues.set(propName, prop);
        }
      }
    }
    
    // Only include properties present in all sources
    result.properties = {};
    for (const [propName, count] of propCounts.entries()) {
      if (count === sources.length) {
        result.properties[propName] = { ...propValues.get(propName) };
      }
    }
    
    // Find common relationships (same target and type)
    const relCounts = new Map<string, number>();
    const relValues = new Map<string, any>();
    
    for (const source of sources) {
      const relKeys = new Set<string>();
      
      for (const rel of source.relationships) {
        const key = `${rel.targetId}:${rel.type}`;
        relKeys.add(key);
        
        if (!relValues.has(key)) {
          relValues.set(key, rel);
        }
      }
      
      // Count occurrences of each relationship
      for (const key of relKeys) {
        relCounts.set(key, (relCounts.get(key) || 0) + 1);
      }
    }
    
    // Only include relationships present in all sources
    result.relationships = [];
    for (const [key, count] of relCounts.entries()) {
      if (count === sources.length) {
        result.relationships.push({ ...relValues.get(key) });
      }
    }
    
    return result;
  };
  
  /**
   * Preferred strategy: prioritize concepts based on context or source priority
   */
  const fusePreferredStrategy = (
    base: Omit<Concept, 'id'>,
    sources: Concept[],
    context: Record<string, any>
  ): Omit<Concept, 'id'> => {
    // If no priority is specified, fall back to union
    if (!context.priorityOrder || !Array.isArray(context.priorityOrder)) {
      return fuseUnionStrategy(base, sources);
    }
    
    // Sort sources by priority
    const prioritizedSources = [...sources].sort((a, b) => {
      const aPriority = context.priorityOrder.findIndex((id: string) => 
        a.sourceModels.includes(id)
      );
      const bPriority = context.priorityOrder.findIndex((id: string) => 
        b.sourceModels.includes(id)
      );
      
      // If neither has priority, maintain order
      if (aPriority === -1 && bPriority === -1) return 0;
      // If only one has priority, it comes first
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      // Lower index = higher priority
      return aPriority - bPriority;
    });
    
    // Use the first source as the base and merge in others in priority order
    let result = { ...prioritizedSources[0] };
    
    for (let i = 1; i < prioritizedSources.length; i++) {
      const source = prioritizedSources[i];
      
      // Merge properties (higher priority sources override)
      result.properties = {
        ...source.properties,
        ...result.properties
      };
      
      // Merge relationships (avoid duplicates)
      const existingRels = new Set(
        result.relationships.map(r => `${r.targetId}:${r.type}`)
      );
      
      for (const rel of source.relationships) {
        const key = `${rel.targetId}:${rel.type}`;
        if (!existingRels.has(key)) {
          result.relationships.push({ ...rel });
          existingRels.add(key);
        }
      }
    }
    
    // Update metadata
    result.meta = {
      ...result.meta,
      ...base.meta,
      fusionStrategy: 'preferred',
      priorityOrder: context.priorityOrder
    };
    
    return result;
  };
  
  /**
   * Custom strategy: apply custom transformation rules
   */
  const fuseCustomStrategy = (
    base: Omit<Concept, 'id'>,
    sources: Concept[],
    context: Record<string, any>
  ): Omit<Concept, 'id'> => {
    // Start with union strategy as a base
    let result = fuseUnionStrategy(base, sources);
    
    // Apply custom rules if provided
    const customRules = context.rules || [];
    
    for (const ruleId of customRules) {
      const rule = rules.get(ruleId);
      if (rule && rule.isActive) {
        try {
          // In a real implementation, we would parse and execute the rule
          // This is a simplified version
          console.log(`Applying custom rule: ${rule.name}`);
          // result = applyRule(rule, result, sources, context);
        } catch (error) {
          console.error(`Error applying rule ${ruleId}:`, error);
        }
      }
    }
    
    return result;
  };
  
  /**
   * Automatically resolve a conflict
   */
  const autoResolveConflict = async (
    conflict: Conflict,
    concepts: Concept[],
    strategy: string,
    context: Record<string, any>
  ): Promise<boolean> => {
    // Try to find a matching rule
    for (const rule of rules.values()) {
      if (!rule.isActive) continue;
      
      try {
        // In a real implementation, we would parse and evaluate the condition
        // This is a simplified version
        const matchesConflictType = rule.tags.some(tag => 
          conflict.type.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(conflict.type.toLowerCase())
        );
        
        if (matchesConflictType) {
          // Apply the rule
          // const resolution = await evaluateRule(rule, conflict, concepts, context);
          // if (resolution) return true;
          return true; // Simplified for now
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }
    
    return false;
  };
  
  /**
   * Create a conflict object
   */
  const createConflict = (
    type: Conflict['type'],
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    sources: string[],
    elements: Array<{ type: 'concept' | 'property' | 'relationship'; id: string; value?: any }>
  ): Conflict => {
    return {
      id: `conflict_${uuidv4()}`,
      type,
      description,
      severity,
      sources: [...new Set(sources)], // Deduplicate
      elements: [...elements],
      status: 'unresolved'
    };
  };
  
  /**
   * Calculate fusion confidence based on conflicts
   */
  const calculateFusionConfidence = (
    concepts: Concept[],
    resolvedConflicts: Conflict[],
    unresolvedConflicts: Conflict[]
  ): number => {
    // Base confidence is the average of source concept confidences
    let confidence = concepts.length > 0
      ? concepts.reduce((sum, c) => sum + (c.confidence || 0), 0) / concepts.length
      : 0;
    
    // Penalize for unresolved conflicts
    const severityWeights = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      critical: 0.9
    };
    
    const unresolvedPenalty = unresolvedConflicts.reduce((sum, c) => {
      return sum + (severityWeights[c.severity] || 0);
    }, 0);
    
    // Reward for resolved conflicts
    const resolvedReward = resolvedConflicts.reduce((sum, c) => {
      return sum + (severityWeights[c.severity] || 0) * 0.5; // Half the penalty as reward
    }, 0);
    
    // Apply penalties and rewards
    confidence = confidence * (1 - unresolvedPenalty) + resolvedReward;
    
    // Ensure confidence is within bounds
    return Math.max(0, Math.min(1, confidence));
  };
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  const stringSimilarity = (a: string, b: string): number => {
    if (!a || !b) return 0;
    if (a === b) return 1;
    
    // Convert to lowercase and trim
    const str1 = a.toLowerCase().trim();
    const str2 = b.toLowerCase().trim();
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(str1, str2);
    
    // Normalize by the maximum possible distance
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength > 0 ? 1 - distance / maxLength : 0;
  };
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize the matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill in the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
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
    id: CO2_CONSTANTS.MODEL_ID,
    name: CO2_CONSTANTS.MODEL_NAME,
    description: CO2_CONSTANTS.MODEL_DESCRIPTION,
    version: CO2_CONSTANTS.VERSION,
    
    // Configuration
    config: {
      defaultSimilarityThreshold: modelConfig.defaultSimilarityThreshold,
      maxConceptsToFuse: modelConfig.maxConceptsToFuse,
      autoResolveConflicts: modelConfig.autoResolveConflicts,
      defaultFusionStrategy: modelConfig.defaultFusionStrategy,
      enableCaching: modelConfig.enableCaching,
      cacheTTL: modelConfig.cacheTTL
    },
    
    // Concept management
    addConcept,
    getConcept,
    updateConcept,
    removeConcept,
    
    // Fusion operations
    fuseConcepts,
    findSimilarConcepts,
    
    // Conflict management
    detectConflicts,
    resolveConflict,
    
    // Rule management
    addRule,
    getRule,
    updateRule,
    removeRule,
    
    // Utility methods
    calculateSimilarity,
    validateConcept,
    
    // Event handling
    on,
    off
  };
};

// Convenience function for direct usage
export const fuseConcepts = async (params: FuseConceptsParams): Promise<FusionResult> => {
  const model = createConceptualFusionModel();
  return model.fuseConcepts(params);
};

// Default export for easier imports
export default {
  createConceptualFusionModel,
  fuseConcepts,
  constants: CO2_CONSTANTS,
  types: {
    Concept: {} as Concept,
    Conflict: {} as Conflict,
    Fusion: {} as Fusion,
    TransformationRule: {} as TransformationRule,
    FuseConceptsParams: {} as FuseConceptsParams,
    FusionResult: {} as FusionResult,
    FindSimilarConceptsParams: {} as FindSimilarConceptsParams,
    SimilarityResult: {} as SimilarityResult,
    ValidationResult: {} as ValidationResult,
    ValidationError: {} as ValidationError,
    ValidationWarning: {} as ValidationWarning
  }
};

// Re-export types
export * from './types';

// Re-export constants
export * from './constants';
