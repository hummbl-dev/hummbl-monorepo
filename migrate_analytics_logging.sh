#!/bin/bash

ANALYTICS_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/routes/analytics.ts"

echo "Migrating analytics.ts console statements..."

# Replace console.warn and console.error statements
sed -i '' "s/console\.warn('Invalid endpoint for tracking:', endpoint);/logger.warn('Invalid endpoint for tracking', { context: 'analytics-invalid-endpoint', endpoint: endpoint?.substring(0, 100), timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Error tracking request:', error);/logError(error, { context: 'analytics-track-request', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.warn('Invalid model ID for tracking:', modelId);/logger.warn('Invalid model ID for tracking', { context: 'analytics-invalid-model-id', modelId: modelId?.substring(0, 50), timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Error tracking model access:', error);/logError(error, { context: 'analytics-track-model', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.warn('Invalid search query for tracking:', query);/logger.warn('Invalid search query for tracking', { context: 'analytics-invalid-search', query: query?.substring(0, 100), timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Error tracking search query:', error);/logError(error, { context: 'analytics-track-search', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Error filtering recent requests:', error);/logError(error, { context: 'analytics-filter-requests', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Error processing analytics data:', error);/logError(error, { context: 'analytics-process-data', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Analytics stats error:', error);/logError(error, { context: 'analytics-stats-general', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"
sed -i '' "s/console\.error('Health check error:', error);/logError(error, { context: 'analytics-health-check', timestamp: new Date().toISOString() });/g" "$ANALYTICS_FILE"

echo "Analytics.ts migration completed"