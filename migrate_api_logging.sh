#!/bin/bash

API_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/lib/api.ts"

echo "Migrating api.ts console statements..."

# Replace console.error statements with appropriate structured logging
sed -i '' "s/console\.error('Error creating API error:', error);/logError(error, { context: 'api-error-creation', timestamp: new Date().toISOString() });/g" "$API_FILE"
sed -i '' "s/console\.error('Error sanitizing response data:', error);/logError(error, { context: 'api-response-sanitization', timestamp: new Date().toISOString() });/g" "$API_FILE"
sed -i '' "s/console\.error('Error in respondWithResult:', error);/logError(error, { context: 'api-respond-with-result', timestamp: new Date().toISOString() });/g" "$API_FILE"
# Replace console.warn statements
sed -i '' "s/console\.warn(\`\[CACHE\] \${sanitizedMessage}\`, sanitizedError);/logger.warn(sanitizedMessage, { context: 'cache-error-logging', ...sanitizedError, timestamp: new Date().toISOString() });/g" "$API_FILE"
sed -i '' "s/console\.warn('\[CACHE\] Error logging cache error:', logError);/logger.error('Error logging cache error', { context: 'cache-error-logging-failure', error: logError, timestamp: new Date().toISOString() });/g" "$API_FILE"

echo "API.ts migration completed"