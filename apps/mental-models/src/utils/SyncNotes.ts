// SyncNotes: localStorage persistence + backend sync preparation

import type { Note } from '../hooks/useNotes';

export interface SyncConfig {
  endpoint?: string;
  apiKey?: string;
  autoSync?: boolean;
  syncInterval?: number; // milliseconds
}

export interface SyncStatus {
  lastSync: number;
  syncInProgress: boolean;
  pendingChanges: number;
  lastError?: string;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId: string;
  timestamp: number;
  data?: Note;
  synced: boolean;
}

const SYNC_QUEUE_KEY = 'hummbl_sync_queue';
const SYNC_STATUS_KEY = 'hummbl_sync_status';
const SYNCED_NOTES_KEY = 'hummbl_synced_notes';

/**
 * SyncNotes class for managing note synchronization
 */
export class SyncNotes {
  private config: SyncConfig;
  private syncQueue: SyncOperation[] = [];
  private status: SyncStatus;
  private syncInterval?: number;

  constructor(config: SyncConfig = {}) {
    this.config = {
      autoSync: false,
      syncInterval: 60000, // 1 minute default
      ...config,
    };

    this.syncQueue = this.loadSyncQueue();
    this.status = this.loadSyncStatus();

    if (this.config.autoSync && this.config.syncInterval) {
      this.startAutoSync(this.config.syncInterval);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): SyncOperation[] {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
    }
    return [];
  }

  /**
   * Save sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  /**
   * Load sync status from localStorage
   */
  private loadSyncStatus(): SyncStatus {
    try {
      const stored = localStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load sync status:', error);
    }
    return {
      lastSync: 0,
      syncInProgress: false,
      pendingChanges: 0,
    };
  }

  /**
   * Save sync status to localStorage
   */
  private saveSyncStatus(): void {
    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.status));
    } catch (error) {
      console.warn('Failed to save sync status:', error);
    }
  }

  /**
   * Load synced notes metadata
   */
  private loadSyncedNotes(): Record<string, number> {
    try {
      const stored = localStorage.getItem(SYNCED_NOTES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load synced notes:', error);
    }
    return {};
  }

  /**
   * Save synced notes metadata
   */
  private saveSyncedNotes(syncedNotes: Record<string, number>): void {
    try {
      localStorage.setItem(SYNCED_NOTES_KEY, JSON.stringify(syncedNotes));
    } catch (error) {
      console.warn('Failed to save synced notes:', error);
    }
  }

  /**
   * Queue a create operation
   */
  queueCreate(note: Note): void {
    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'create',
      noteId: note.id,
      timestamp: Date.now(),
      data: note,
      synced: false,
    };

    this.syncQueue.push(operation);
    this.status.pendingChanges = this.syncQueue.filter((op) => !op.synced).length;

    this.saveSyncQueue();
    this.saveSyncStatus();
  }

  /**
   * Queue an update operation
   */
  queueUpdate(note: Note): void {
    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'update',
      noteId: note.id,
      timestamp: Date.now(),
      data: note,
      synced: false,
    };

    this.syncQueue.push(operation);
    this.status.pendingChanges = this.syncQueue.filter((op) => !op.synced).length;

    this.saveSyncQueue();
    this.saveSyncStatus();
  }

  /**
   * Queue a delete operation
   */
  queueDelete(noteId: string): void {
    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'delete',
      noteId,
      timestamp: Date.now(),
      synced: false,
    };

    this.syncQueue.push(operation);
    this.status.pendingChanges = this.syncQueue.filter((op) => !op.synced).length;

    this.saveSyncQueue();
    this.saveSyncStatus();
  }

  /**
   * Perform sync with backend
   */
  async sync(): Promise<{ success: boolean; error?: string }> {
    if (this.status.syncInProgress) {
      return { success: false, error: 'Sync already in progress' };
    }

    if (!this.config.endpoint) {
      // No backend configured, mark all as synced locally
      this.syncQueue.forEach((op) => {
        op.synced = true;
      });
      this.status.lastSync = Date.now();
      this.status.pendingChanges = 0;
      this.saveSyncQueue();
      this.saveSyncStatus();
      return { success: true };
    }

    this.status.syncInProgress = true;
    this.saveSyncStatus();

    try {
      const pendingOps = this.syncQueue.filter((op) => !op.synced);

      for (const operation of pendingOps) {
        await this.syncOperation(operation);
      }

      this.status.lastSync = Date.now();
      this.status.pendingChanges = 0;
      this.status.lastError = undefined;
      this.status.syncInProgress = false;

      // Clean up synced operations older than 7 days
      this.syncQueue = this.syncQueue.filter(
        (op) => !op.synced || Date.now() - op.timestamp < 7 * 24 * 60 * 60 * 1000
      );

      this.saveSyncQueue();
      this.saveSyncStatus();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      this.status.lastError = errorMessage;
      this.status.syncInProgress = false;
      this.saveSyncStatus();

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sync a single operation
   */
  private async syncOperation(operation: SyncOperation): Promise<void> {
    if (!this.config.endpoint) {
      operation.synced = true;
      return;
    }

    const url = `${this.config.endpoint}/notes/${operation.type}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const body: Record<string, unknown> = {
      operationId: operation.id,
      noteId: operation.noteId,
      timestamp: operation.timestamp,
    };

    if (operation.type !== 'delete' && operation.data) {
      body.note = operation.data;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    operation.synced = true;

    // Update synced notes metadata
    if (operation.type !== 'delete' && operation.data) {
      const syncedNotes = this.loadSyncedNotes();
      syncedNotes[operation.noteId] = operation.timestamp;
      this.saveSyncedNotes(syncedNotes);
    }
  }

  /**
   * Pull notes from backend
   */
  async pullFromBackend(): Promise<{ success: boolean; notes?: Note[]; error?: string }> {
    if (!this.config.endpoint) {
      return { success: false, error: 'No backend endpoint configured' };
    }

    try {
      const url = `${this.config.endpoint}/notes`;
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`);
      }

      const notes: Note[] = await response.json();

      // Update synced notes metadata
      const syncedNotes = this.loadSyncedNotes();
      notes.forEach((note) => {
        syncedNotes[note.id] = note.updatedAt;
      });
      this.saveSyncedNotes(syncedNotes);

      return { success: true, notes };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pull failed',
      };
    }
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    return this.syncQueue.filter((op) => !op.synced).length;
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    this.status.pendingChanges = 0;
    this.saveSyncQueue();
    this.saveSyncStatus();
  }

  /**
   * Start auto-sync
   */
  startAutoSync(interval: number): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      if (this.getPendingCount() > 0) {
        this.sync();
      }
    }, interval);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Check if note needs sync
   */
  needsSync(noteId: string, localTimestamp: number): boolean {
    const syncedNotes = this.loadSyncedNotes();
    const lastSyncTimestamp = syncedNotes[noteId];

    if (!lastSyncTimestamp) return true;

    return localTimestamp > lastSyncTimestamp;
  }

  /**
   * Export sync data for debugging
   */
  exportSyncData(): string {
    return JSON.stringify(
      {
        queue: this.syncQueue,
        status: this.status,
        syncedNotes: this.loadSyncedNotes(),
      },
      null,
      2
    );
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSync();
  }
}

/**
 * Create singleton instance
 */
let syncInstance: SyncNotes | null = null;

export function getSyncInstance(config?: SyncConfig): SyncNotes {
  if (!syncInstance) {
    syncInstance = new SyncNotes(config);
  }
  return syncInstance;
}

export function resetSyncInstance(): void {
  if (syncInstance) {
    syncInstance.destroy();
    syncInstance = null;
  }
}
