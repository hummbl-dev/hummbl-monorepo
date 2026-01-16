/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * React Error Boundary with comprehensive error tracking
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError, addBreadcrumb, ErrorSeverity, ErrorCategory } from '@hummbl/core';

interface ErrorBoundaryState {
  hasError: boolean;
  errorId?: string;
  errorMessage?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorId: string, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  level?: 'page' | 'component' | 'critical';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', onError } = this.props;

    // Add breadcrumb for the error context
    addBreadcrumb('react-error', `Error boundary caught error: ${error.message}`, 'error', {
      componentStack: errorInfo.componentStack,
      level,
    });

    // Determine error severity based on level
    const severity = this.getSeverityFromLevel(level);

    // Track the error
    const errorId = trackError(
      error,
      {
        severity,
        category: ErrorCategory.SYSTEM,
        tags: {
          type: 'react-error-boundary',
          level,
          component: this.getComponentName(errorInfo.componentStack),
        },
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
      },
      {
        componentStack: errorInfo.componentStack,
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }
    );

    this.setState({ errorId });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // For critical errors, reload the page after a delay
    if (level === 'critical') {
      this.schedulePageReload();
    }
  }

  private getSeverityFromLevel(level: string): ErrorSeverity {
    switch (level) {
      case 'critical':
        return ErrorSeverity.CRITICAL;
      case 'page':
        return ErrorSeverity.HIGH;
      case 'component':
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  private getComponentName(componentStack: string): string {
    // Extract component name from stack trace
    const match = componentStack.match(/in (\w+)/);
    return match ? match[1] : 'Unknown';
  }

  private getSessionId(): string {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('hummbl-session-id');
    if (!sessionId) {
            // Generate cryptographically secure random string
      const randomBytes = new Uint8Array(9);
      window.crypto.getRandomValues(randomBytes);
      const randomStr = Array.from(randomBytes)
        .map((b) => b.toString(36))
        .join('')
        .substr(0, 9);
      sessionId = `session_${Date.now()}_${randomStr}`;
    sessionStorage.setItem('hummbl-session-id', sessionId);
          return sessionId;
  }
        return sessionId;
      }

  private schedulePageReload(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.retryTimeoutId = window.setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  private handleRetry = (): void => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    addBreadcrumb('user-action', 'User retried after error boundary catch', 'info', {
      errorId: this.state.errorId,
    });

    this.setState({
      hasError: false,
      errorId: undefined,
      errorMessage: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, level = 'component' } = this.props;
      const { errorMessage, errorId } = this.state;

      if (fallback && errorMessage) {
        return fallback(new Error(errorMessage), errorId || 'unknown', this.handleRetry);
      }

      return (
        <DefaultErrorFallback
          level={level}
          errorMessage={errorMessage || 'An unexpected error occurred'}
          errorId={errorId || 'unknown'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  level: string;
  errorMessage: string;
  errorId: string;
  onRetry: () => void;
}

function DefaultErrorFallback({
  level,
  errorMessage,
  errorId,
  onRetry,
}: DefaultErrorFallbackProps) {
  const isPageLevel = level === 'page' || level === 'critical';

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${
        isPageLevel ? 'min-h-screen bg-gray-50' : 'min-h-64 bg-gray-100 rounded-lg'
      }`}
      role="alert"
    >
      <div className="text-center max-w-md">
        {isPageLevel ? (
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        ) : (
          <div className="mb-4">
            <svg
              className="mx-auto h-8 w-8 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01"
              />
            </svg>
          </div>
        )}

        <h2 className={`mb-2 ${isPageLevel ? 'text-xl' : 'text-lg'} font-semibold text-gray-900`}>
          {isPageLevel ? 'Something went wrong' : 'Component Error'}
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          {isPageLevel
            ? 'We encountered an unexpected error. Please try refreshing the page.'
            : 'This component encountered an error and needs to be reloaded.'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-2 bg-gray-200 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
              <div>ID: {errorId}</div>
              <div>Message: {errorMessage}</div>
            </div>
          </details>
        )}

        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>

        {isPageLevel && (
          <button
            onClick={() => (window.location.href = '/')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;
