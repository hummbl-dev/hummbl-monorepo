// Content version control utilities

import type { ContentVersion, VersionDiff, ContentChange } from '../types/content';

const VERSION_HISTORY_KEY = 'hummbl_content_versions';

/**
 * Get version history for a content item
 */
export function getVersionHistory(contentId: string): ContentVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    if (!stored) return [];

    const allVersions: ContentVersion[] = JSON.parse(stored);
    return allVersions.filter((v) => v.content_id === contentId);
  } catch (error) {
    console.error('Failed to load version history:', error);
    return [];
  }
}

/**
 * Save version to history
 */
export function saveVersion(version: ContentVersion): void {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    const allVersions: ContentVersion[] = stored ? JSON.parse(stored) : [];

    // Add new version
    allVersions.push(version);

    // Keep only last 50 versions per content item
    const contentVersions = allVersions.filter((v) => v.content_id === version.content_id);
    if (contentVersions.length > 50) {
      const toKeep = contentVersions.slice(-50).map((v) => v.id);
      const filtered = allVersions.filter(
        (v) => v.content_id !== version.content_id || toKeep.includes(v.id)
      );
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(filtered));
    } else {
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(allVersions));
    }
  } catch (error) {
    console.error('Failed to save version:', error);
  }
}

/**
 * Compare two versions and generate diff
 */
export function compareVersions(v1: any, v2: any): VersionDiff {
  const changes: ContentChange[] = [];

  // Compare all fields
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);

  for (const key of allKeys) {
    // Skip metadata fields
    if (key === 'metadata' || key === 'version') continue;

    const oldValue = v1[key];
    const newValue = v2[key];

    // Deep comparison for arrays and objects
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        old_value: oldValue,
        new_value: newValue,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Generate summary
  const summary = generateChangeSummary(changes);

  return {
    content_id: v1.id || v1.narrative_id,
    from_version: v1.metadata?.version || 1,
    to_version: v2.metadata?.version || 2,
    changes,
    summary,
  };
}

/**
 * Generate human-readable change summary
 */
function generateChangeSummary(changes: ContentChange[]): string {
  if (changes.length === 0) return 'No changes';

  const summaries: string[] = [];

  for (const change of changes) {
    switch (change.field) {
      case 'name':
      case 'title':
        summaries.push(`Renamed to "${change.new_value}"`);
        break;
      case 'description':
      case 'summary':
        summaries.push('Updated description');
        break;
      case 'tags':
        summaries.push('Modified tags');
        break;
      case 'category':
        summaries.push(`Changed category to "${change.new_value}"`);
        break;
      case 'difficulty':
        summaries.push(`Changed difficulty to ${change.new_value}`);
        break;
      case 'evidence_quality':
        summaries.push(`Updated evidence quality to ${change.new_value}`);
        break;
      default:
        summaries.push(`Updated ${change.field}`);
    }
  }

  return summaries.join(', ');
}

/**
 * Rollback to specific version
 */
export function rollbackToVersion<T>(
  contentId: string,
  version: number,
  allContent: T[]
): T | null {
  const history = getVersionHistory(contentId);
  const targetVersion = history.find((v) => v.version === version);

  if (!targetVersion) {
    console.error(`Version ${version} not found`);
    return null;
  }

  // In a real implementation, this would restore the content
  // For now, return null as content restoration requires backend
  console.log(`Would rollback ${contentId} to version ${version}`);
  return null;
}

/**
 * Create change log in Markdown format
 */
export function createChangeLog(versions: ContentVersion[]): string {
  if (versions.length === 0) return '# Change Log\n\nNo versions found.';

  // Group by date
  const byDate: Record<string, ContentVersion[]> = {};

  for (const version of versions) {
    const date = version.timestamp.split('T')[0];
    if (!byDate[date]) {
      byDate[date] = [];
    }
    byDate[date].push(version);
  }

  // Generate markdown
  let markdown = '# Change Log\n\n';

  const dates = Object.keys(byDate).sort().reverse();

  for (const date of dates) {
    markdown += `## ${date}\n\n`;

    const dayVersions = byDate[date];
    for (const version of dayVersions) {
      markdown += `### Version ${version.version} - ${version.content_id}\n\n`;
      markdown += `**Author:** ${version.author}\n\n`;

      if (version.changes.length > 0) {
        markdown += '**Changes:**\n';
        for (const change of version.changes) {
          markdown += `- ${change}\n`;
        }
      }

      markdown += '\n';
    }
  }

  return markdown;
}

/**
 * Export version history
 */
export function exportVersionHistory(): string {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    return stored || '[]';
  } catch (error) {
    console.error('Failed to export version history:', error);
    return '[]';
  }
}

/**
 * Import version history
 */
export function importVersionHistory(json: string): { success: boolean; error?: string } {
  try {
    const versions: ContentVersion[] = JSON.parse(json);

    // Validate structure
    if (!Array.isArray(versions)) {
      return { success: false, error: 'Invalid format: expected array' };
    }

    for (const version of versions) {
      if (!version.id || !version.content_id || !version.version) {
        return { success: false, error: 'Invalid version structure' };
      }
    }

    localStorage.setItem(VERSION_HISTORY_KEY, json);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Import failed',
    };
  }
}

/**
 * Get latest version number for content
 */
export function getLatestVersion(contentId: string): number {
  const history = getVersionHistory(contentId);
  if (history.length === 0) return 1;

  return Math.max(...history.map((v) => v.version));
}

/**
 * Create new version
 */
export function createVersion(
  contentId: string,
  changes: string[],
  author: string = 'system'
): ContentVersion {
  const latestVersion = getLatestVersion(contentId);

  const version: ContentVersion = {
    id: `v_${contentId}_${latestVersion + 1}_${Date.now()}`,
    content_id: contentId,
    version: latestVersion + 1,
    changes,
    author,
    timestamp: new Date().toISOString(),
    approved: false,
    previous_version: latestVersion,
  };

  saveVersion(version);
  return version;
}
