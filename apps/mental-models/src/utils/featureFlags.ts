/**
 * Feature Flag System for Gradual Rollouts
 * Addresses Strategy #6 gap for gradual feature deployment
 */

export interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetEnvironments: string[];
}

// Feature flag configuration
const FEATURES: Record<string, FeatureFlag> = {
  // Example: New chat feature
  newChatInterface: {
    enabled: true,
    rolloutPercentage: 50, // 50% of users
    targetEnvironments: ['production', 'staging'],
  },

  // Example: New analytics tracking
  enhancedAnalytics: {
    enabled: false,
    rolloutPercentage: 0,
    targetEnvironments: ['staging'],
  },

  // Example: Experimental model
  experimentalModel: {
    enabled: false,
    rolloutPercentage: 0,
    targetEnvironments: ['development'],
  },
};

/**
 * Check if a feature is enabled for the current user/environment
 */
export function isFeatureEnabled(
  featureName: string,
  userId?: string,
  environment?: string
): boolean {
  const feature = FEATURES[featureName];

  if (!feature) {
    console.warn(`Unknown feature flag: ${featureName}`);
    return false;
  }

  // Check if feature is globally disabled
  if (!feature.enabled) {
    return false;
  }

  // Check environment
  const env =
    environment ||
    (typeof window !== 'undefined'
      ? (window as any).APP_ENVIRONMENT || 'production'
      : 'production');

  if (!feature.targetEnvironments.includes(env)) {
    return false;
  }

  // Check rollout percentage
  if (feature.rolloutPercentage === 100) {
    return true;
  }

  if (feature.rolloutPercentage === 0) {
    return false;
  }

  // For production, use userId or random for consistent experience
  if (userId) {
    const hash = simpleHash(userId);
    return hash % 100 < feature.rolloutPercentage;
  }

  // For anonymous users, check local storage for consistent experience
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`feature:${featureName}`);
    if (stored) {
      return stored === 'true';
    }

    // Generate random value and store it
    const enabled = Math.random() * 100 < feature.rolloutPercentage;
    localStorage.setItem(`feature:${featureName}`, enabled ? 'true' : 'false');
    return enabled;
  }

  return false;
}

/**
 * Simple hash function for consistent user assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get feature flag configuration
 */
export function getFeatureConfig(featureName: string): FeatureFlag | null {
  return FEATURES[featureName] || null;
}

/**
 * List all feature flags
 */
export function getAllFeatures(): Record<string, FeatureFlag> {
  return FEATURES;
}

/**
 * Example usage in components:
 *
 * import { isFeatureEnabled } from '@/utils/featureFlags';
 *
 * if (isFeatureEnabled('newChatInterface')) {
 *   return <NewChatInterface />;
 * }
 * return <OldChatInterface />;
 */
