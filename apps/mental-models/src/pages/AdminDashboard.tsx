// Basic admin dashboard for content management

import { useState, useEffect } from 'react';
import { getVersionHistory, createChangeLog } from '../utils/versionControl';
import type { ContentVersion } from '../types/content';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [changeLog, setChangeLog] = useState<string>('');
  const [stats, setStats] = useState({
    totalVersions: 0,
    contentItems: 0,
    recentChanges: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load all versions
    const allVersions = getAllVersions();
    setVersions(allVersions);

    // Generate change log
    const log = createChangeLog(allVersions);
    setChangeLog(log);

    // Calculate stats
    const uniqueContent = new Set(allVersions.map((v) => v.content_id));
    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentChanges = allVersions.filter(
      (v) => new Date(v.timestamp).getTime() > last7Days
    ).length;

    setStats({
      totalVersions: allVersions.length,
      contentItems: uniqueContent.size,
      recentChanges,
    });
  };

  const getAllVersions = (): ContentVersion[] => {
    try {
      const stored = localStorage.getItem('hummbl_content_versions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load versions:', error);
      return [];
    }
  };

  const downloadChangeLog = () => {
    const blob = new Blob([changeLog], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Content management and version control</p>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.contentItems}</div>
          <div className="stat-label">Content Items</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalVersions}</div>
          <div className="stat-label">Total Versions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.recentChanges}</div>
          <div className="stat-label">Changes (7 days)</div>
        </div>
      </div>

      <section className="admin-section">
        <h2>Recent Changes</h2>
        <div className="version-list">
          {versions.slice(0, 10).map((version) => (
            <div key={version.id} className="version-item">
              <div className="version-header">
                <span className="version-number">v{version.version}</span>
                <span className="version-content">{version.content_id}</span>
                <span className="version-date">
                  {new Date(version.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="version-changes">
                {version.changes.map((change, i) => (
                  <span key={i} className="change-badge">
                    {change}
                  </span>
                ))}
              </div>
              <div className="version-meta">
                <span>By {version.author}</span>
                {version.approved && <span className="approved-badge">✓ Approved</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>Change Log</h2>
          <button onClick={downloadChangeLog} className="download-btn">
            Download
          </button>
        </div>
        <pre className="changelog-preview">{changeLog}</pre>
      </section>

      <section className="admin-section">
        <h2>Content Quality Metrics</h2>
        <div className="quality-grid">
          <div className="quality-card">
            <h3>Mental Models</h3>
            <p className="quality-value">~120</p>
            <p className="quality-label">Total models</p>
          </div>

          <div className="quality-card">
            <h3>Narratives</h3>
            <p className="quality-value">6</p>
            <p className="quality-label">Published narratives</p>
          </div>

          <div className="quality-card">
            <h3>Coverage</h3>
            <p className="quality-value">11</p>
            <p className="quality-label">Categories</p>
          </div>

          <div className="quality-card">
            <h3>Avg Quality</h3>
            <p className="quality-value">High</p>
            <p className="quality-label">Evidence quality</p>
          </div>
        </div>
      </section>
    </div>
  );
};
