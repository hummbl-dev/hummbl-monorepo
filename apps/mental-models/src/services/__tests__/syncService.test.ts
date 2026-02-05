// Tests for syncService

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncService } from '../syncService';

// Mock fetch
global.fetch = vi.fn();

describe('SyncService', () => {
  let syncService: SyncService;

  beforeEach(() => {
    syncService = new SyncService('/api');
    vi.clearAllMocks();
  });

  describe('syncNotes', () => {
    it('syncs notes successfully', async () => {
      const mockNotes = [
        {
          id: 'n1',
          type: 'narrative' as const,
          itemId: 'N001',
          itemTitle: 'Test',
          content: 'Note',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 1, conflicts: 0 }),
      });

      const result = await syncService.syncNotes(mockNotes);

      expect(result.success).toBe(true);
      expect(result.data?.synced).toBe(1);
    });

    it('handles sync errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await syncService.syncNotes([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('syncBookmarks', () => {
    it('syncs bookmarks successfully', async () => {
      const mockBookmarks = [
        {
          id: 'b1',
          type: 'narrative' as const,
          itemId: 'N001',
          title: 'Test',
          addedAt: Date.now(),
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 1, conflicts: 0 }),
      });

      const result = await syncService.syncBookmarks(mockBookmarks);

      expect(result.success).toBe(true);
    });
  });

  describe('syncAll', () => {
    it('syncs all data types', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ synced: 1, conflicts: 0 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ synced: 1, conflicts: 0 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ synced: 1 }) });

      const result = await syncService.syncAll({
        notes: [],
        bookmarks: [],
        history: [],
      });

      expect(result.success).toBe(true);
      expect(result.data?.itemsSynced).toBeGreaterThanOrEqual(0);
    });
  });

  describe('healthCheck', () => {
    it('returns true when healthy', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      const healthy = await syncService.healthCheck();

      expect(healthy).toBe(true);
    });

    it('returns false on error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed'));

      const healthy = await syncService.healthCheck();

      expect(healthy).toBe(false);
    });
  });
});
