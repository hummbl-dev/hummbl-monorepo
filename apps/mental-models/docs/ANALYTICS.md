# Analytics Integration

This document provides guidance on using the analytics utilities in the HUMMBL application.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Available Tracking Methods](#available-tracking-methods)
- [Event Categories](#event-categories)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The analytics module provides a unified interface for tracking user interactions across the application. It supports multiple analytics providers (Plausible and Google Analytics) with a single API.

## Setup

1. **Initialize Analytics**

   In your main application entry point (e.g., `main.tsx` or `App.tsx`), initialize the analytics module:

   ```typescript
   import { initAnalytics } from './utils/analytics';

   // Initialize with default settings
   initAnalytics();
   
   // Or with custom configuration
   initAnalytics({
     debug: process.env.NODE_ENV === 'development',
     trackPageViews: true,
     trackErrors: true,
     sampleRate: 1.0, // 100% of sessions
   });
   ```

## Basic Usage

### Tracking Page Views

```typescript
import { trackPageView } from '../utils/analytics';

// Track a page view with the current route
trackPageView(window.location.pathname, document.title);
```

### Tracking Custom Events

```typescript
import { trackEvent, AnalyticsCategory } from '../utils/analytics';

// Basic event tracking
trackEvent({
  event: 'button_click',
  category: AnalyticsCategory.ENGAGEMENT,
  label: 'Signup Button',
  properties: {
    button_position: 'hero',
    button_color: 'blue',
  },
});
```

## Available Tracking Methods

### Core Functions

- `trackEvent(event: AnalyticsEvent): void` - Track a custom event
- `trackPageView(route: string, title?: string): void` - Track a page view
- `initAnalytics(config?: AnalyticsConfig): void` - Initialize analytics

### Convenience Methods

- `trackMentalModelViewed(modelCode: string, modelName: string): void`
- `trackNarrativeViewed(narrativeId: string, narrativeTitle: string): void`
- `trackSearchPerformed(query: string, resultsCount: number): void`
- `trackFilterApplied(filterType: string, filterValue: string): void`
- `trackBookmarkAdded(itemType: 'mental_model' | 'narrative', itemId: string, itemTitle?: string): void`
- `trackBookmarkRemoved(itemType: 'mental_model' | 'narrative', itemId: string, itemTitle?: string): void`
- `trackNoteCreated(itemType: 'mental_model' | 'narrative', itemId: string, noteLength?: number): void`
- `trackExportTriggered(format: 'json' | 'csv' | 'pdf' | 'markdown', itemCount: number, contentType?: string): void`
- `trackModalOpened(modalType: string): void`
- `trackCitationClicked(citationType: string, source?: string): void`
- `trackHeroCTAClicked(ctaType: string, position?: string): void`

## Event Categories

Use these predefined categories for consistent tracking:

```typescript
import { AnalyticsCategory } from '../utils/analytics';

// Available categories:
AnalyticsCategory.ENGAGEMENT   // User engagement events
AnalyticsCategory.NAVIGATION   // Navigation events
AnalyticsCategory.USER_ACTION  // User actions
AnalyticsCategory.CONTENT      // Content interactions
AnalyticsCategory.SEARCH       // Search-related events
AnalyticsCategory.FEEDBACK     // User feedback
AnalyticsCategory.ERROR        // Error events
```

## Configuration

### `initAnalytics` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | `boolean` | `process.env.NODE_ENV === 'development'` | Enable debug logging |
| `trackPageViews` | `boolean` | `true` | Automatically track page views |
| `trackErrors` | `boolean` | `true` | Track unhandled exceptions |
| `sampleRate` | `number` | `1.0` | Sample rate (0.0 to 1.0) |

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run analytics tests only
npm run test:analytics

# Run analytics edge case tests
npm run test:analytics:edge-cases

# Run tests in watch mode
npm run test:dev

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The analytics module has comprehensive test coverage including:

#### Unit Tests (`analytics.test.ts`)
- Core functionality of all tracking methods
- Event parameter validation and formatting
- Provider initialization and configuration
- Sampling rate implementation
- Error handling for missing providers

#### Edge Case Tests (`analytics.edge-cases.test.ts`)
- Empty or invalid event objects
- Missing or undefined parameters
- Special characters in event properties
- Very long event names and values
- Missing or malformed window/document objects
- Large numeric values and edge cases
- Default values and fallbacks

### Writing Tests

When writing tests for components that use analytics, you can mock the analytics module:

```typescript
import * as analytics from '../utils/analytics';

// In your test setup
vi.mock('../utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  // Mock other functions as needed
}));

// In your test
it('should track button click', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByText('Click me'));
  expect(analytics.trackEvent).toHaveBeenCalledWith({
    event: 'button_click',
    category: 'engagement',
    // ...other expected properties
  });
});

// Test edge cases
it('should handle empty event objects', () => {
  // Test with empty object
  const event = {} as any;
  analytics.trackEvent(event);
  
  // Verify default values are used
  expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
    category: 'engagement'
  }));
});
```

### Testing Edge Cases

When testing analytics, make sure to cover these scenarios:

1. **Missing Required Fields**
   ```typescript
   // Test with missing required fields
   const event = { event: 'test' };
   analytics.trackEvent(event);
   ```

2. **Special Characters**
   ```typescript
   // Test with special characters
   analytics.trackEvent({
     event: 'special_chars',
     properties: { special: '!@#$%^&*()_+{}|:\"<>?\'`~' }
   });
   ```

3. **Very Long Values**
   ```typescript
   // Test with very long values
   const longString = 'a'.repeat(1000);
   analytics.trackEvent({
     event: longString,
     properties: { longValue: longString }
   });
   ```

4. **Missing Providers**
   ```typescript
   // Test when analytics providers are not available
   const originalGtag = window.gtag;
   delete (window as any).gtag;
   
   // Should not throw when providers are missing
   expect(() => analytics.trackEvent({ event: 'test' })).not.toThrow();
   
   // Restore
   window.gtag = originalGtag;
   ```

## Error Handling and Edge Cases

The analytics module is designed to be resilient in the face of errors and edge cases:

### Input Validation
- All tracking functions validate their inputs
- Missing required fields use sensible defaults
- Invalid input types are gracefully handled

### Error Recovery
- Individual provider failures won't break the application
- Errors are logged to the console in development mode
- Failed events don't block application execution

### Performance Considerations
- Events are processed asynchronously
- Large payloads are automatically truncated
- Memory usage is optimized for high-volume event tracking

### Common Issues and Solutions

1. **Events not showing up in analytics dashboard**
   - Verify that the analytics providers are properly initialized
   - Check for any JavaScript errors in the console
   - Ensure the event names match your analytics provider's requirements
   - Check if sampling is enabled and adjust the sample rate if needed

2. **TypeScript errors**
   - Make sure all required properties are provided
   - Check that property types match the expected types
   - Update your TypeScript types if needed
   - Use the `AnalyticsEvent` interface for type safety

3. **Performance issues**
   - Consider enabling sampling for high-volume events
   - Batch events if needed
   - Use the `nonInteraction` flag for non-critical events
   - Monitor memory usage with the browser's performance tools

4. **Testing issues**
   - Make sure to clear mocks between tests
   - Test both successful and error scenarios
   - Verify event payloads match expected formats
   - Check for memory leaks in long-running tests

### Debugging

Enable debug mode to see analytics events in the console:

```typescript
initAnalytics({
  debug: true,
});
```

This will log all analytics events to the console in development mode.
