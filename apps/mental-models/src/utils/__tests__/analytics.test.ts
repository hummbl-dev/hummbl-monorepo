import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackEvent,
  trackPageView,
  trackMentalModelViewed,
  trackSearchPerformed,
  initAnalytics,
  AnalyticsCategory,
} from '../analytics';

describe('Analytics Utilities', () => {
  const originalWindow = { ...window };
  const mockGtag = vi.fn();
  const mockPlausible = vi.fn();

  beforeEach(() => {
    // Mock window object
    global.window = {
      ...originalWindow,
      gtag: mockGtag,
      plausible: mockPlausible,
      location: {
        ...originalWindow.location,
        pathname: '/test',
        href: 'http://localhost:3000/test',
      },
      document: {
        ...originalWindow.document,
        title: 'Test Page',
        referrer: 'http://example.com',
      },
      addEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });

  describe('trackEvent', () => {
    it('should call Plausible with correct parameters', () => {
      const event = {
        event: 'test_event',
        category: 'test_category',
        label: 'test_label',
        value: 42,
        properties: { custom: 'value' },
      };

      trackEvent(event);

      expect(mockPlausible).toHaveBeenCalledWith('test_event', {
        props: {
          category: 'test_category',
          label: 'test_label',
          value: 42,
          custom: 'value',
        },
      });
    });

    it('should call gtag with correct parameters', () => {
      const event = {
        event: 'test_event',
        category: 'test_category',
        label: 'test_label',
        value: 42,
        properties: { custom: 'value' },
      };

      trackEvent(event);

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'test_category',
        event_label: 'test_label',
        value: 42,
        custom: 'value',
        non_interaction: false,
      });
    });

    it('should handle missing analytics providers gracefully', () => {
      // Test with missing providers
      delete (window as any).gtag;
      delete (window as any).plausible;

      const event = { event: 'test_event' };
      expect(() => trackEvent(event)).not.toThrow();
    });
  });

  describe('trackPageView', () => {
    it('should track page view with route and title', () => {
      trackPageView('/test-route', 'Test Page');

      expect(mockPlausible).toHaveBeenCalledWith('page_view', {
        props: expect.objectContaining({
          route: '/test-route',
          title: 'Test Page',
          path: '/test',
        }),
      });
    });
  });

  describe('trackMentalModelViewed', () => {
    it('should track mental model view with code and name', () => {
      trackMentalModelViewed('mm-123', 'Test Model');

      expect(mockPlausible).toHaveBeenCalledWith('mental_model_viewed', {
        props: {
          category: 'content',
          model_code: 'mm-123',
          model_name: 'Test Model',
          content_type: 'mental_model',
        },
      });
    });
  });

  describe('trackSearchPerformed', () => {
    it('should track search with query and result count', () => {
      trackSearchPerformed('test query', 5);

      expect(mockPlausible).toHaveBeenCalledWith('search_performed', {
        props: {
          category: 'search',
          query: 'test query',
          results_count: 5,
          has_results: true,
        },
      });
    });
  });

  describe('initAnalytics', () => {
    it('should initialize with default configuration', () => {
      initAnalytics();
      expect(mockPlausible).toHaveBeenCalled();
      expect(mockGtag).toHaveBeenCalled();
    });

    it('should respect sampling rate', () => {
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.6; // Will be above sample rate of 0.5
      global.Math = mockMath;

      initAnalytics({ sampleRate: 0.5 });
      expect(mockPlausible).not.toHaveBeenCalled();
    });
  });

  describe('AnalyticsCategory', () => {
    it('should have all expected categories', () => {
      expect(AnalyticsCategory).toEqual({
        ENGAGEMENT: 'engagement',
        NAVIGATION: 'navigation',
        USER_ACTION: 'user_action',
        CONTENT: 'content',
        SEARCH: 'search',
        FEEDBACK: 'feedback',
        ERROR: 'error',
      });
    });
  });
});
