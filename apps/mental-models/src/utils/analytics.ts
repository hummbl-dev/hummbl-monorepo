// Analytics utility for tracking user behavior
// Supports Plausible Analytics (privacy-first) and Google Analytics 4

/**
 * Type definition for Google Analytics gtag.js event parameters
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */
type GTagEvent = {
  /** The event's category (e.g. 'Video', 'User Engagement') */
  event_category?: string;
  /** The event's label (e.g. 'Fall Campaign', 'Summer Sale') */
  event_label?: string;
  /** A numeric value associated with the event (e.g. 42) */
  value?: number;
  /** If true, the event will not be used in engagement metrics */
  non_interaction?: boolean;
  /** Additional event parameters */
  [key: string]: unknown;
};

declare global {
  interface Window {
    /**
     * Plausible Analytics function
     * @see https://plausible.io/docs/plausible-script
     */
    plausible?: (
      event: string,
      options?: { 
        /** Event properties to be sent to Plausible */
        props?: Record<string, string | number | boolean> 
      }
    ) => void;
    
    /**
     * Google Analytics gtag.js function
     * @see https://developers.google.com/analytics/devguides/collection/gtagjs
     */
    gtag?: (
      command: 'config' | 'set' | 'event',
      target: string,
      config?: string | GTagEvent | Record<string, unknown>
    ) => void;
  }
}

/**
 * Represents an analytics event to be tracked
 */
export interface AnalyticsEvent {
  /** The name of the event (e.g., 'page_view', 'button_click') */
  event: string;
  
  /** Category of the event (e.g., 'engagement', 'navigation') */
  category?: string;
  
  /** Label for the event (e.g., 'hero_banner', 'footer_link') */
  label?: string;
  
  /** Numeric value associated with the event (e.g., purchase amount) */
  value?: number;
  
  /** If true, the event won't affect bounce rate calculations */
  nonInteraction?: boolean;
  
  /** Additional properties to include with the event */
  properties?: Record<string, string | number | boolean>;
}

/**
 * Safely logs analytics events to the console in development
 */
const logAnalyticsEvent = (event: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.debug('[Analytics]', event, data);
  }
};

/**
 * Track analytics event
 * @param event The analytics event to track
 * @returns void
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  const { 
    event: eventName, 
    category = 'engagement',
    label,
    value,
    nonInteraction = false,
    properties = {}
  } = event;

  try {
    // Plausible Analytics (privacy-first)
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible(eventName, { 
          props: { 
            ...properties,
            ...(category && { category }),
            ...(label && { label }),
            ...(value !== undefined && { value })
          } 
        });
      } catch (error) {
        console.error('Error tracking with Plausible:', error);
      }
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        const gtagEvent: GTagEvent = {
          event_category: category,
          ...(label && { event_label: label }),
          ...(value !== undefined && { value }),
          non_interaction: nonInteraction,
          ...properties
        };
        
        window.gtag('event', eventName, gtagEvent);
      } catch (error) {
        console.error('Error tracking with Google Analytics:', error);
      }
    }

    logAnalyticsEvent(eventName, { category, label, value, properties });
  } catch (error) {
    console.error('Error in trackEvent:', error);
    // Optionally report to error tracking service
  }
};

/**
 * Track page view
 * @param route The current route/path of the page
 * @param title Optional page title
 */
export const trackPageView = (
  route: string, 
  title: string = document.title
): void => {
  trackEvent({
    event: 'page_view',
    category: 'engagement',
    label: title,
    properties: {
      route,
      path: window.location.pathname,
      referrer: document.referrer,
      title,
      timestamp: Date.now(),
    },
  });
};

/**
 * Standard event categories for consistent tracking across the application.
 * These categories help organize and filter events in analytics dashboards.
 */
export const AnalyticsCategory = {
  /** User engagement events (e.g., clicks, interactions) */
  ENGAGEMENT: 'engagement',
  
  /** Navigation events (e.g., page views, route changes) */
  NAVIGATION: 'navigation',
  
  /** User-initiated actions (e.g., form submissions, button clicks) */
  USER_ACTION: 'user_action',
  
  /** Content-related events (e.g., viewing articles, videos) */
  CONTENT: 'content',
  
  /** Search-related events (e.g., search queries, filters) */
  SEARCH: 'search',
  
  /** User feedback (e.g., ratings, surveys) */
  FEEDBACK: 'feedback',
  
  /** Error events (e.g., failed API calls, exceptions) */
  ERROR: 'error',
} as const;

/**
 * Type representing all possible analytics category values
 */
type AnalyticsCategoryType = typeof AnalyticsCategory[keyof typeof AnalyticsCategory];


/**
 * Track when a user views a mental model
 * @param modelCode - Unique identifier for the mental model
 * @param modelName - Human-readable name of the mental model
 * @example
 * ```typescript
 * trackMentalModelViewed('first-principles', 'First Principles Thinking');
 * ```
 */
export const trackMentalModelViewed = (modelCode: string, modelName: string): void => {
  trackEvent({
    event: 'mental_model_viewed',
    category: AnalyticsCategory.CONTENT,
    properties: {
      model_code: modelCode,
      model_name: modelName,
      content_type: 'mental_model',
    },
  });
};

/**
 * Track when a user views a narrative
 * @param narrativeId - Unique identifier for the narrative
 * @param narrativeTitle - Human-readable title of the narrative
 * @example
 * ```typescript
 * trackNarrativeViewed('intro-to-systems-thinking', 'Introduction to Systems Thinking');
 * ```
 */
export const trackNarrativeViewed = (narrativeId: string, narrativeTitle: string): void => {
  trackEvent({
    event: 'narrative_viewed',
    category: AnalyticsCategory.CONTENT,
    properties: {
      narrative_id: narrativeId,
      narrative_title: narrativeTitle,
      content_type: 'narrative',
    },
  });
};

/**
 * Track when a user performs a search
 * @param query - The search query text
 * @param resultsCount - Number of results returned
 * @example
 * ```typescript
 * // When user searches for 'mental models' and gets 15 results
 * trackSearchPerformed('mental models', 15);
 * ```
 */
export const trackSearchPerformed = (query: string, resultsCount: number): void => {
  trackEvent({
    event: 'search_performed',
    category: AnalyticsCategory.SEARCH,
    properties: {
      query: query.trim(),
      results_count: resultsCount,
      has_results: resultsCount > 0,
    },
  });
};

/**
 * Track when a user applies a filter
 * @param filterType - Type of filter applied (e.g., 'category', 'difficulty')
 * @param filterValue - Value of the applied filter
 * @example
 * ```typescript
 * // When user filters by category 'psychology'
 * trackFilterApplied('category', 'psychology');
 * ```
 */
export const trackFilterApplied = (filterType: string, filterValue: string): void => {
  trackEvent({
    event: 'filter_applied',
    category: AnalyticsCategory.NAVIGATION,
    properties: {
      filter_type: filterType,
      filter_value: filterValue,
    },
  });
};

/**
 * Track when a user bookmarks an item
 * @param itemType - Type of the bookmarked item ('mental_model' or 'narrative')
 * @param itemId - Unique identifier of the bookmarked item
 * @param itemTitle - Optional title of the bookmarked item
 * @example
 * ```typescript
 * // When user bookmarks a mental model
 * trackBookmarkAdded('mental_model', 'first-principles', 'First Principles Thinking');
 * ```
 */
export const trackBookmarkAdded = (
  itemType: 'mental_model' | 'narrative',
  itemId: string,
  itemTitle?: string
): void => {
  trackEvent({
    event: 'bookmark_added',
    category: AnalyticsCategory.USER_ACTION,
    properties: {
      item_type: itemType,
      item_id: itemId,
      ...(itemTitle && { item_title: itemTitle }),
    },
  });
};

/**
 * Track when a user removes a bookmark
 * @param itemType - Type of the unbookmarked item ('mental_model' or 'narrative')
 * @param itemId - Unique identifier of the unbookmarked item
 * @param itemTitle - Optional title of the unbookmarked item
 * @example
 * ```typescript
 * // When user removes a bookmark from a narrative
 * trackBookmarkRemoved('narrative', 'intro-to-systems-thinking');
 * ```
 */
export const trackBookmarkRemoved = (
  itemType: 'mental_model' | 'narrative',
  itemId: string,
  itemTitle?: string
): void => {
  trackEvent({
    event: 'bookmark_removed',
    category: AnalyticsCategory.USER_ACTION,
    properties: {
      item_type: itemType,
      item_id: itemId,
      ...(itemTitle && { item_title: itemTitle }),
    },
  });
};

/**
 * Track when a user creates a note
 * @param itemType - Type of item the note is associated with
 * @param itemId - Unique identifier of the item
 * @param noteLength - Length of the note in characters (default: 0)
 * @example
 * ```typescript
 * // When user creates a 42-character note on a mental model
 * trackNoteCreated('mental_model', 'first-principles', 42);
 * ```
 */
export const trackNoteCreated = (
  itemType: 'mental_model' | 'narrative', 
  itemId: string,
  noteLength: number = 0
): void => {
  trackEvent({
    event: 'note_created',
    category: AnalyticsCategory.USER_ACTION,
    properties: {
      item_type: itemType,
      item_id: itemId,
      note_length: noteLength,
    },
  });
};

/**
 * Track when a user triggers an export
 * @param format - Export format ('json', 'csv', 'pdf', or 'markdown')
 * @param itemCount - Number of items being exported
 * @param contentType - Optional content type being exported
 * @example
 * ```typescript
 * // When user exports 3 mental models as PDF
 * trackExportTriggered('pdf', 3, 'mental_models');
 * ```
 */
export const trackExportTriggered = (
  format: 'json' | 'csv' | 'pdf' | 'markdown',
  itemCount: number,
  contentType?: string
): void => {
  trackEvent({
    event: 'export_triggered',
    category: AnalyticsCategory.USER_ACTION,
    properties: {
      format,
      item_count: itemCount,
      ...(contentType && { content_type: contentType }),
    },
  });
};

/**
 * Track when a modal dialog is opened
 * @param modalType - Type/identifier of the modal (e.g., 'login', 'settings')
 * @example
 * ```typescript
 * // When user opens the settings modal
 * trackModalOpened('settings');
 * ```
 */
export const trackModalOpened = (modalType: string): void => {
  trackEvent({
    event: 'modal_opened',
    category: AnalyticsCategory.NAVIGATION,
    properties: {
      modal_type: modalType,
    },
  });
};

/**
 * Track when a user clicks on a citation
 * @param citationType - Type of citation (e.g., 'book', 'article', 'study')
 * @param source - Optional source identifier or URL
 * @example
 * ```typescript
 * // When user clicks on a book citation
 * trackCitationClicked('book', 'Thinking, Fast and Slow');
 * ```
 */
export const trackCitationClicked = (citationType: string, source?: string): void => {
  trackEvent({
    event: 'citation_clicked',
    category: AnalyticsCategory.CONTENT,
    properties: {
      citation_type: citationType,
      ...(source && { source }),
    },
  });
};

/**
 * Track when a user clicks a call-to-action in the hero section
 * @param ctaType - Type of CTA (e.g., 'signup', 'learn_more', 'get_started')
 * @param position - Optional position of the CTA (e.g., 'top', 'bottom')
 * @example
 * ```typescript
 * // When user clicks the main signup button in the hero
 * trackHeroCTAClicked('signup', 'center');
 * ```
 */
export const trackHeroCTAClicked = (ctaType: string, position?: string): void => {
  trackEvent({
    event: 'cta_clicked',
    category: AnalyticsCategory.ENGAGEMENT,
    properties: {
      cta_type: ctaType,
      ...(position && { position }),
      location: 'hero',
    },
  });
};

/**
 * Configuration options for the analytics module
 */
interface AnalyticsConfig {
  /** 
   * Enable debug mode to log events to console
   * @default false in production, true in development
   */
  debug?: boolean;
  
  /** 
   * Automatically track page views
   * @default true
   */
  trackPageViews?: boolean;
  
  /** 
   * Automatically track unhandled errors
   * @default true
   */
  trackErrors?: boolean;
  
  /** 
   * Sample rate for events (0.0 to 1.0)
   * @default 1.0 (100% of events)
   */
  sampleRate?: number;
}

/**
 * Initialize analytics with optional configuration
 * @param config - Analytics configuration options
 */
export const initAnalytics = (config: AnalyticsConfig = {}): void => {
  const {
    debug = import.meta.env.DEV,
    trackPageViews = true,
    trackErrors = true,
    sampleRate = 1.0,
  } = config;

  // Skip if sampling rate is 0 or we're not in a browser
  if (typeof window === 'undefined' || Math.random() > sampleRate) {
    return;
  }

  try {
    // Initialize Plausible if available
    if (window.plausible) {
      if (debug) {
        console.debug('[Analytics] Plausible Analytics initialized');
      }
    }

    // Initialize Google Analytics if available
    if (window.gtag) {
      if (debug) {
        console.debug('[Analytics] Google Analytics initialized');
      }
    }

    // Track initial page view if enabled
    if (trackPageViews) {
      trackPageView(window.location.pathname);
    }

    // Global error tracking if enabled
    if (trackErrors && window.addEventListener) {
      window.addEventListener('error', (event) => {
        trackEvent({
          event: 'error_occurred',
          category: AnalyticsCategory.ERROR,
          properties: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.toString(),
          },
        });
      });
    }
  } catch (error) {
    console.error('[Analytics] Initialization error:', error);
  }
};
