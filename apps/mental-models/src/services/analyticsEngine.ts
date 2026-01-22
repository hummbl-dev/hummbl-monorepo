// Advanced analytics engine with event tracking

export type EventType =
  | 'search'
  | 'filter'
  | 'view'
  | 'export'
  | 'bookmark'
  | 'note_create'
  | 'note_update'
  | 'note_delete'
  | 'share'
  | 'click'
  | 'scroll'
  | 'custom';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface EventBatch {
  events: AnalyticsEvent[];
  timestamp: number;
}

export interface AnalyticsConfig {
  endpoint?: string;
  batchSize?: number;
  batchInterval?: number;
  enableConsoleLog?: boolean;
  enableLocalStorage?: boolean;
  samplingRate?: number; // 0-1, 1 = track all events
}

const DEFAULT_CONFIG: Required<AnalyticsConfig> = {
  endpoint: '/api/analytics/events',
  batchSize: 10,
  batchInterval: 5000, // 5 seconds
  enableConsoleLog: false,
  enableLocalStorage: true,
  samplingRate: 1.0,
};

const EVENTS_KEY = 'hummbl_analytics_events';
const SESSION_KEY = 'hummbl_session_id';

/**
 * Analytics Engine
 */
export class AnalyticsEngine {
  private config: Required<AnalyticsConfig>;
  private eventQueue: AnalyticsEvent[] = [];
  private batchTimer?: number;
  private sessionId: string;
  private userId?: string;

  constructor(config: AnalyticsConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.getOrCreateSessionId();

    // Load any persisted events
    if (this.config.enableLocalStorage) {
      this.loadPersistedEvents();
    }

    // Start batch timer
    this.startBatchTimer();
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | undefined): void {
    this.userId = userId;
  }

  /**
   * Track event
   */
  track(
    type: EventType,
    category: string,
    action: string,
    options?: {
      label?: string;
      value?: number;
      metadata?: Record<string, unknown>;
    }
  ): void {
    // Sampling
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      action,
      label: options?.label,
      value: options?.value,
      metadata: options?.metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Console log if enabled
    if (this.config.enableConsoleLog) {
      console.log('[Analytics]', event);
    }

    // Add to queue
    this.eventQueue.push(event);

    // Persist if enabled
    if (this.config.enableLocalStorage) {
      this.persistEvents();
    }

    // Send batch if threshold reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendBatch();
    }
  }

  /**
   * Track search event
   */
  trackSearch(query: string, resultCount: number, metadata?: Record<string, unknown>): void {
    this.track('search', 'Search', 'query', {
      label: query,
      value: resultCount,
      metadata,
    });
  }

  /**
   * Track filter event
   */
  trackFilter(filterType: string, filterValue: string, resultCount: number): void {
    this.track('filter', 'Filter', filterType, {
      label: filterValue,
      value: resultCount,
    });
  }

  /**
   * Track view event
   */
  trackView(itemType: 'narrative' | 'mentalModel', itemId: string, duration?: number): void {
    this.track('view', 'Content', `view_${itemType}`, {
      label: itemId,
      value: duration,
    });
  }

  /**
   * Track export event
   */
  trackExport(format: string, itemCount: number): void {
    this.track('export', 'Export', `export_${format}`, {
      value: itemCount,
    });
  }

  /**
   * Track bookmark event
   */
  trackBookmark(action: 'add' | 'remove', itemId: string): void {
    this.track('bookmark', 'Bookmark', action, {
      label: itemId,
    });
  }

  /**
   * Track note event
   */
  trackNote(action: 'create' | 'update' | 'delete', noteId: string, contentLength?: number): void {
    const eventType = `note_${action}` as EventType;
    this.track(eventType, 'Note', action, {
      label: noteId,
      value: contentLength,
    });
  }

  /**
   * Track click event
   */
  trackClick(element: string, metadata?: Record<string, unknown>): void {
    this.track('click', 'Interaction', 'click', {
      label: element,
      metadata,
    });
  }

  /**
   * Track scroll event
   */
  trackScroll(depth: number, page: string): void {
    this.track('scroll', 'Interaction', 'scroll', {
      label: page,
      value: depth,
    });
  }

  /**
   * Track custom event
   */
  trackCustom(
    category: string,
    action: string,
    options?: {
      label?: string;
      value?: number;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.track('custom', category, action, options);
  }

  /**
   * Send batch of events
   */
  private async sendBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const batch: EventBatch = {
      events: [...this.eventQueue],
      timestamp: Date.now(),
    };

    // Clear queue immediately
    this.eventQueue = [];

    // Clear persisted events
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(EVENTS_KEY);
    }

    // Send to backend
    if (this.config.endpoint) {
      try {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          console.warn('[Analytics] Failed to send batch:', response.statusText);
          // Re-add events to queue on failure
          this.eventQueue.push(...batch.events);
        }
      } catch (error) {
        console.warn('[Analytics] Error sending batch:', error);
        // Re-add events to queue on error
        this.eventQueue.push(...batch.events);
      }
    }
  }

  /**
   * Start batch timer
   */
  private startBatchTimer(): void {
    this.batchTimer = window.setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendBatch();
      }
    }, this.config.batchInterval);
  }

  /**
   * Stop batch timer
   */
  private stopBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Persist events to localStorage
   */
  private persistEvents(): void {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      console.warn('[Analytics] Failed to persist events:', error);
    }
  }

  /**
   * Load persisted events from localStorage
   */
  private loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        const events = JSON.parse(stored);
        this.eventQueue.push(...events);
      }
    } catch (error) {
      console.warn('[Analytics] Failed to load persisted events:', error);
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Flush all events immediately
   */
  async flush(): Promise<void> {
    await this.sendBatch();
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.eventQueue = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(EVENTS_KEY);
    }
  }

  /**
   * Get analytics summary
   */
  getSummary(): {
    queueSize: number;
    sessionId: string;
    userId?: string;
  } {
    return {
      queueSize: this.eventQueue.length,
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopBatchTimer();
    this.flush().catch((error) => {
      console.warn('[Analytics] Error flushing on destroy:', error);
    });
  }
}

/**
 * Singleton instance
 */
let analyticsInstance: AnalyticsEngine | null = null;

export function getAnalytics(config?: AnalyticsConfig): AnalyticsEngine {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsEngine(config);
  }
  return analyticsInstance;
}

export function resetAnalytics(): void {
  if (analyticsInstance) {
    analyticsInstance.destroy();
    analyticsInstance = null;
  }
}

/**
 * Initialize analytics on app load
 */
export function initializeAnalytics(config?: AnalyticsConfig): AnalyticsEngine {
  const analytics = getAnalytics(config);

  // Track page load
  analytics.trackCustom('App', 'load');

  // Track page unload
  window.addEventListener('beforeunload', () => {
    analytics.flush().catch(() => {
      // Ignore errors on unload
    });
  });

  return analytics;
}
