// LocalStorage backup and recovery utility

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    bookmarks: any[];
    notes: any[];
    history: any[];
    preferences: any;
    searchHistory: any[];
    userProfile: any;
  };
  checksum: string;
}

const BACKUP_VERSION = '1.0';
const AUTO_BACKUP_KEY = 'hummbl_auto_backup_enabled';
const LAST_BACKUP_KEY = 'hummbl_last_backup_timestamp';
const AUTO_BACKUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate checksum for data integrity
 */
function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data);
  let hash = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Create backup of all localStorage data
 */
export function createBackup(): BackupData {
  const data = {
    bookmarks: JSON.parse(localStorage.getItem('hummbl_bookmarks') || '[]'),
    notes: JSON.parse(localStorage.getItem('hummbl_notes') || '[]'),
    history: JSON.parse(localStorage.getItem('hummbl_reading_history') || '[]'),
    preferences: JSON.parse(localStorage.getItem('hummbl_preferences') || '{}'),
    searchHistory: JSON.parse(localStorage.getItem('hummbl_search_history') || '[]'),
    userProfile: JSON.parse(localStorage.getItem('hummbl_user_profile') || '{}'),
  };

  const backup: BackupData = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    data,
    checksum: generateChecksum(data),
  };

  // Store last backup timestamp
  localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());

  return backup;
}

/**
 * Download backup as JSON file
 */
export function downloadBackup(): void {
  const backup = createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hummbl-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate backup data
 */
export function validateBackup(backup: BackupData): { valid: boolean; error?: string } {
  // Check version
  if (!backup.version) {
    return { valid: false, error: 'Missing backup version' };
  }

  // Check data structure
  if (!backup.data || typeof backup.data !== 'object') {
    return { valid: false, error: 'Invalid backup data structure' };
  }

  // Verify checksum
  const calculatedChecksum = generateChecksum(backup.data);
  if (backup.checksum !== calculatedChecksum) {
    return { valid: false, error: 'Checksum mismatch - backup may be corrupted' };
  }

  return { valid: true };
}

/**
 * Restore from backup
 */
export function restoreFromBackup(backup: BackupData): { success: boolean; error?: string } {
  // Validate first
  const validation = validateBackup(backup);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Restore each data type
    if (backup.data.bookmarks) {
      localStorage.setItem('hummbl_bookmarks', JSON.stringify(backup.data.bookmarks));
    }

    if (backup.data.notes) {
      localStorage.setItem('hummbl_notes', JSON.stringify(backup.data.notes));
    }

    if (backup.data.history) {
      localStorage.setItem('hummbl_reading_history', JSON.stringify(backup.data.history));
    }

    if (backup.data.preferences) {
      localStorage.setItem('hummbl_preferences', JSON.stringify(backup.data.preferences));
    }

    if (backup.data.searchHistory) {
      localStorage.setItem('hummbl_search_history', JSON.stringify(backup.data.searchHistory));
    }

    if (backup.data.userProfile) {
      localStorage.setItem('hummbl_user_profile', JSON.stringify(backup.data.userProfile));
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Restore failed',
    };
  }
}

/**
 * Import backup from file
 */
export function importBackupFromFile(file: File): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup: BackupData = JSON.parse(content);
        const result = restoreFromBackup(backup);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse backup file',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

/**
 * Check if auto-backup is enabled
 */
export function isAutoBackupEnabled(): boolean {
  return localStorage.getItem(AUTO_BACKUP_KEY) === 'true';
}

/**
 * Enable or disable auto-backup
 */
export function setAutoBackup(enabled: boolean): void {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled.toString());
}

/**
 * Check if auto-backup is due
 */
export function isBackupDue(): boolean {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);

  if (!lastBackup) {
    return true; // Never backed up
  }

  const lastBackupTime = parseInt(lastBackup);
  const now = Date.now();
  const timeSinceBackup = now - lastBackupTime;

  return timeSinceBackup >= AUTO_BACKUP_INTERVAL;
}

/**
 * Get last backup timestamp
 */
export function getLastBackupTimestamp(): Date | null {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);

  if (!lastBackup) {
    return null;
  }

  return new Date(parseInt(lastBackup));
}

/**
 * Initialize auto-backup system
 */
export function initAutoBackup(): void {
  // Check if auto-backup is enabled and due
  if (isAutoBackupEnabled() && isBackupDue()) {
    try {
      downloadBackup();
      console.log('[Backup] Auto-backup completed');
    } catch (error) {
      console.error('[Backup] Auto-backup failed:', error);
    }
  }

  // Set up periodic checks (every hour)
  setInterval(
    () => {
      if (isAutoBackupEnabled() && isBackupDue()) {
        try {
          downloadBackup();
          console.log('[Backup] Auto-backup completed');
        } catch (error) {
          console.error('[Backup] Auto-backup failed:', error);
        }
      }
    },
    60 * 60 * 1000
  ); // 1 hour
}

/**
 * Get backup statistics
 */
export function getBackupStats(): {
  totalItems: number;
  bookmarks: number;
  notes: number;
  historyEntries: number;
  lastBackup: Date | null;
  autoBackupEnabled: boolean;
  backupDue: boolean;
} {
  const data = {
    bookmarks: JSON.parse(localStorage.getItem('hummbl_bookmarks') || '[]'),
    notes: JSON.parse(localStorage.getItem('hummbl_notes') || '[]'),
    history: JSON.parse(localStorage.getItem('hummbl_reading_history') || '[]'),
  };

  return {
    totalItems: data.bookmarks.length + data.notes.length + data.history.length,
    bookmarks: data.bookmarks.length,
    notes: data.notes.length,
    historyEntries: data.history.length,
    lastBackup: getLastBackupTimestamp(),
    autoBackupEnabled: isAutoBackupEnabled(),
    backupDue: isBackupDue(),
  };
}
