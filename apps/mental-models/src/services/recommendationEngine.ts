// ML-based personalized recommendation engine

import { getSemanticSearch, cosineSimilarity } from './semanticSearch';
import type { VectorSearchResult } from './semanticSearch';

export interface UserProfile {
  userId: string;
  viewedItems: string[];
  bookmarkedItems: string[];
  searchHistory: string[];
  preferences: {
    categories: Record<string, number>;
    tags: Record<string, number>;
    difficulty: Record<string, number>;
  };
  createdAt: number;
  updatedAt: number;
}

export interface RecommendationResult {
  id: string;
  type: 'narrative' | 'mentalModel';
  title: string;
  score: number;
  reason: string;
  reasons: string[];
}

export interface ContentItem {
  id: string;
  type: 'narrative' | 'mentalModel';
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
}

const PROFILE_KEY = 'hummbl_user_profile';

/**
 * Recommendation Engine
 */
export class RecommendationEngine {
  private semanticSearch = getSemanticSearch();
  private profile: UserProfile;

  constructor(userId?: string) {
    this.profile = this.loadProfile(userId);
  }

  /**
   * Load user profile from localStorage
   */
  private loadProfile(userId?: string): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        if (!userId || profile.userId === userId) {
          return profile;
        }
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }

    return this.createDefaultProfile(userId || 'anonymous');
  }

  /**
   * Create default user profile
   */
  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      viewedItems: [],
      bookmarkedItems: [],
      searchHistory: [],
      preferences: {
        categories: {},
        tags: {},
        difficulty: {},
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Save user profile to localStorage
   */
  private saveProfile(): void {
    try {
      this.profile.updatedAt = Date.now();
      localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  /**
   * Update user profile with new activity
   */
  updateProfile(activity: {
    viewedItem?: string;
    bookmarkedItem?: string;
    searchQuery?: string;
    category?: string;
    tags?: string[];
    difficulty?: string;
  }): void {
    if (activity.viewedItem) {
      this.profile.viewedItems.unshift(activity.viewedItem);
      this.profile.viewedItems = this.profile.viewedItems.slice(0, 100);
    }

    if (activity.bookmarkedItem) {
      if (!this.profile.bookmarkedItems.includes(activity.bookmarkedItem)) {
        this.profile.bookmarkedItems.push(activity.bookmarkedItem);
      }
    }

    if (activity.searchQuery) {
      this.profile.searchHistory.unshift(activity.searchQuery);
      this.profile.searchHistory = this.profile.searchHistory.slice(0, 50);
    }

    if (activity.category) {
      this.profile.preferences.categories[activity.category] =
        (this.profile.preferences.categories[activity.category] || 0) + 1;
    }

    if (activity.tags) {
      activity.tags.forEach((tag) => {
        this.profile.preferences.tags[tag] = (this.profile.preferences.tags[tag] || 0) + 1;
      });
    }

    if (activity.difficulty) {
      this.profile.preferences.difficulty[activity.difficulty] =
        (this.profile.preferences.difficulty[activity.difficulty] || 0) + 1;
    }

    this.saveProfile();
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(
    corpus: ContentItem[],
    limit = 10,
    strategy: 'hybrid' | 'semantic' | 'collaborative' = 'hybrid'
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    switch (strategy) {
      case 'semantic':
        return this.getSemanticRecommendations(corpus, limit);

      case 'collaborative':
        return this.getCollaborativeRecommendations(corpus, limit);

      case 'hybrid':
      default:
        const semantic = await this.getSemanticRecommendations(corpus, Math.floor(limit * 0.6));
        const collaborative = await this.getCollaborativeRecommendations(
          corpus,
          Math.ceil(limit * 0.4)
        );

        // Merge and deduplicate
        const seen = new Set<string>();
        const merged: RecommendationResult[] = [];

        for (const rec of [...semantic, ...collaborative]) {
          if (!seen.has(rec.id)) {
            seen.add(rec.id);
            merged.push(rec);
          }
        }

        return merged.slice(0, limit);
    }
  }

  /**
   * Get semantic (content-based) recommendations
   */
  private async getSemanticRecommendations(
    corpus: ContentItem[],
    limit: number
  ): Promise<RecommendationResult[]> {
    // Build query from user's search history and bookmarks
    const query = this.buildUserQuery();

    if (!query) {
      return this.getFallbackRecommendations(corpus, limit);
    }

    // Perform semantic search
    const searchResults = await this.semanticSearch.search(
      query,
      corpus.map((item) => ({
        id: item.id,
        content: `${item.title} ${item.content}`,
        metadata: { type: item.type, category: item.category },
      })),
      limit * 2 // Get more to filter
    );

    // Filter out already viewed items
    const filtered = searchResults.filter(
      (result) => !this.profile.viewedItems.includes(result.id)
    );

    return filtered.slice(0, limit).map((result) => {
      const item = corpus.find((c) => c.id === result.id)!;
      return {
        id: result.id,
        type: item.type,
        title: item.title,
        score: result.score,
        reason: 'semantic match',
        reasons: ['Based on your interests', 'Content similarity'],
      };
    });
  }

  /**
   * Get collaborative filtering recommendations
   */
  private async getCollaborativeRecommendations(
    corpus: ContentItem[],
    limit: number
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    // Score items based on user preferences
    for (const item of corpus) {
      // Skip viewed items
      if (this.profile.viewedItems.includes(item.id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Category preference
      if (item.category) {
        const categoryScore = this.profile.preferences.categories[item.category] || 0;
        if (categoryScore > 0) {
          score += categoryScore * 0.4;
          reasons.push(`Popular in ${item.category}`);
        }
      }

      // Tag preferences
      if (item.tags) {
        let tagScore = 0;
        item.tags.forEach((tag) => {
          tagScore += this.profile.preferences.tags[tag] || 0;
        });
        if (tagScore > 0) {
          score += tagScore * 0.3;
          reasons.push('Matches your interests');
        }
      }

      // Difficulty preference
      if (item.difficulty) {
        const difficultyScore = this.profile.preferences.difficulty[item.difficulty] || 0;
        if (difficultyScore > 0) {
          score += difficultyScore * 0.2;
        }
      }

      // Boost bookmarked items' similar content
      const bookmarkBoost = this.calculateBookmarkBoost(item);
      score += bookmarkBoost * 0.1;
      if (bookmarkBoost > 0) {
        reasons.push('Similar to bookmarked content');
      }

      if (score > 0) {
        recommendations.push({
          id: item.id,
          type: item.type,
          title: item.title,
          score: Math.min(score / 10, 1), // Normalize to 0-1
          reason: reasons[0] || 'recommended for you',
          reasons,
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Calculate boost based on bookmarked items
   */
  private calculateBookmarkBoost(item: ContentItem): number {
    let boost = 0;

    if (item.category) {
      // Count bookmarked items in same category
      boost += this.profile.bookmarkedItems.length > 0 ? 1 : 0;
    }

    return boost;
  }

  /**
   * Build user query from history
   */
  private buildUserQuery(): string {
    const queries: string[] = [];

    // Add recent searches
    queries.push(...this.profile.searchHistory.slice(0, 3));

    // Add top categories
    const topCategories = Object.entries(this.profile.preferences.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([cat]) => cat);
    queries.push(...topCategories);

    // Add top tags
    const topTags = Object.entries(this.profile.preferences.tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
    queries.push(...topTags);

    return queries.filter(Boolean).join(' ');
  }

  /**
   * Get fallback recommendations (trending/popular)
   */
  private getFallbackRecommendations(corpus: ContentItem[], limit: number): RecommendationResult[] {
    // Simple fallback: return random items
    const available = corpus.filter((item) => !this.profile.viewedItems.includes(item.id));

    const shuffled = [...available].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, limit).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      score: 0.5,
      reason: 'trending',
      reasons: ['Popular content', 'Highly rated'],
    }));
  }

  /**
   * Get "because you viewed" recommendations
   */
  async getBecauseYouViewed(
    viewedItemId: string,
    corpus: ContentItem[],
    limit = 5
  ): Promise<RecommendationResult[]> {
    const viewedItem = corpus.find((item) => item.id === viewedItemId);
    if (!viewedItem) return [];

    const similar = await this.semanticSearch.findSimilar(
      viewedItemId,
      `${viewedItem.title} ${viewedItem.content}`,
      corpus.map((item) => ({
        id: item.id,
        content: `${item.title} ${item.content}`,
      })),
      limit
    );

    return similar.map((result) => {
      const item = corpus.find((c) => c.id === result.id)!;
      return {
        id: result.id,
        type: item.type,
        title: item.title,
        score: result.score,
        reason: `because you viewed ${viewedItem.title}`,
        reasons: ['Similar content', 'Related topic'],
      };
    });
  }

  /**
   * Get user profile
   */
  getProfile(): UserProfile {
    return { ...this.profile };
  }

  /**
   * Reset user profile
   */
  resetProfile(): void {
    this.profile = this.createDefaultProfile(this.profile.userId);
    this.saveProfile();
  }

  /**
   * Export profile for backup
   */
  exportProfile(): string {
    return JSON.stringify(this.profile, null, 2);
  }

  /**
   * Import profile from backup
   */
  importProfile(json: string): void {
    try {
      this.profile = JSON.parse(json);
      this.saveProfile();
    } catch (error) {
      console.error('Failed to import profile:', error);
    }
  }
}

/**
 * Singleton instance
 */
let engineInstance: RecommendationEngine | null = null;

export function getRecommendationEngine(userId?: string): RecommendationEngine {
  if (!engineInstance) {
    engineInstance = new RecommendationEngine(userId);
  }
  return engineInstance;
}

export function resetRecommendationEngine(): void {
  engineInstance = null;
}
