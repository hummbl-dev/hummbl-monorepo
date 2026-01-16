#!/bin/bash

# Script to migrate console.error statements to structured logging in auth.ts
AUTH_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/routes/auth.ts"

# Replace all remaining console.error statements
sed -i '' 's/console\.error('\''JSON parsing error during GitHub auth:'\'', error);/logError(error, { context: '\''github-auth-json-parsing'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''GitHub token request failed:'\'', error);/logError(error, { context: '\''github-token-request'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''GitHub token response parsing error:'\'', error);/logError(error, { context: '\''github-token-response-parsing'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''GitHub API request failed:'\'', error);/logError(error, { context: '\''github-api-request'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''GitHub user response parsing error:'\'', error);/logError(error, { context: '\''github-user-response-parsing'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''Database error during GitHub user lookup:'\'', error);/logError(error, { context: '\''github-user-lookup-db'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''Invalid UUID generated for GitHub user'\'');/logger.error('\''Invalid UUID generated for GitHub user'\'', { context: '\''github-uuid-generation'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''Invalid existing user data from database'\'');/logger.error('\''Invalid existing user data from database'\'', { context: '\''github-user-data-validation'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''Token generation error during GitHub auth:'\'', error);/logError(error, { context: '\''github-token-generation'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"
sed -i '' 's/console\.error('\''GitHub auth error:'\'', error);/logError(error, { context: '\''github-auth-general'\'', timestamp: new Date().toISOString() });/g' "$AUTH_FILE"

echo "Completed GitHub auth console.error migration"