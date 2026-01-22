// Backup settings component

import { useState, useEffect } from 'react';
import {
  downloadBackup,
  importBackupFromFile,
  isAutoBackupEnabled,
  setAutoBackup,
  getBackupStats,
} from '../../utils/backupManager';
import './BackupSettings.css';

export const BackupSettings: React.FC = () => {
  const [autoBackup, setAutoBackupState] = useState(isAutoBackupEnabled());
  const [stats, setStats] = useState(getBackupStats());
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Refresh stats every minute
    const interval = setInterval(() => {
      setStats(getBackupStats());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadBackup = () => {
    try {
      downloadBackup();
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
      setStats(getBackupStats());

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const result = await importBackupFromFile(file);

      if (result.success) {
        setMessage({ type: 'success', text: 'Backup restored successfully!' });
        setStats(getBackupStats());

        // Reload page after 2 seconds to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to restore backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to read backup file' });
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleAutoBackup = () => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    setAutoBackupState(newValue);
    setStats(getBackupStats());

    setMessage({
      type: 'success',
      text: newValue ? 'Auto-backup enabled' : 'Auto-backup disabled',
    });

    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="backup-settings">
      <div className="backup-header">
        <h2>Backup & Recovery</h2>
        <p>Protect your data by creating regular backups</p>
      </div>

      {message && (
        <div className={`backup-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      <div className="backup-stats">
        <div className="backup-stat">
          <span className="stat-value">{stats.totalItems}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="backup-stat">
          <span className="stat-value">{stats.bookmarks}</span>
          <span className="stat-label">Bookmarks</span>
        </div>
        <div className="backup-stat">
          <span className="stat-value">{stats.notes}</span>
          <span className="stat-label">Notes</span>
        </div>
        <div className="backup-stat">
          <span className="stat-value">{stats.historyEntries}</span>
          <span className="stat-label">History</span>
        </div>
      </div>

      <div className="backup-section">
        <h3>Manual Backup</h3>
        <p>Download a backup of all your data as a JSON file</p>

        <div className="backup-actions">
          <button className="backup-btn primary" onClick={handleDownloadBackup}>
            📥 Download Backup
          </button>

          <label className="backup-btn secondary">
            📤 Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="backup-info">
          <strong>Last backup:</strong> {formatDate(stats.lastBackup)}
        </div>
      </div>

      <div className="backup-section">
        <h3>Auto-Backup</h3>
        <p>Automatically download a backup every 7 days</p>

        <div className="backup-toggle">
          <label className="toggle-switch">
            <input type="checkbox" checked={autoBackup} onChange={handleToggleAutoBackup} />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">{autoBackup ? 'Enabled' : 'Disabled'}</span>
        </div>

        {stats.backupDue && autoBackup && (
          <div className="backup-warning">
            ⚠️ Backup is overdue. Click "Download Backup" to create one now.
          </div>
        )}
      </div>

      <div className="backup-section">
        <h3>Backup Format</h3>
        <p>Backups are stored in JSON format and include:</p>
        <ul>
          <li>Bookmarks and collections</li>
          <li>Personal notes</li>
          <li>Reading history</li>
          <li>Search history</li>
          <li>User preferences</li>
          <li>User profile data</li>
        </ul>
        <p className="backup-note">
          <strong>Note:</strong> Backup files contain a checksum to verify data integrity.
        </p>
      </div>
    </div>
  );
};
