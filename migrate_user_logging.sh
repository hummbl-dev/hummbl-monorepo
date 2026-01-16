#!/bin/bash

USER_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/routes/user.ts"

echo "Migrating user.ts console.error statements..."

# Replace console.error statements with appropriate structured logging
sed -i '' "s/console\.error('JWT verification error:', error);/logError(error, { context: 'user-jwt-verification', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Authentication middleware error:', error);/logError(error, { context: 'user-auth-middleware', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Get progress error:', error);/logError(error, { context: 'user-get-progress', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('JSON parsing error in add progress:', error);/logError(error, { context: 'user-add-progress-json-parsing', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error checking model existence:', error);/logError(error, { context: 'user-model-existence-check', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error checking existing progress:', error);/logError(error, { context: 'user-progress-existence-check', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error adding progress:', error);/logError(error, { context: 'user-add-progress-db', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Add progress error:', error);/logError(error, { context: 'user-add-progress-general', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error removing progress:', error);/logError(error, { context: 'user-remove-progress-db', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Remove progress error:', error);/logError(error, { context: 'user-remove-progress-general', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Get favorites error:', error);/logError(error, { context: 'user-get-favorites', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('JSON parsing error in add favorite:', error);/logError(error, { context: 'user-add-favorite-json-parsing', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error adding favorite:', error);/logError(error, { context: 'user-add-favorite-db', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Add favorite error:', error);/logError(error, { context: 'user-add-favorite-general', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Database error removing favorite:', error);/logError(error, { context: 'user-remove-favorite-db', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Remove favorite error:', error);/logError(error, { context: 'user-remove-favorite-general', timestamp: new Date().toISOString() });/g" "$USER_FILE"
sed -i '' "s/console\.error('Get profile error:', error);/logError(error, { context: 'user-get-profile', timestamp: new Date().toISOString() });/g" "$USER_FILE"

echo "User.ts migration completed"