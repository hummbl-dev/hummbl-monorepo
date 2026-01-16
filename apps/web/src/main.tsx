import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { globalErrorHandler } from './lib/error-handler';
import { trackError, ErrorCategory, ErrorSeverity } from '@hummbl/core';
import './index.css';

// Initialize global error handling
globalErrorHandler.initialize();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      onError: error => {
        trackError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NETWORK,
          tags: {
            type: 'query-error',
            source: 'react-query',
          },
        });
      },
    },
    mutations: {
      onError: error => {
        trackError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.NETWORK,
          tags: {
            type: 'mutation-error',
            source: 'react-query',
          },
        });
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      level="critical"
      onError={(error, errorInfo, errorId) => {
        // Critical app-level error
        console.error('Critical application error:', { error, errorInfo, errorId });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
