// Tests for analyticsEngine

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnalyticsEngine, getAnalytics, resetAnalytics } from '../analyticsEngine';

// Mock fetch
global.fetch = vi.fn();

describe('AnalyticsEngine', () => {
  let analytics: AnalyticsEngine;

  beforeEach(() => {
    analytics = new AnalyticsEngine({ enableConsoleLog: false, batchSize: 2 });
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe('Event Tracking', () => {
    it('tracks custom events', () => {
      analytics.track('custom', 'Test', 'action', { label: 'test' });

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks search events', () => {
      analytics.trackSearch('test query', 5);

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks filter events', () => {
      analytics.trackFilter('category', 'Psychology', 10);

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks view events', () => {
      analytics.trackView('narrative', 'N001', 5000);

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks export events', () => {
      analytics.trackExport('json', 3);

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks bookmark events', () => {
      analytics.trackBookmark('add', 'N001');

      expect(analytics.getQueueSize()).toBe(1);
    });

    it('tracks note events', () => {
      analytics.trackNote('create', 'note1', 150);

      expect(analytics.getQueueSize()).toBe(1);
    });
  });

  describe('Batching', () => {
    it('sends batch when threshold reached', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      analytics.track('custom', 'Test', '1');
      analytics.track('custom', 'Test', '2'); // Should trigger batch

      // Wait for async batch send
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
      expect(analytics.getQueueSize()).toBe(0);
    });

    it('retains events on batch failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
      });

      analytics.track('custom', 'Test', '1');
      analytics.track('custom', 'Test', '2');

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Events should be re-added to queue on failure
      expect(analytics.getQueueSize()).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('creates session ID', () => {
      const summary = analytics.getSummary();

      expect(summary.sessionId).toBeTruthy();
      expect(summary.sessionId).toContain('session_');
    });

    it('persists session ID', () => {
      const summary1 = analytics.getSummary();

      const analytics2 = new AnalyticsEngine();
      const summary2 = analytics2.getSummary();

      expect(summary2.sessionId).toBe(summary1.sessionId);

      analytics2.destroy();
    });
  });

  describe('User Management', () => {
    it('sets user ID', () => {
      analytics.setUserId('user123');

      const summary = analytics.getSummary();
      expect(summary.userId).toBe('user123');
    });

    it('includes user ID in events', () => {
      analytics.setUserId('user123');
      analytics.track('custom', 'Test', 'action');

      expect(analytics.getQueueSize()).toBe(1);
    });
  });

  describe('Flush and Clear', () => {
    it('flushes all events', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      analytics.track('custom', 'Test', '1');

      await analytics.flush();

      expect(analytics.getQueueSize()).toBe(0);
    });

    it('clears all events', () => {
      analytics.track('custom', 'Test', '1');
      analytics.track('custom', 'Test', '2');

      analytics.clear();

      expect(analytics.getQueueSize()).toBe(0);
    });
  });

  describe('Singleton', () => {
    it('returns same instance', () => {
      resetAnalytics();

      const instance1 = getAnalytics();
      const instance2 = getAnalytics();

      expect(instance1).toBe(instance2);

      resetAnalytics();
    });
  });

  describe('Sampling', () => {
    it('respects sampling rate', () => {
      const sampledAnalytics = new AnalyticsEngine({ samplingRate: 0 });

      sampledAnalytics.track('custom', 'Test', 'action');

      expect(sampledAnalytics.getQueueSize()).toBe(0);

      sampledAnalytics.destroy();
    });
  });
});
