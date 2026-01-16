# Error Tracking and Monitoring Implementation Guide

This guide provides comprehensive implementation examples and workflows for the HUMMBL error tracking and monitoring system.

## Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start](#quick-start)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Privacy and Compliance](#privacy-and-compliance)
7. [Workflows and Automation](#workflows-and-automation)
8. [Best Practices](#best-practices)

## System Overview

The error tracking system consists of several integrated components:

- **Core Error Tracking**: Centralized error collection and categorization
- **Specialized Trackers**: Domain-specific error handling (auth, database, rate limiting, MCP tools)
- **React Error Boundaries**: Frontend error capture and recovery
- **Alerting System**: Real-time notifications and escalation
- **Dashboard Configuration**: Metrics visualization and monitoring
- **Error Reporting**: Issue creation and workflow management
- **Privacy Compliance**: GDPR/CCPA compliant data handling

## Quick Start

### 1. Basic Error Tracking

```typescript
import { trackError, ErrorCategory, ErrorSeverity } from '@hummbl/core';

// Track a simple error
const errorId = trackError(
  new Error('Something went wrong'),
  {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.SYSTEM,
    tags: { component: 'user-dashboard' },
  }
);

console.log(`Error tracked with ID: ${errorId}`);
```

### 2. Adding Breadcrumbs for Context

```typescript
import { addBreadcrumb, trackError } from '@hummbl/core';

// Add breadcrumbs to provide context
addBreadcrumb('user-action', 'User clicked submit button', 'info');
addBreadcrumb('api-call', 'Calling user update API', 'info');

// When error occurs, breadcrumbs are automatically included
try {
  await updateUser(userData);
} catch (error) {
  trackError(error, {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.NETWORK,
  });
}
```

## Frontend Integration

### 1. React Error Boundaries

```typescript
// App.tsx
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { globalErrorHandler } from './lib/error-handler';

// Initialize global error handling
globalErrorHandler.initialize();

function App() {
  return (
    <ErrorBoundary level="critical">
      <Router>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary level="page">
              <HomePage />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary level="page">
              <DashboardPage />
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

### 2. Component-Level Error Handling

```typescript
// UserProfile.tsx
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { trackError, ErrorCategory, ErrorSeverity } from '@hummbl/core';

function UserProfile() {
  const handleSaveProfile = async (profileData: ProfileData) => {
    try {
      await saveUserProfile(profileData);
    } catch (error) {
      // Track specific user action errors
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.USER_INPUT,
          tags: {
            action: 'save-profile',
            component: 'UserProfile',
          },
        },
        {
          profileData: { id: profileData.id }, // Only log non-sensitive data
          userAgent: navigator.userAgent,
          url: window.location.href,
        }
      );

      // Show user-friendly error message
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <ErrorBoundary
      level="component"
      fallback={(error, errorId, retry) => (
        <div className="error-container">
          <h3>Profile Loading Error</h3>
          <p>We couldn't load your profile. Please try again.</p>
          <button onClick={retry}>Retry</button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <p>Error ID: {errorId}</p>
              <p>Message: {error.message}</p>
            </details>
          )}
        </div>
      )}
    >
      <ProfileForm onSave={handleSaveProfile} />
    </ErrorBoundary>
  );
}
```

### 3. Network Error Handling

```typescript
// api-client.ts
import { trackError, addBreadcrumb, ErrorCategory, ErrorSeverity } from '@hummbl/core';

class APIClient {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    addBreadcrumb('api-request', `Making request to ${url}`, 'info');

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      addBreadcrumb('api-success', `Request to ${url} succeeded`, 'info');

      return data;
    } catch (error) {
      addBreadcrumb('api-error', `Request to ${url} failed`, 'error');

      // Track API errors with context
      trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          severity: this.getErrorSeverity(error),
          category: ErrorCategory.NETWORK,
          tags: {
            endpoint: url,
            method: options.method || 'GET',
          },
        },
        {
          url,
          options: this.sanitizeOptions(options),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
      );

      throw error;
    }
  }

  private getErrorSeverity(error: unknown): ErrorSeverity {
    if (error instanceof APIError) {
      if (error.status >= 500) return ErrorSeverity.HIGH;
      if (error.status === 401 || error.status === 403) return ErrorSeverity.MEDIUM;
      return ErrorSeverity.LOW;
    }
    return ErrorSeverity.MEDIUM;
  }

  private sanitizeOptions(options: RequestOptions): Partial<RequestOptions> {
    // Remove sensitive data from logged options
    const { headers, body, ...safe } = options;
    return {
      ...safe,
      headers: headers ? this.sanitizeHeaders(headers) : undefined,
      body: body ? '[REDACTED]' : undefined,
    };
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
```

## Backend Integration

### 1. Cloudflare Workers Integration

The Workers API already includes comprehensive error tracking. Here's how to use specialized trackers:

```typescript
// routes/auth.ts
import { trackAuthFailure, trackAuthSuccess } from '@hummbl/core';

export default new Hono()
  .post('/login', async (c) => {
    const { email, password } = await c.req.json();

    try {
      const user = await authenticateUser(email, password);

      // Track successful authentication
      trackAuthSuccess(user.id, c.req.header('CF-Connecting-IP'));

      return c.json({ user, token: generateToken(user) });
    } catch (error) {
      // Track authentication failure with context
      trackAuthFailure({
        authMethod: 'jwt',
        userId: undefined, // Don't log user ID for failed attempts
        endpoint: '/v1/auth/login',
        reason: 'invalid_credentials',
        ipAddress: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent'),
        attemptCount: 1, // You might track this in your auth system
      });

      return c.json({ error: 'Invalid credentials' }, 401);
    }
  });
```

### 2. Database Error Tracking

```typescript
// lib/database.ts
import { trackDatabaseError, trackSlowQuery } from '@hummbl/core';

export class Database {
  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const startTime = Date.now();
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      addBreadcrumb('database', `Executing query: ${this.sanitizeQuery(sql)}`, 'info');

      const result = await this.connection.execute(sql, params);
      const executionTime = Date.now() - startTime;

      // Track slow queries
      if (executionTime > 1000) {
        trackSlowQuery(sql, executionTime, {
          table: this.extractTableName(sql),
          rowsAffected: result.rows?.length,
        });
      }

      return result.rows as T[];
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Track database errors
      trackDatabaseError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: this.getOperationType(sql),
          table: this.extractTableName(sql),
          query: sql,
          queryTime: executionTime,
          errorCode: this.extractErrorCode(error),
          deadlockDetected: this.isDeadlock(error),
        }
      );

      throw error;
    }
  }

  private getOperationType(sql: string): 'read' | 'write' | 'delete' | 'migrate' {
    const normalized = sql.trim().toLowerCase();
    if (normalized.startsWith('select')) return 'read';
    if (normalized.startsWith('insert') || normalized.startsWith('update')) return 'write';
    if (normalized.startsWith('delete')) return 'delete';
    return 'migrate';
  }

  private extractTableName(sql: string): string {
    const match = sql.match(/(?:from|into|update|delete from)\s+([a-zA-Z_]\w*)/i);
    return match ? match[1] : 'unknown';
  }

  private extractErrorCode(error: unknown): string {
    if (error instanceof Error && 'code' in error) {
      return String(error.code);
    }
    return 'unknown';
  }

  private isDeadlock(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.toLowerCase().includes('deadlock');
    }
    return false;
  }

  private sanitizeQuery(sql: string): string {
    return sql.replace(/\$\d+|\'/g, '?').substring(0, 100);
  }
}
```

### 3. Rate Limiting Integration

```typescript
// middleware/rateLimiter.ts
import { trackRateLimitViolation } from '@hummbl/core';

export function rateLimiter(options: RateLimitOptions = {}) {
  return async (c: Context, next: Next) => {
    const identifier = getIdentifier(c);
    const key = `rate_limit:${identifier}`;

    const current = await c.env.KV.get(key);
    const count = current ? parseInt(current) : 0;
    const limit = options.limit || 100;
    const window = options.window || 60; // seconds

    if (count >= limit) {
      // Track rate limit violation
      trackRateLimitViolation({
        identifier,
        limit,
        window,
        current: count,
        endpoint: c.req.path,
        limitType: 'ip', // or 'user', 'global', 'endpoint'
        resetTime: Date.now() + window * 1000,
      });

      return c.json({
        error: 'Rate limit exceeded',
        limit,
        current: count,
        resetTime: Date.now() + window * 1000,
      }, 429);
    }

    // Update counter
    await c.env.KV.put(key, String(count + 1), { expirationTtl: window });

    await next();
  };
}
```

## Monitoring and Alerting

### 1. Setting Up Alerts

```typescript
// monitoring/alerts-setup.ts
import { alertingSystem, AlertSeverity, AlertChannel } from '../monitoring/error-alerting';

// Add custom alert rules
alertingSystem.addRule({
  id: 'user_signup_failures',
  name: 'User Signup Failures',
  description: 'High failure rate in user signup process',
  condition: {
    type: 'error_count',
    threshold: 10,
    timeWindowMinutes: 15,
    filters: {
      category: 'authentication',
      endpoint: '/v1/auth/signup',
    },
  },
  severity: AlertSeverity.ERROR,
  channels: [AlertChannel.SLACK, AlertChannel.EMAIL],
  enabled: true,
  cooldownMinutes: 30,
  escalationRules: [
    {
      delayMinutes: 60,
      channels: [AlertChannel.SMS],
      contacts: ['oncall@example.com'],
    },
  ],
});

// Monitor critical business metrics
alertingSystem.addRule({
  id: 'payment_processing_errors',
  name: 'Payment Processing Errors',
  description: 'Any error in payment processing',
  condition: {
    type: 'error_count',
    threshold: 1,
    timeWindowMinutes: 1,
    filters: {
      tags: { component: 'payment-processor' },
    },
  },
  severity: AlertSeverity.CRITICAL,
  channels: [AlertChannel.SLACK, AlertChannel.EMAIL, AlertChannel.SMS],
  enabled: true,
  cooldownMinutes: 5,
});
```

### 2. Dashboard Integration

```typescript
// monitoring/dashboard-setup.ts
import { monitoringDashboard } from '../monitoring/dashboard-config';

// Get real-time dashboard data
const dashboardData = monitoringDashboard.getDashboardData('overview');

// Generate performance report
const report = monitoringDashboard.generateReport('24h');

console.log('Error Overview:', {
  totalErrors: report.overview.totalErrors,
  activeAlerts: report.overview.activeAlerts,
  topErrorCategories: Object.entries(report.errorBreakdown.byCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5),
});

// Custom metrics collection
const errorStats = {
  totalErrors: 150,
  totalRequests: 10000,
  averageResponseTime: 250,
  healthStatus: true,
  authenticationErrors: 5,
  criticalErrors: 2,
  timestamp: new Date().toISOString(),
};

// Check alert conditions
await alertingSystem.checkAlerts(errorStats);
```

## Privacy and Compliance

### 1. Privacy-Compliant Error Tracking

```typescript
import { privacyCompliantTracker } from '@hummbl/core';

// Record user consent
privacyCompliantTracker.recordConsent('user123', 'error_tracking', true);

// Sanitize error data before logging
const errorData = {
  message: 'Payment failed',
  userEmail: 'user@example.com', // PII that will be detected
  creditCard: '4111-1111-1111-1111', // Sensitive data
  stack: error.stack,
};

const sanitized = privacyCompliantTracker.sanitizeErrorData(errorData, 'user123');

console.log('Sanitized data:', sanitized.data);
// Output: { message: 'Payment failed', userEmail: '[EMAIL_REDACTED]', creditCard: '[CARD_REDACTED]', stack: '...' }
```

### 2. Handling Data Subject Requests

```typescript
// Handle GDPR data subject requests
const accessRequest = privacyCompliantTracker.handleDataSubjectRequest(
  'user123',
  'access'
);

const erasureRequest = privacyCompliantTracker.handleDataSubjectRequest(
  'user123',
  'erasure'
);

// Generate compliance report
const complianceReport = privacyCompliantTracker.generateComplianceReport();
console.log('GDPR Compliance:', complianceReport.gdprCompliant);
```

## Workflows and Automation

### 1. Automatic Issue Creation

```typescript
// monitoring/workflow-setup.ts
import { errorReporting } from '../monitoring/error-reporting';
import { errorTracker } from '@hummbl/core';

// Monitor for new errors and create issues automatically
setInterval(async () => {
  const errorStats = errorTracker.getErrorStats();

  // Process each error for potential issue creation
  for (const errorType of errorStats.topErrors) {
    if (errorType.count >= 10) { // Threshold for auto-issue creation
      const trackedError = errorTracker.getError(errorType.id);
      if (trackedError) {
        await errorReporting.processError(trackedError);
      }
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes
```

### 2. Integration with External Services

```typescript
// integrations/slack-notifications.ts
import { alertingSystem } from '../monitoring/error-alerting';

// Custom Slack notification handler
async function sendSlackNotification(message: string, severity: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = severity === 'critical' ? 'danger' :
                severity === 'error' ? 'warning' : 'good';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        text: message,
        fields: [
          { title: 'Severity', value: severity, short: true },
          { title: 'Time', value: new Date().toISOString(), short: true }
        ]
      }]
    })
  });
}

// Trigger manual alert with custom notification
await alertingSystem.triggerManualAlert(
  'Database Connection Pool Exhausted',
  'All database connections are in use. New requests are being queued.',
  AlertSeverity.CRITICAL,
  [AlertChannel.SLACK, AlertChannel.EMAIL]
);
```

## Best Practices

### 1. Error Classification

```typescript
// Always classify errors appropriately
const classifyUserError = (error: Error, context: UserActionContext) => {
  if (error.message.includes('validation')) {
    return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW };
  }

  if (context.isPaymentRelated) {
    return { category: ErrorCategory.SYSTEM, severity: ErrorSeverity.CRITICAL };
  }

  return { category: ErrorCategory.USER_INPUT, severity: ErrorSeverity.MEDIUM };
};
```

### 2. Meaningful Breadcrumbs

```typescript
// Good: Provides clear context
addBreadcrumb('user-action', 'User initiated password reset', 'info', {
  userId: user.id,
  method: 'email',
  timestamp: Date.now()
});

// Bad: Too vague
addBreadcrumb('action', 'Something happened', 'info');
```

### 3. Privacy-First Logging

```typescript
// Good: Log minimal necessary data
trackError(error, metadata, {
  userId: user.id,
  action: 'update-profile',
  // Don't log the actual profile data
});

// Bad: Logs sensitive information
trackError(error, metadata, {
  userId: user.id,
  profileData: user.profile, // Contains PII
});
```

### 4. Error Recovery

```typescript
// Implement graceful degradation
const saveUserPreferences = async (preferences: UserPreferences) => {
  try {
    await api.savePreferences(preferences);
  } catch (error) {
    trackError(error, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.NETWORK,
    });

    // Fallback to local storage
    localStorage.setItem('preferences', JSON.stringify(preferences));

    // Notify user of degraded functionality
    showNotification('Preferences saved locally. Will sync when connection is restored.');
  }
};
```

This comprehensive implementation guide provides the foundation for robust error tracking and monitoring in your HUMMBL application. Remember to customize the configurations based on your specific needs and compliance requirements.