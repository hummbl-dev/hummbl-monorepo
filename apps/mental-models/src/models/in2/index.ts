import { v4 as uuidv4 } from 'uuid';
import { 
  ErrorPattern, 
  ErrorSeverity, 
  ImprovementSignal, 
  FeedbackLoop, 
  ErrorAnalysis, 
  DetectErrorsParams, 
  GenerateImprovementsParams, 
  ErrorUtilizationModel,
  ErrorCategory,
  ImprovementPriority,
  ImprovementStatus
} from './types';
import { 
  IN2_CONSTANTS, 
  DEFAULT_CONFIG, 
  ERROR_PATTERNS, 
  EXAMPLE_ERROR_PATTERNS, 
  EXAMPLE_IMPROVEMENTS,
  IMPACT_WEIGHTS,
  EFFORT_FACTORS
} from './constants';

/**
 * Creates a new Error Utilization model instance
 */
export const createErrorUtilizationModel = (config = {}): ErrorUtilizationModel => {
  // Initialize state
  const errors = new Map<string, ErrorPattern>();
  const improvements = new Map<string, ImprovementSignal>();
  const feedbackLoops = new Map<string, FeedbackLoop>();
  
  // Merge default config with provided config
  const modelConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize with example data if empty
  if (errors.size === 0) {
    EXAMPLE_ERROR_PATTERNS.forEach(err => errors.set(err.id, err));
  }
  
  if (improvements.size === 0) {
    EXAMPLE_IMPROVEMENTS.forEach(imp => improvements.set(imp.id, imp));
  }

  /**
   * Detect error patterns in the input
   */
  const detectErrors = async ({
    input,
    minConfidence = modelConfig.defaultMinConfidence,
    minSeverity = modelConfig.defaultMinSeverity,
    limit = modelConfig.maxErrorsPerRequest,
    context = 'default',
    meta = {}
  }: DetectErrorsParams): Promise<ErrorPattern[]> => {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const detected: ErrorPattern[] = [];
    const now = new Date();
    
    // Check against known error patterns
    for (const pattern of ERROR_PATTERNS) {
      if (detected.length >= limit) break;
      
      const isMatch = typeof pattern.pattern === 'string' 
        ? inputStr.includes(pattern.pattern)
        : pattern.pattern.test(inputStr);
      
      if (isMatch && pattern.severity >= minSeverity) {
        const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const error: ErrorPattern = {
          id: errorId,
          pattern: pattern.pattern,
          category: pattern.category,
          severity: pattern.severity,
          context,
          confidence: pattern.confidence,
          tags: [...pattern.tags],
          firstSeen: now,
          lastSeen: now,
          occurrenceCount: 1,
          relatedErrors: [],
          meta: {
            source: 'error-utilization-model',
            isActive: true,
            isFalsePositive: false,
            ...meta
          }
        };
        
        // Check for existing similar error
        const existing = Array.from(errors.values()).find(
          e => e.pattern === error.pattern && e.context === context
        );
        
        if (existing) {
          existing.occurrenceCount++;
          existing.lastSeen = now;
          detected.push({ ...existing });
        } else {
          errors.set(errorId, error);
          detected.push(error);
        }
      }
    }
    
    return detected.sort((a, b) => b.severity - a.severity || b.confidence - a.confidence);
  };

  /**
   * Generate improvement suggestions from errors
   */
  const generateImprovements = async ({
    errors,
    context = 'default',
    limit = modelConfig.maxImprovementsPerRequest,
    minImpact = 0.5,
    maxEffort = 10
  }: GenerateImprovementsParams): Promise<ImprovementSignal[]> => {
    const generated: ImprovementSignal[] = [];
    const now = new Date();
    
    for (const error of errors) {
      if (generated.length >= limit) break;
      
      // Skip if error is already addressed
      const existingImprovement = Array.from(improvements.values())
        .find(imp => imp.sourceErrors.includes(error.id));
      
      if (existingImprovement) {
        // Update existing improvement
        existingImprovement.updatedAt = now;
        existingImprovement.meta.updatedAt = now;
        existingImprovement.meta.lastUpdatedBy = 'system';
        
        // Update impact based on new error
        const impact = calculateImpact(error);
        existingImprovement.impact = Math.max(existingImprovement.impact, impact);
        
        generated.push({ ...existingImprovement });
        continue;
      }
      
      // Generate new improvement
      const improvementId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const impact = calculateImpact(error);
      
      // Skip if impact is too low
      if (impact < minImpact) continue;
      
      const suggestion = `Address ${error.pattern} in ${context} context. ` +
        `This is a ${ErrorSeverity[error.severity].toLowerCase()} severity issue ` +
        `that has been detected ${error.occurrenceCount} time(s).`;
      
      const improvement: ImprovementSignal = {
        id: improvementId,
        suggestion,
        impact,
        effort: calculateEffort(suggestion),
        priority: ImprovementPriority.MEDIUM,
        sourceErrors: [error.id],
        status: ImprovementStatus.PROPOSED,
        tags: [...error.tags, `severity:${ErrorSeverity[error.severity].toLowerCase()}`],
        meta: {
          createdAt: now,
          updatedAt: now,
          createdBy: 'system',
          lastUpdatedBy: 'system'
        },
        createdAt: now,
        updatedAt: now
      };
      
      // Skip if effort is too high
      if (improvement.effort > maxEffort) continue;
      
      improvements.set(improvementId, improvement);
      generated.push(improvement);
    }
    
    return generated.sort((a, b) => {
      // Sort by priority (desc), then impact (desc), then effort (asc)
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.impact !== b.impact) return b.impact - a.impact;
      return a.effort - b.effort;
    });
  };

  /**
   * Analyze errors and generate insights
   */
  const analyzeErrors = async (input: string | Record<string, any>): Promise<ErrorAnalysis> => {
    const detectedErrors = await detectErrors({ input });
    const generatedImprovements = await generateImprovements({ errors: detectedErrors });
    
    // Calculate metrics
    const totalErrors = errors.size;
    const uniqueErrorTypes = new Set(Array.from(errors.values()).map(e => e.pattern)).size;
    const improvementsGenerated = improvements.size;
    
    const avgImpact = generatedImprovements.length > 0
      ? generatedImprovements.reduce((sum, imp) => sum + imp.impact, 0) / generatedImprovements.length
      : 0;
      
    const avgEffort = generatedImprovements.length > 0
      ? generatedImprovements.reduce((sum, imp) => sum + imp.effort, 0) / generatedImprovements.length
      : 0;
    
    // Calculate error reduction potential (simplified)
    const errorReductionPotential = Math.min(1, 
      generatedImprovements.length > 0 
        ? generatedImprovements.reduce((sum, imp) => sum + imp.impact, 0) / generatedImprovements.length
        : 0
    );
    
    return {
      errors: detectedErrors,
      improvements: generatedImprovements,
      metrics: {
        totalErrors,
        uniqueErrorTypes,
        improvementsGenerated,
        averageImpact: parseFloat(avgImpact.toFixed(2)),
        averageEffort: parseFloat(avgEffort.toFixed(2)),
        errorReductionPotential: parseFloat(errorReductionPotential.toFixed(2))
      }
    };
  };

  /**
   * Create a feedback loop for continuous improvement
   */
  const createFeedbackLoop = (config: Partial<Omit<FeedbackLoop, 'id'>>): FeedbackLoop => {
    const now = new Date();
    const loopId = `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultConfig = {
      isActive: true,
      samplingRate: 1.0,
      minSeverity: ErrorSeverity.MEDIUM,
      maxImprovementsPerCycle: 10,
      cooldownPeriod: 60 * 1000 // 1 minute
    };
    
    const loop: FeedbackLoop = {
      id: loopId,
      name: config.name || `Feedback Loop ${loopId}`,
      description: config.description || 'Automated feedback loop for error utilization',
      errorPatterns: config.errorPatterns || [],
      improvements: config.improvements || [],
      config: {
        ...defaultConfig,
        ...(config.config || {})
      },
      metrics: {
        totalErrorsProcessed: 0,
        improvementsGenerated: 0,
        averageProcessingTime: 0,
        errorReductionRate: 0,
        lastProcessed: null
      },
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        ...(config.meta || {})
      }
    };
    
    feedbackLoops.set(loopId, loop);
    return { ...loop };
  };

  /**
   * Update an existing feedback loop
   */
  const updateFeedbackLoop = (id: string, updates: Partial<FeedbackLoop>): FeedbackLoop | null => {
    const loop = feedbackLoops.get(id);
    if (!loop) return null;
    
    const now = new Date();
    const updated = {
      ...loop,
      ...updates,
      config: { ...loop.config, ...(updates.config || {}) },
      metrics: { ...loop.metrics, ...(updates.metrics || {}) },
      meta: {
        ...loop.meta,
        ...(updates.meta || {}),
        updatedAt: now,
        lastUpdatedBy: 'system'
      },
      updatedAt: now
    };
    
    feedbackLoops.set(id, updated);
    return { ...updated };
  };

  /**
   * Get a feedback loop by ID
   */
  const getFeedbackLoop = (id: string): FeedbackLoop | null => {
    const loop = feedbackLoops.get(id);
    return loop ? { ...loop } : null;
  };

  /**
   * List all feedback loops
   */
  const listFeedbackLoops = (): FeedbackLoop[] => {
    return Array.from(feedbackLoops.values()).map(loop => ({ ...loop }));
  };

  /**
   * Calculate the impact of an error
   */
  const calculateImpact = (error: ErrorPattern): number => {
    // Base impact based on severity
    let impact = 0;
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL: impact = 0.9; break;
      case ErrorSeverity.HIGH: impact = 0.7; break;
      case ErrorSeverity.MEDIUM: impact = 0.5; break;
      case ErrorSeverity.LOW: impact = 0.3; break;
      case ErrorSeverity.INFO: impact = 0.1; break;
      default: impact = 0.3;
    }
    
    // Adjust based on occurrence count (log scale)
    const occurrenceFactor = Math.log10(Math.max(1, error.occurrenceCount)) / 3; // 0-1 scale
    impact = impact * 0.7 + occurrenceFactor * 0.3;
    
    // Adjust based on context and category
    const contextFactor = IMPACT_WEIGHTS.contexts[error.context] || 0.5;
    const categoryFactor = IMPACT_WEIGHTS.categories[error.category] || 0.5;
    
    impact = impact * 0.6 + contextFactor * 0.2 + categoryFactor * 0.2;
    
    return Math.min(1, Math.max(0, impact)); // Ensure 0-1 range
  };

  /**
   * Estimate the effort required to implement an improvement
   */
  const calculateEffort = (improvement: string): number => {
    // Base effort based on text length and complexity
    const lengthFactor = Math.min(1, improvement.length / 500);
    const wordCount = improvement.split(/\s+/).length;
    const complexityScore = (improvement.match(/[\{\}\[\]\(\)]/g) || []).length / 10;
    
    // Start with base effort
    let effort = EFFORT_FACTORS.BASE;
    
    // Adjust based on length and complexity
    effort += lengthFactor * EFFORT_FACTORS.LENGTH_WEIGHT;
    effort += (wordCount / 100) * EFFORT_FACTORS.WORD_WEIGHT;
    effort += complexityScore * EFFORT_FACTORS.COMPLEXITY_WEIGHT;
    
    // Apply keyword adjustments
    for (const [keyword, weight] of Object.entries(EFFORT_FACTORS.KEYWORDS)) {
      if (improvement.toLowerCase().includes(keyword.toLowerCase())) {
        effort += weight;
      }
    }
    
    // Ensure effort is within bounds
    return Math.max(1, Math.min(10, Math.round(effort * 10) / 10));
  };

  // Return the model instance
  return {
    id: 'error-utilization-model',
    name: 'Error Utilization Model',
    description: 'Converts errors into actionable improvements',
    version: IN2_CONSTANTS.VERSION,
    config: {
      defaultMinConfidence: modelConfig.defaultMinConfidence,
      defaultMinSeverity: modelConfig.defaultMinSeverity,
      maxErrorsPerRequest: modelConfig.maxErrorsPerRequest,
      maxImprovementsPerRequest: modelConfig.maxImprovementsPerRequest,
      errorPatternLifetime: modelConfig.errorPatternLifetime
    },
    
    // Core methods
    detectErrors,
    generateImprovements,
    analyzeErrors,
    
    // Feedback loop management
    createFeedbackLoop,
    updateFeedbackLoop,
    getFeedbackLoop,
    listFeedbackLoops,
    
    // Utility methods
    calculateImpact,
    calculateEffort
  };
};

// Convenience function for direct usage
export const analyzeErrors = async (input: string | Record<string, any>): Promise<ErrorAnalysis> => {
  const model = createErrorUtilizationModel();
  return model.analyzeErrors(input);
};

// Default export for easier imports
export default {
  createErrorUtilizationModel,
  analyzeErrors,
  constants: IN2_CONSTANTS,
  ErrorSeverity,
  ErrorCategory,
  ImprovementPriority,
  ImprovementStatus
};

// Re-export types
export * from './types';

// Re-export constants
export * from './constants';
