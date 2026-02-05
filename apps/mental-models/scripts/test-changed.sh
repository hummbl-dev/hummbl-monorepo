#!/bin/bash
#
# HUMMBL - Test Changed Files Script
# Only runs tests for files that have changed
#

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BASE_BRANCH="${1:-main}"
VERBOSE="${VERBOSE:-false}"

echo -e "${GREEN}Detecting changed files since $BASE_BRANCH...${NC}"

# Get changed files
CHANGED_FILES=$(git diff --name-only origin/$BASE_BRANCH...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo -e "${YELLOW}No changed files detected${NC}"
  exit 0
fi

if [ "$VERBOSE" = "true" ]; then
  echo "Changed files:"
  echo "$CHANGED_FILES"
fi

# Determine which workspaces need testing
TEST_ROOT=false
TEST_SHARED=false
TEST_SERVER=false
TEST_INFRASTRUCTURE=false
TEST_MOBILE=false

while IFS= read -r file; do
  if [[ "$file" =~ ^src/ ]] || [[ "$file" == "package.json" ]] || [[ "$file" == "pnpm-lock.yaml" ]]; then
    TEST_ROOT=true
  fi
  if [[ "$file" =~ ^shared/ ]]; then
    TEST_SHARED=true
  fi
  if [[ "$file" =~ ^server/ ]]; then
    TEST_SERVER=true
  fi
  if [[ "$file" =~ ^infrastructure/ ]]; then
    TEST_INFRASTRUCTURE=true
  fi
  if [[ "$file" =~ ^mobile/ ]]; then
    TEST_MOBILE=true
  fi
done <<< "$CHANGED_FILES"

# Output results
echo -e "${GREEN}Tests to run:${NC}"
[ "$TEST_ROOT" = "true" ] && echo "  - Root (main app)"
[ "$TEST_SHARED" = "true" ] && echo "  - Shared workspace"
[ "$TEST_SERVER" = "true" ] && echo "  - Server workspace"
[ "$TEST_INFRASTRUCTURE" = "true" ] && echo "  - Infrastructure workspace"
[ "$TEST_MOBILE" = "true" ] && echo "  - Mobile workspace"

# Return exit code based on whether tests need to run
if [ "$TEST_ROOT" = "false" ] && [ "$TEST_SHARED" = "false" ] && [ "$TEST_SERVER" = "false" ] && [ "$TEST_INFRASTRUCTURE" = "false" ] && [ "$TEST_MOBILE" = "false" ]; then
  echo -e "${YELLOW}No relevant files changed, skipping tests${NC}"
  exit 0
fi

# Set environment variables for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "test-root=$TEST_ROOT" >> "$GITHUB_OUTPUT"
  echo "test-shared=$TEST_SHARED" >> "$GITHUB_OUTPUT"
  echo "test-server=$TEST_SERVER" >> "$GITHUB_OUTPUT"
  echo "test-infrastructure=$TEST_INFRASTRUCTURE" >> "$GITHUB_OUTPUT"
  echo "test-mobile=$TEST_MOBILE" >> "$GITHUB_OUTPUT"
fi

echo -e "${GREEN}✅ Changed file detection complete${NC}"

