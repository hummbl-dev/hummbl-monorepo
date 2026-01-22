import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackEvent,
  trackPageView,
  trackMentalModelViewed,
  trackSearchPerformed,
  trackNarrativeViewed,
  trackBookmarkAdded,
  trackNoteCreated,
  trackExportTriggered,
  trackModalOpened,
  trackCitationClicked,
  trackHeroCTAClicked,
} from '../analytics';

describe('Analytics Edge Cases', () => {
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
    it('should handle empty event object with default values', () => {
      // @ts-expect-error - Testing invalid input
      trackEvent({});
      expect(mockPlausible).toHaveBeenCalledWith(undefined, {
        props: {
          category: 'engagement'
        }
      });
    });

    it('should handle event with just an event name', () => {
      trackEvent({ event: 'test_event' });
      expect(mockPlausible).toHaveBeenCalledWith('test_event', {
        props: {
          category: 'engagement'
        }
      });
    });

    it('should handle very long event names', () => {
      const longEventName = 'a'.repeat(1000);
      trackEvent({ event: longEventName });
      expect(mockPlausible).toHaveBeenCalledWith(longEventName, {
        props: {
          category: 'engagement'
        }
      });
    });

    it('should handle special characters in event properties', () => {
      const specialChars = '!@#$%^&*()_+{}|:\"<>?\'`~';
      trackEvent({
        event: 'special_chars',
        properties: { special: specialChars }
      });
      
      const call = mockPlausible.mock.calls[0];
      expect(call[0]).toBe('special_chars');
      expect(call[1].props.special).toBe(specialChars);
      expect(call[1].props.category).toBe('engagement');
    });
  });

  describe('trackPageView', () => {
    it('should handle undefined route', () => {
      // @ts-expect-error - Testing invalid input
      trackPageView(undefined);
      
      const call = mockPlausible.mock.calls[0];
      expect(call[0]).toBe('page_view');
      expect(call[1].props.category).toBe('engagement');
      expect(call[1].props.path).toBe('/test');
      expect(call[1].props.route).toBeUndefined();
      expect(typeof call[1].props.timestamp).toBe('number');
    });

    it('should handle missing document.title', () => {
      // @ts-expect-error - Testing missing title
      delete window.document.title;
      trackPageView('/test-route');
      expect(mockPlausible).toHaveBeenCalledWith('page_view', {
        props: expect.objectContaining({
          route: '/test-route',
          title: '',
        }),
      });
    });
  });

  describe('trackSearchPerformed', () => {
    it('should handle empty search query', () => {
      trackSearchPerformed('', 0);
      expect(mockPlausible).toHaveBeenCalledWith('search_performed', {
        props: {
          category: 'search',
          query: '',
          results_count: 0,
          has_results: false,
        },
      });
    });

    it('should handle very large result counts', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      trackSearchPerformed('test', largeNumber);
      expect(mockPlausible).toHaveBeenCalledWith('search_performed', {
        props: expect.objectContaining({
          results_count: largeNumber,
          has_results: true,
        }),
      });
    });
  });

  describe('trackMentalModelViewed', () => {
    it('should handle missing model name', () => {
      trackMentalModelViewed('mm-123', '');
      expect(mockPlausible).toHaveBeenCalledWith('mental_model_viewed', {
        props: {
          category: 'content',
          model_code: 'mm-123',
          model_name: '',
          content_type: 'mental_model',
        },
      });
    });
  });

  describe('trackNarrativeViewed', () => {
    it('should handle missing narrative title', () => {
      trackNarrativeViewed('narr-123', '');
      expect(mockPlausible).toHaveBeenCalledWith('narrative_viewed', {
        props: {
          category: 'content',
          narrative_id: 'narr-123',
          narrative_title: '',
          content_type: 'narrative',
        },
      });
    });
  });

  describe('trackBookmarkAdded', () => {
    it('should handle missing item title', () => {
      trackBookmarkAdded('mental_model', 'mm-123');
      expect(mockPlausible).toHaveBeenCalledWith('bookmark_added', {
        props: {
          category: 'user_action',
          item_type: 'mental_model',
          item_id: 'mm-123',
        },
      });
    });
  });

  describe('trackNoteCreated', () => {
    it('should handle missing note length', () => {
      trackNoteCreated('narrative', 'narr-123');
      expect(mockPlausible).toHaveBeenCalledWith('note_created', {
        props: {
          category: 'user_action',
          item_type: 'narrative',
          item_id: 'narr-123',
          note_length: 0,
        },
      });
    });
  });

  describe('trackExportTriggered', () => {
    it('should handle missing content type', () => {
      trackExportTriggered('pdf', 5);
      expect(mockPlausible).toHaveBeenCalledWith('export_triggered', {
        props: {
          category: 'user_action',
          format: 'pdf',
          item_count: 5,
        },
      });
    });
  });

  describe('trackModalOpened', () => {
    it('should handle empty modal type', () => {
      trackModalOpened('');
      expect(mockPlausible).toHaveBeenCalledWith('modal_opened', {
        props: {
          category: 'navigation',
          modal_type: '',
        },
      });
    });
  });

  describe('trackCitationClicked', () => {
    it('should handle missing source', () => {
      trackCitationClicked('book');
      expect(mockPlausible).toHaveBeenCalledWith('citation_clicked', {
        props: {
          category: 'content',
          citation_type: 'book',
        },
      });
    });
  });

  describe('trackHeroCTAClicked', () => {
    it('should handle missing position', () => {
      trackHeroCTAClicked('signup');
      expect(mockPlausible).toHaveBeenCalledWith('cta_clicked', {
        props: {
          category: 'engagement',
          cta_type: 'signup',
          location: 'hero',
        },
      });
    });
  });
});
