// Backend sync service for notes, bookmarks, and history

import { getAuthService } from './authService';
import type { Note } from '../hooks/useNotes';
import type { Bookmark } from '../hooks/useBookmarks';
import type { ReadingHistoryEntry } from '../hooks/useReadingHistory';

export interface SyncResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface SyncStats {
  lastSync: number;
  itemsSynced: number;
  conflictsResolved: number;
  errors: number;
}

/**
 * Backend Sync Service
 */
export class SyncService {
  private baseUrl: string;
  private authService = getAuthService();

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<SyncResult<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}`,
        timestamp: Date.now(),
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: Date.now(),
    };
  }

  // ==================== NOTES SYNC ====================

  /**
   * Sync notes to backend
   */
  async syncNotes(notes: Note[]): Promise<SyncResult<{ synced: number; conflicts: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/notes/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Fetch notes from backend
   */
  async fetchNotes(since?: number): Promise<SyncResult<Note[]>> {
    try {
      const url = since ? `${this.baseUrl}/notes?since=${since}` : `${this.baseUrl}/notes`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Create note on backend
   */
  async createNote(note: Note): Promise<SyncResult<Note>> {
    try {
      const response = await fetch(`${this.baseUrl}/notes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(note),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Update note on backend
   */
  async updateNote(noteId: string, updates: Partial<Note>): Promise<SyncResult<Note>> {
    try {
      const response = await fetch(`${this.baseUrl}/notes/${noteId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Delete note on backend
   */
  async deleteNote(noteId: string): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/notes/${noteId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
        timestamp: Date.now(),
      };
    }
  }

  // ==================== BOOKMARKS SYNC ====================

  /**
   * Sync bookmarks to backend
   */
  async syncBookmarks(
    bookmarks: Bookmark[]
  ): Promise<SyncResult<{ synced: number; conflicts: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/bookmarks/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ bookmarks }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Fetch bookmarks from backend
   */
  async fetchBookmarks(since?: number): Promise<SyncResult<Bookmark[]>> {
    try {
      const url = since ? `${this.baseUrl}/bookmarks?since=${since}` : `${this.baseUrl}/bookmarks`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Create bookmark on backend
   */
  async createBookmark(bookmark: Bookmark): Promise<SyncResult<Bookmark>> {
    try {
      const response = await fetch(`${this.baseUrl}/bookmarks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookmark),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Delete bookmark on backend
   */
  async deleteBookmark(bookmarkId: string): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
        timestamp: Date.now(),
      };
    }
  }

  // ==================== HISTORY SYNC ====================

  /**
   * Sync reading history to backend
   */
  async syncHistory(history: ReadingHistoryEntry[]): Promise<SyncResult<{ synced: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/history/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ history }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Fetch reading history from backend
   */
  async fetchHistory(since?: number): Promise<SyncResult<ReadingHistoryEntry[]>> {
    try {
      const url = since ? `${this.baseUrl}/history?since=${since}` : `${this.baseUrl}/history`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
        timestamp: Date.now(),
      };
    }
  }

  // ==================== BULK SYNC ====================

  /**
   * Sync all user data
   */
  async syncAll(data: {
    notes?: Note[];
    bookmarks?: Bookmark[];
    history?: ReadingHistoryEntry[];
  }): Promise<SyncResult<SyncStats>> {
    const stats: SyncStats = {
      lastSync: Date.now(),
      itemsSynced: 0,
      conflictsResolved: 0,
      errors: 0,
    };

    try {
      // Sync notes
      if (data.notes) {
        const notesResult = await this.syncNotes(data.notes);
        if (notesResult.success && notesResult.data) {
          stats.itemsSynced += notesResult.data.synced;
          stats.conflictsResolved += notesResult.data.conflicts;
        } else {
          stats.errors++;
        }
      }

      // Sync bookmarks
      if (data.bookmarks) {
        const bookmarksResult = await this.syncBookmarks(data.bookmarks);
        if (bookmarksResult.success && bookmarksResult.data) {
          stats.itemsSynced += bookmarksResult.data.synced;
          stats.conflictsResolved += bookmarksResult.data.conflicts;
        } else {
          stats.errors++;
        }
      }

      // Sync history
      if (data.history) {
        const historyResult = await this.syncHistory(data.history);
        if (historyResult.success && historyResult.data) {
          stats.itemsSynced += historyResult.data.synced;
        } else {
          stats.errors++;
        }
      }

      return {
        success: stats.errors === 0,
        data: stats,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Pull all user data from backend
   */
  async pullAll(since?: number): Promise<
    SyncResult<{
      notes: Note[];
      bookmarks: Bookmark[];
      history: ReadingHistoryEntry[];
    }>
  > {
    try {
      const [notesResult, bookmarksResult, historyResult] = await Promise.all([
        this.fetchNotes(since),
        this.fetchBookmarks(since),
        this.fetchHistory(since),
      ]);

      if (!notesResult.success || !bookmarksResult.success || !historyResult.success) {
        return {
          success: false,
          error: 'Failed to pull some data',
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: {
          notes: notesResult.data || [],
          bookmarks: bookmarksResult.data || [],
          history: historyResult.data || [],
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pull failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Singleton instance
 */
let syncServiceInstance: SyncService | null = null;

export function getSyncService(baseUrl?: string): SyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService(baseUrl);
  }
  return syncServiceInstance;
}

export function resetSyncService(): void {
  syncServiceInstance = null;
}
