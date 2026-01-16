/**
 * Global Error Handler for Frontend
 * Captures unhandled errors, promise rejections, and network failures
 */

import {
  trackError,
  addBreadcrumb,
  ErrorSeverity,
  ErrorCategory,
  type ErrorMetadata
} from '@hummbl/core';

interface UserContext {
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

class GlobalErrorHandler {
  private isInitialized = false;
  private userContext: UserContext;

  constructor() {
    this.userContext = this.initializeUserContext();
  }

  /**
   * Initialize global error handling
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Handle uncaught errors
    window.addEventListener('error', this.handleWindowError.bind(this));

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Track navigation for context
    this.setupNavigationTracking();

    // Track fetch failures
    this.setupFetchTracking();

    this.isInitialized = true;

    addBreadcrumb(
      'system',
      'Global error handler initialized',
      'info',
      { userAgent: this.userContext.userAgent }
    );
  }

  /**
   * Update user context when user logs in/out
   */
  updateUserContext(userId?: string): void {
    this.userContext = {
      ...this.userContext,
      userId,
      timestamp: new Date().toISOString(),
    };

    addBreadcrumb(
      'auth',
      userId ? 'User logged in' : 'User logged out',
      'info',
      { userId }
    );
  }

  /**
   * Manually track an error with user context
   */
  trackError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    additionalContext?: Record<string, unknown>
  ): string {
    return trackError(
      error,
      this.buildErrorMetadata(category, severity),
      {
        ...additionalContext,
        ...this.userContext,
      }
    );
  }

  private handleWindowError(event: ErrorEvent): void {
    const { error, message, filename, lineno, colno } = event;

    addBreadcrumb(
      'javascript-error',
      `Uncaught error: ${message}`,
      'error',
      {
        filename,
        line: lineno,
        column: colno,
      }
    );

    trackError(
      error || new Error(message),
      this.buildErrorMetadata(
        this.categorizeError(error || new Error(message)),
        ErrorSeverity.HIGH
      ),
      {
        type: 'uncaught-error',
        filename,
        line: lineno,
        column: colno,
        ...this.userContext,
      }
    );
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);

    addBreadcrumb(
      'unhandled-promise',
      `Unhandled promise rejection: ${message}`,
      'error'
    );

    trackError(
      error instanceof Error ? error : new Error(message),
      this.buildErrorMetadata(
        this.categorizeError(error),
        ErrorSeverity.HIGH
      ),
      {
        type: 'unhandled-promise-rejection',
        ...this.userContext,
      }
    );

    // Prevent the default browser behavior (console error)
    event.preventDefault();
  }

  private setupNavigationTracking(): void {
    // Track page navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      addBreadcrumb('navigation', `Navigated to ${args[2]}`, 'info');
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      addBreadcrumb('navigation', `Replaced state ${args[2]}`, 'info');
      return originalReplaceState.apply(this, args);
    };

    // Track browser back/forward
    window.addEventListener('popstate', () => {
      addBreadcrumb('navigation', `Browser navigation to ${window.location.pathname}`, 'info');
    });

    // Track hash changes
    window.addEventListener('hashchange', () => {
      addBreadcrumb('navigation', `Hash changed to ${window.location.hash}`, 'info');
    });
  }

  private setupFetchTracking(): void {
    const originalFetch = window.fetch;

    window.fetch = async function(...args): Promise<Response> {
      const startTime = performance.now();
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);

      addBreadcrumb('http-request', `Fetch ${url}`, 'info');

      try {
        const response = await originalFetch.apply(this, args);
        const duration = performance.now() - startTime;

        if (!response.ok) {
          addBreadcrumb(
            'http-error',
            `HTTP ${response.status} ${response.statusText} for ${url}`,
            'error',
            {
              status: response.status,
              statusText: response.statusText,
              duration,
              url
            }
          );

          // Track 4xx and 5xx errors
          if (response.status >= 400) {
            trackError(
              new Error(`HTTP ${response.status}: ${response.statusText}`),
              {
                severity: response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
                category: response.status >= 500 ? ErrorCategory.SYSTEM : ErrorCategory.NETWORK,
                tags: {
                  httpStatus: String(response.status),
                  url,
                  type: 'http-error',
                },
                performance: {
                  responseTime: duration,
                  networkLatency: duration,
                },
                ...globalErrorHandler.userContext,
              },
              {
                httpStatus: response.status,
                httpStatusText: response.statusText,
                responseTime: duration,
                url,
              }
            );
          }
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        addBreadcrumb(
          'network-error',
          `Network error for ${url}: ${error instanceof Error ? error.message : String(error)}`,
          'error',
          { duration, url }
        );

        trackError(
          error instanceof Error ? error : new Error(String(error)),
          {
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.NETWORK,
            tags: {
              type: 'network-error',
              url,
            },
            performance: {
              responseTime: duration,
              networkLatency: duration,
            },
            ...globalErrorHandler.userContext,
          },
          {
            url,
            duration,
            type: 'network-failure',
          }
        );

        throw error;
      }
    };
  }

  private initializeUserContext(): UserContext {
    let sessionId = sessionStorage.getItem('hummbl-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('hummbl-session-id', sessionId);
    }

    return {
      sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }

  private buildErrorMetadata(
    category: ErrorCategory,
    severity: ErrorSeverity
  ): ErrorMetadata {
    return {
      severity,
      category,
      sessionId: this.userContext.sessionId,
      userId: this.userContext.userId,
      userAgent: this.userContext.userAgent,
      timestamp: new Date().toISOString(),
      tags: {
        environment: import.meta.env.MODE || 'production',
        source: 'frontend',
      },
    };
  }

  private categorizeError(error: unknown): ErrorCategory {
    if (!(error instanceof Error)) {
      return ErrorCategory.UNKNOWN;
    }

    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('cors') ||
      message.includes('timeout') ||
      stack.includes('fetch')
    ) {
      return ErrorCategory.NETWORK;
    }

    // Authentication/Authorization
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('auth')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorCategory.VALIDATION;
    }

    // React-specific errors
    if (stack.includes('react') || message.includes('minified react')) {
      return ErrorCategory.SYSTEM;
    }

    return ErrorCategory.UNKNOWN;
  }
}

// Global instance
export const globalErrorHandler = new GlobalErrorHandler();

// Initialize on module load
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}

export default globalErrorHandler;