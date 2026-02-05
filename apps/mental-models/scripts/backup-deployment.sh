#!/bin/bash
#
# HUMMBL - Deployment Backup Script
# Creates explicit backups of database and deployment state
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH="${GITHUB_REF#refs/heads/}" || "local"
ENVIRONMENT="${1:-production}"

echo -e "${GREEN}Creating deployment backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup 1: Current Git State
echo -e "${YELLOW}[1/4] Backing up Git state...${NC}"
{
  git rev-parse HEAD > "$BACKUP_DIR/$TIMESTAMP/git-commit.txt"
  git branch --show-current > "$BACKUP_DIR/$TIMESTAMP/git-branch.txt"
  git log -1 --pretty=format:"%H|%an|%ad|%s" > "$BACKUP_DIR/$TIMESTAMP/git-log.txt"
} || echo "Warning: Could not backup Git state"

# Backup 2: Deployment Configuration
echo -e "${YELLOW}[2/4] Backing up deployment configuration...${NC}"
{
  cp vercel.json "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || echo "No vercel.json found"
  cp package.json "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || echo "No package.json found"
  [ -f ".env.production" ] && cp .env.production "$BACKUP_DIR/$TIMESTAMP/.env.backup" 2>/dev/null || echo "No .env.production found"
} || echo "Warning: Could not backup configuration"

# Backup 3: Build Artifacts (if dist exists)
echo -e "${YELLOW}[3/4] Backing up build artifacts...${NC}"
if [ -d "dist" ]; then
  tar -czf "$BACKUP_DIR/$TIMESTAMP/dist.tar.gz" dist/ 2>/dev/null || echo "Could not backup dist/"
else
  echo "No dist/ directory found"
fi

# Backup 4: Database State (if Supabase/DB exists)
echo -e "${YELLOW}[4/4] Checking for database backup...${NC}"
if command -v supabase &> /dev/null && [ -f ".supabase/config.toml" ]; then
  echo "Supabase detected - creating schema backup"
  supabase db dump --local > "$BACKUP_DIR/$TIMESTAMP/schema.sql" 2>/dev/null || echo "Could not backup schema"
fi

# Create backup manifest
cat > "$BACKUP_DIR/$TIMESTAMP/manifest.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "branch": "$BRANCH",
  "files": [
    "git-commit.txt",
    "git-branch.txt",
    "git-log.txt"
  ]
}
EOF

# Summary
echo -e "${GREEN}✅ Backup created successfully${NC}"
echo -e "${GREEN}Location: $BACKUP_DIR/$TIMESTAMP${NC}"
echo -e "${YELLOW}To restore, run:${NC}"
echo "  ./scripts/restore-deployment.sh $BACKUP_DIR/$TIMESTAMP"

# Optional: Upload to remote storage (S3, etc.)
if [ "${BACKUP_UPLOAD:-false}" = "true" ]; then
  echo -e "${YELLOW}Uploading to remote storage...${NC}"
  # Add upload logic here
fi

