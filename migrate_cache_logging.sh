#!/bin/bash

CACHE_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/lib/cache.ts"

echo "Migrating cache.ts console statements..."

# Replace console.log statements with appropriate structured logging
sed -i '' "s/console\.log('\[MEMORY CACHE\] read', {/logger.debug('Memory cache read', {/g" "$CACHE_FILE"
sed -i '' "s/console\.log('\[MEMORY CACHE\] expired', { key });/logger.debug('Memory cache entry expired', { context: 'cache-expiry', key, timestamp: new Date().toISOString() });/g" "$CACHE_FILE"
sed -i '' "s/console\.log('\[MEMORY CACHE\] prototype pollution detected', { key });/logger.warn('Prototype pollution detected in cache key', { context: 'cache-security', key, timestamp: new Date().toISOString() });/g" "$CACHE_FILE"
sed -i '' "s/console\.log('\[MEMORY CACHE\] parse error', { key });/logger.error('Cache parse error', { context: 'cache-parse-error', key, timestamp: new Date().toISOString() });/g" "$CACHE_FILE"
sed -i '' "s/console\.log('\[MEMORY CACHE\] write', { key, expiresAt });/logger.debug('Memory cache write', { context: 'cache-write', key, expiresAt, timestamp: new Date().toISOString() });/g" "$CACHE_FILE"

echo "Cache.ts migration completed"