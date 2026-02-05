#!/bin/bash

# Rollback script for HUMMBL deployments
# Usage: ./scripts/rollback.sh [deployment-id]

set -e

echo "🔄 HUMMBL Rollback Script"
echo "========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if deployment ID is provided
if [ -z "$1" ]; then
    echo "📋 Recent deployments:"
    echo ""
    vercel ls --prod
    echo ""
    echo "Usage: ./scripts/rollback.sh <deployment-id>"
    echo "Example: ./scripts/rollback.sh dpl_abc123xyz"
    exit 1
fi

DEPLOYMENT_ID=$1

echo "⚠️  WARNING: You are about to rollback to deployment: $DEPLOYMENT_ID"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

echo ""
echo "🔄 Rolling back to $DEPLOYMENT_ID..."

# Promote the specified deployment to production
vercel promote "$DEPLOYMENT_ID" --yes

echo ""
echo "✅ Rollback complete!"
echo ""
echo "🔍 Verifying deployment..."
sleep 5

# Verify the rollback
CURRENT_DEPLOYMENT=$(vercel ls --prod | grep "PRODUCTION" | awk '{print $1}' | head -1)

if [ "$CURRENT_DEPLOYMENT" == "$DEPLOYMENT_ID" ]; then
    echo "✅ Rollback verified successfully!"
    echo "Current production deployment: $CURRENT_DEPLOYMENT"
else
    echo "⚠️  Rollback may not have completed successfully"
    echo "Current deployment: $CURRENT_DEPLOYMENT"
    echo "Expected deployment: $DEPLOYMENT_ID"
    exit 1
fi

echo ""
echo "📊 Testing production URL..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hummbl.io)

if [ "$RESPONSE" == "200" ]; then
    echo "✅ Production site responding correctly (HTTP $RESPONSE)"
else
    echo "⚠️  Warning: Production site returned HTTP $RESPONSE"
fi

echo ""
echo "✅ Rollback complete and verified!"
echo ""
echo "📝 Next steps:"
echo "  1. Monitor error logs for any issues"
echo "  2. Check analytics for traffic patterns"
echo "  3. Notify team of rollback"
echo "  4. Investigate and fix the issue that caused the rollback"
echo ""
