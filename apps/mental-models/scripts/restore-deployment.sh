#!/bin/bash
#
# HUMMBL - Deployment Restore Script
# Restores from a deployment backup
#

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_PATH="${1:-}"

if [ -z "$BACKUP_PATH" ]; then
  echo -e "${RED}Usage: $0 <backup-path>${NC}"
  exit 1
fi

if [ ! -d "$BACKUP_PATH" ]; then
  echo -e "${RED}Error: Backup path does not exist: $BACKUP_PATH${NC}"
  exit 1
fi

echo -e "${GREEN}Restoring from backup: $BACKUP_PATH${NC}"

# Show backup info
if [ -f "$BACKUP_PATH/manifest.json" ]; then
  echo -e "${YELLOW}Backup Information:${NC}"
  cat "$BACKUP_PATH/manifest.json"
fi

# Confirm restoration
read -p "Are you sure you want to restore this backup? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo -e "${YELLOW}Restore cancelled${NC}"
  exit 0
fi

# Restore Git state
if [ -f "$BACKUP_PATH/git-commit.txt" ]; then
  COMMIT=$(cat "$BACKUP_PATH/git-commit.txt")
  echo -e "${GREEN}Checking out commit: $COMMIT${NC}"
  git checkout "$COMMIT"
fi

# Restore configuration
if [ -f "$BACKUP_PATH/vercel.json" ]; then
  echo -e "${GREEN}Restoring vercel.json${NC}"
  cp "$BACKUP_PATH/vercel.json" .
fi

# Restore build artifacts
if [ -f "$BACKUP_PATH/dist.tar.gz" ]; then
  echo -e "${GREEN}Restoring build artifacts${NC}"
  tar -xzf "$BACKUP_PATH/dist.tar.gz"
fi

echo -e "${GREEN}✅ Restoration complete${NC}"

