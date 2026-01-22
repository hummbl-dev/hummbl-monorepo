import { ErrorPattern, ImprovementSignal, ErrorCategory, ErrorSeverity, ImprovementPriority, ImprovementStatus } from './types';

/**
 * Constants for the Error Utilization model (IN2)
 */

export const IN2_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'IN2',
  MODEL_NAME: 'Error Utilization',
  TRANSFORMATION: 'Inversion',
  VERSION: '1.0.0',
  
  // Default configuration values
  DEFAULTS: {
    MIN_CONFIDENCE: 0.7,
    MAX_ERRORS_PER_REQUEST: 50,
    MAX_IMPROVEMENTS_PER_REQUEST: 10,
    ERROR_PATTERN_LIFETIME: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    DEFAULT_MIN_SEVERITY: ErrorSeverity.MEDIUM,
    SAMPLING_RATE: 1.0, // 100% sampling by default
    COOLDOWN_PERIOD: 5 * 60 * 1000, // 5 minutes in ms
  },
  
  // Common error patterns (simplified examples)
  ERROR_PATTERNS: [
    // Syntax errors
    {
      pattern: /(SyntaxError|Syntax Error|Unexpected token|Parse error|Unexpected end of input)/i,
      category: ErrorCategory.SYNTAX,
      severity: ErrorSeverity.HIGH,
      suggestion: 'Review the syntax in the specified location and correct any errors. Ensure all brackets, parentheses, and quotes are properly closed.'
    },
    
    // Network errors
    {
      pattern: /(Network Error|Failed to fetch|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ECONNRESET)/i,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      suggestion: 'Check your network connection and ensure the server is running and accessible. Verify API endpoints and authentication if applicable.'
    },
    
    // Authentication errors
    {
      pattern: /(401 Unauthorized|403 Forbidden|Invalid credentials|Authentication failed|Invalid token)/i,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      suggestion: 'Verify your authentication credentials and ensure you have the necessary permissions. Check if your session has expired.'
    },
    
    // Resource not found
    {
      pattern: /(404 Not Found|Resource not found|Cannot GET|Cannot read property '.*' of undefined)/i,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.MEDIUM,
      suggestion: 'The requested resource could not be found. Verify the resource ID or path is correct and the resource exists.'
    },
    
    // Validation errors
    {
      pattern: /(Validation failed|Invalid input|Missing required field|Invalid format)/i,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      suggestion: 'Please check your input and ensure all required fields are provided in the correct format.'
    },
    
    // Timeout errors
    {
      pattern: /(timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT)/i,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      suggestion: 'The operation took too long to complete. Please try again later or check if the server is under heavy load.'
    },
    
    // Rate limiting
    {
      pattern: /(rate limit|too many requests|429|quota exceeded)/i,
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      suggestion: 'You have exceeded the allowed request rate. Please wait before making additional requests or consider implementing rate limiting in your application.'
    },
    
    // Resource exhaustion
    {
      pattern: /(out of memory|heap out of memory|allocation failure|EMFILE: too many open files)/i,
      category: ErrorCategory.RESOURCE,
      severity: ErrorSeverity.HIGH,
      suggestion: 'The system is running low on resources. Close unused applications, increase system resources, or optimize memory usage in your application.'
    },
    
    // Deprecation warnings
    {
      pattern: /(deprecated|no longer supported|will be removed|is deprecated)/i,
      category: ErrorCategory.COMPATIBILITY,
      severity: ErrorSeverity.LOW,
      suggestion: 'This feature or API is deprecated. Please update your code to use the recommended alternative.'
    },
    
    // Performance warnings
    {
      pattern: /(slow performance|long running|high latency|slow query)/i,
      category: ErrorCategory.PERFORMANCE,
      severity: ErrorSeverity.MEDIUM,
      suggestion: 'Performance issues detected. Consider optimizing the operation or query for better efficiency.'
    },
  ],
  
  // Example error patterns for testing and demonstration
  EXAMPLE_ERROR_PATTERNS: [
    {
      id: 'error-1',
      pattern: 'TypeError: Cannot read property \'name\' of undefined',
      category: ErrorCategory.SYNTAX,
      severity: ErrorSeverity.HIGH,
      context: 'Frontend application',
      confidence: 0.95,
      tags: ['frontend', 'runtime'],
      firstSeen: new Date('2023-10-01T10:00:00Z'),
      lastSeen: new Date('2023-10-23T15:30:00Z'),
      occurrenceCount: 42,
      relatedErrors: [],
      meta: {
        source: 'client-js',
        isActive: true,
        isFalsePositive: false,
      },
    },
    {
      id: 'error-2',
      pattern: 'Failed to fetch resource: the server responded with a status of 500',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      context: 'API integration',
      confidence: 0.9,
      tags: ['api', 'backend'],
      firstSeen: new Date('2023-10-15T08:20:00Z'),
      lastSeen: new Date('2023-10-23T14:15:00Z'),
      occurrenceCount: 18,
      relatedErrors: [],
      meta: {
        source: 'browser-console',
        isActive: true,
        isFalsePositive: false,
      },
    },
  ] as ErrorPattern[],
  
  // Example improvements for testing and demonstration
  EXAMPLE_IMPROVEMENTS: [
    {
      id: 'improvement-1',
      suggestion: 'Add null check before accessing the \'name\' property to prevent TypeError',
      impact: 0.9,
      effort: 0.3,
      priority: ImprovementPriority.HIGH,
      sourceErrors: ['error-1'],
      status: ImprovementStatus.PROPOSED,
      tags: ['frontend', 'error-handling'],
      meta: {
        createdAt: new Date('2023-10-20T09:15:00Z'),
        updatedAt: new Date('2023-10-20T09:15:00Z'),
        createdBy: 'system',
      },
    },
    {
      id: 'improvement-2',
      suggestion: 'Implement retry mechanism with exponential backoff for failed API requests',
      impact: 0.8,
      effort: 0.6,
      priority: ImprovementPriority.MEDIUM,
      sourceErrors: ['error-2'],
      status: ImprovementStatus.PROPOSED,
      tags: ['api', 'resilience'],
      meta: {
        createdAt: new Date('2023-10-20T10:30:00Z'),
        updatedAt: new Date('2023-10-20T10:30:00Z'),
        createdBy: 'system',
      },
    },
  ] as ImprovementSignal[],
  
  // Example scenario for documentation
  EXAMPLE_SCENARIO: {
    title: 'API Error Rate Spike',
    description: 'The system is experiencing an increased rate of 500 errors from the payment processing API.',
    errors: [
      {
        pattern: 'Failed to process payment: 500 Internal Server Error',
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
      },
    ],
    improvements: [
      {
        suggestion: 'Implement circuit breaker pattern to gracefully handle payment API failures',
        impact: 0.9,
        effort: 0.7,
      },
    ],
  },
  
  // Impact calculation weights
  IMPACT_WEIGHTS: {
    SEVERITY: 0.6,
    FREQUENCY: 0.3,
    RECENCY: 0.1,
  },
  
  // Effort estimation factors
  EFFORT_FACTORS: {
    CODE_CHANGES: 0.5,
    TESTING: 0.3,
    DEPLOYMENT: 0.2,
  },
  
  // Priority calculation thresholds
  PRIORITY_THRESHOLDS: {
    CRITICAL: 0.85,  // score >= 0.85
    HIGH: 0.7,       // 0.7 <= score < 0.85
    MEDIUM: 0.4,     // 0.4 <= score < 0.7
    LOW: 0,          // score < 0.4
  },
} as const;
