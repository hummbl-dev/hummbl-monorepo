#!/bin/bash
# deploy-cvp-staging.sh
set -e

echo "🚀 Starting CVP Staging Deployment"
echo "📅 $(date)"
echo "----------------------------------------"

# 1. Build the package
echo "🔧 Building CVP package..."
npm run build

# 2. Deploy to staging
echo "🚀 Deploying to staging..."
npm run deploy:staging

# 3. Enable telemetry logging
echo "📊 Enabling telemetry logging..."
# Using the project's SQLite-based telemetry system
TELEMETRY_DB="data/telemetry.db"

# Create telemetry database directory if it doesn't exist
mkdir -p "$(dirname "$TELEMETRY_DB")"

# Initialize telemetry database with required tables if they don't exist
if [ ! -f "$TELEMETRY_DB" ]; then
  echo "  Creating telemetry database..."
  sqlite3 "$TELEMETRY_DB" "
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId TEXT,
      userId TEXT,
      sessionId TEXT,
      event TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      data TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
  "
fi

# 4. Run health check
echo "🏥 Running health check..."
HEALTH_CHECK_URL="${STAGING_API_URL:-http://localhost:3000}/health"
if ! curl -s "$HEALTH_CHECK_URL" | grep -q '"status":"ok"'; then
  echo "❌ Health check failed!"
  exit 1
fi

echo "✅ Deployment complete!"
echo "📊 Next steps:"
echo "1. Monitor telemetry at: ${STAGING_API_URL:-http://localhost:3000}/telemetry/analytics"
echo "2. Run performance tests: npm run test:perf"
echo "3. Review API docs: /docs/hummbl/validation.md"

# Make the script executable
chmod +x "$0"
