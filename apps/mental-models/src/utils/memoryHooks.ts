// Memory hooks for Cascade agent context integration

import type { UserAnalytics } from '../hooks/useUserAnalytics';
import type { UserPreferences } from '../hooks/useUserPreferences';

export interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
  relevanceScore?: number;
}

export interface UserContext {
  recentActions: string[];
  preferences: Partial<UserPreferences>;
  topInterests: string[];
  usagePatterns: string[];
}

/**
 * Create a memory from user preferences
 */
export function createUserPreferenceMemory(preferences: UserPreferences): Memory {
  const content = `User preferences snapshot:
- Primary view: ${preferences.lastView}
- Preferred export format: ${preferences.preferredExportFormat}
- Analytics enabled: ${preferences.enableAnalytics}
- Theme: ${preferences.theme}
- Compact mode: ${preferences.compactMode}
${preferences.reducedMotion ? '- Reduced motion enabled\n' : ''}${preferences.highContrast ? '- High contrast enabled\n' : ''}`;

  return {
    id: `pref_${Date.now()}`,
    title: 'User Preferences',
    content,
    tags: ['preferences', 'user_settings', 'ui'],
    timestamp: Date.now(),
  };
}

/**
 * Create a memory from user analytics
 */
export function createUserAnalyticsMemory(analytics: UserAnalytics): Memory {
  const topSearches = Object.entries(analytics.searches.queryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([query, count]) => `"${query}" (${count}x)`);

  const topFormat = Object.entries(analytics.exports.formatUsage).sort(([, a], [, b]) => b - a)[0];

  const content = `User analytics summary:
- Total views: ${analytics.views.totalViews}
- Total searches: ${analytics.searches.totalSearches}
- Total exports: ${analytics.exports.totalExports}
- Session duration: ${Math.round(analytics.sessionDuration / 60000)} minutes
${topSearches.length > 0 ? `- Top searches: ${topSearches.join(', ')}\n` : ''}${topFormat ? `- Most used export: ${topFormat[0]} (${topFormat[1]}x)\n` : ''}`;

  return {
    id: `analytics_${Date.now()}`,
    title: 'User Analytics Summary',
    content,
    tags: ['analytics', 'usage', 'patterns'],
    timestamp: Date.now(),
  };
}

/**
 * Extract user context from analytics
 */
export function extractUserContext(analytics: UserAnalytics): UserContext {
  const recentActions = analytics.actions
    .slice(-10)
    .map((action) => `${action.type}: ${JSON.stringify(action.data)}`)
    .reverse();

  // Determine top interests based on views
  const allViews = {
    ...analytics.views.narrativeViews,
    ...analytics.views.modelViews,
  };
  const topInterests = Object.entries(allViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  // Identify usage patterns
  const usagePatterns: string[] = [];

  if (analytics.searches.totalSearches > analytics.views.totalViews * 0.5) {
    usagePatterns.push('heavy_searcher');
  }

  if (analytics.exports.totalExports > 5) {
    usagePatterns.push('frequent_exporter');
  }

  const sessionMinutes = analytics.sessionDuration / 60000;
  if (sessionMinutes > 30) {
    usagePatterns.push('engaged_user');
  } else if (sessionMinutes < 5) {
    usagePatterns.push('quick_visitor');
  }

  return {
    recentActions,
    preferences: {},
    topInterests,
    usagePatterns,
  };
}

/**
 * Retrieve relevant memories based on current context
 */
export function retrieveRelevantMemories(context: string, memories: Memory[], limit = 5): Memory[] {
  const contextLower = context.toLowerCase();
  const keywords = contextLower.split(/\s+/).filter((w) => w.length > 3);

  // Score memories based on relevance
  const scored = memories.map((memory) => {
    let score = 0;
    const memoryText = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();

    // Check for keyword matches
    keywords.forEach((keyword) => {
      if (memoryText.includes(keyword)) {
        score += 2;
      }
    });

    // Check for tag matches
    memory.tags.forEach((tag) => {
      if (contextLower.includes(tag.toLowerCase())) {
        score += 3;
      }
    });

    // Recency boost (memories from last 24 hours)
    const age = Date.now() - memory.timestamp;
    if (age < 24 * 60 * 60 * 1000) {
      score += 1;
    }

    return { ...memory, relevanceScore: score };
  });

  // Return top N relevant memories
  return scored
    .filter((m) => m.relevanceScore > 0)
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, limit);
}

/**
 * Suggest next action based on user history
 */
export function suggestNextAction(analytics: UserAnalytics): string | null {
  const { actions, views, searches, exports } = analytics;

  // No recent activity
  if (actions.length === 0) {
    return 'Start by exploring Mental Models or Narratives';
  }

  const recentAction = actions[actions.length - 1];
  const actionAge = Date.now() - recentAction.timestamp;

  // If recently searched but no views, suggest viewing results
  if (
    recentAction.type === 'search' &&
    actionAge < 5 * 60 * 1000 && // Within 5 minutes
    views.totalViews === 0
  ) {
    return 'Check out the search results';
  }

  // If viewed many items but never exported
  if (views.totalViews > 10 && exports.totalExports === 0) {
    return 'Consider exporting your findings';
  }

  // If user has been browsing for a while
  const sessionMinutes = analytics.sessionDuration / 60000;
  if (sessionMinutes > 20 && searches.totalSearches === 0) {
    return 'Try using search to find specific topics';
  }

  // If user frequently searches, suggest saving filters
  if (searches.totalSearches > 10) {
    return 'Tip: You can save frequently used filters';
  }

  return null;
}

/**
 * Generate insight from analytics
 */
export function generateInsight(analytics: UserAnalytics): string | null {
  const { views, searches, exports, sessionDuration } = analytics;

  // Most viewed narrative/model
  const allViews = {
    ...views.narrativeViews,
    ...views.modelViews,
  };
  const topView = Object.entries(allViews).sort(([, a], [, b]) => b - a)[0];

  if (topView && topView[1] > 3) {
    return `You've viewed "${topView[0]}" ${topView[1]} times - seems like a favorite!`;
  }

  // Search patterns
  const topSearch = Object.entries(searches.queryCount).sort(([, a], [, b]) => b - a)[0];

  if (topSearch && topSearch[1] > 3) {
    return `"${topSearch[0]}" is your most searched term`;
  }

  // Export behavior
  if (exports.totalExports > 0) {
    const avgCount = Math.round(exports.averageNarrativeCount);
    return `You typically export around ${avgCount} items`;
  }

  // Session duration
  const minutes = Math.round(sessionDuration / 60000);
  if (minutes > 30) {
    return `You've spent ${minutes} minutes exploring - dedicated learner!`;
  }

  return null;
}
