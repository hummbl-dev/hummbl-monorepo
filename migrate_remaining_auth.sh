#!/bin/bash

AUTH_FILE="/Users/others/Developer/hummbl/hummbl-monorepo/apps/workers/src/routes/auth.ts"

echo "Migrating remaining auth console.error statements..."

# Registration errors
sed -i '' "s/console\.error('JSON parsing error during registration:', error);/logError(error, { context: 'registration-json-parsing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during user lookup:', error);/logError(error, { context: 'registration-user-lookup-db', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Password hashing error during registration:', error);/logError(error, { context: 'registration-password-hashing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('UUID generation error:', error);/logError(error, { context: 'registration-uuid-generation', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Invalid verification expiry date');/logger.error('Invalid verification expiry date', { context: 'registration-verification-expiry', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during registration:', error);/logError(error, { context: 'registration-db-insertion', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('JWT secret configuration invalid');/logger.error('JWT secret configuration invalid', { context: 'registration-jwt-config', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('JWT token generation error during registration:', error);/logError(error, { context: 'registration-jwt-generation', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Failed to send verification email:', error);/logError(error, { context: 'registration-email-sending', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Registration error:', error);/logError(error, { context: 'registration-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Login errors
sed -i '' "s/console\.error('JSON parsing error during login:', error);/logError(error, { context: 'login-json-parsing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Login error:', error);/logError(error, { context: 'login-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Token verification errors
sed -i '' "s/console\.error('JWT verification error:', error);/logError(error, { context: 'token-verification-jwt', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during token verification:', error);/logError(error, { context: 'token-verification-db', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Token verification error:', error);/logError(error, { context: 'token-verification-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Email verification errors
sed -i '' "s/console\.error('JSON parsing error during email verification:', error);/logError(error, { context: 'email-verification-json-parsing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during email verification lookup:', error);/logError(error, { context: 'email-verification-lookup-db', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during email verification:', error);/logError(error, { context: 'email-verification-db-update', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Email verification error:', error);/logError(error, { context: 'email-verification-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Refresh token errors
sed -i '' "s/console\.error('JSON parsing error during refresh:', error);/logError(error, { context: 'refresh-token-json-parsing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Cache error during refresh token validation:', error);/logError(error, { context: 'refresh-token-cache-validation', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during refresh token validation:', error);/logError(error, { context: 'refresh-token-db-validation', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Cache cleanup error');/logger.error('Cache cleanup error during refresh token validation', { context: 'refresh-token-cache-cleanup', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Token generation error during refresh:', error);/logError(error, { context: 'refresh-token-generation', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Cache delete error during refresh:', error);/logError(error, { context: 'refresh-token-cache-delete', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Token refresh error:', error);/logError(error, { context: 'refresh-token-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Resend verification errors
sed -i '' "s/console\.error('JSON parsing error during resend verification:', error);/logError(error, { context: 'resend-verification-json-parsing', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during resend verification lookup:', error);/logError(error, { context: 'resend-verification-lookup-db', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Database error during verification token update:', error);/logError(error, { context: 'resend-verification-token-update-db', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Resend verification error:', error);/logError(error, { context: 'resend-verification-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

# Logout errors
sed -i '' "s/console\.error('Cache delete error during logout:', error);/logError(error, { context: 'logout-cache-delete', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"
sed -i '' "s/console\.error('Logout error:', error);/logError(error, { context: 'logout-general', timestamp: new Date().toISOString() });/g" "$AUTH_FILE"

echo "Migration script completed"