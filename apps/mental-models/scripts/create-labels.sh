#!/bin/bash

# create-labels.sh
# Creates standard GitHub labels for HUMMBL project
# Prerequisites: GitHub CLI (gh) installed and authenticated
# Usage: ./scripts/create-labels.sh

set -e

REPO="hummbl-dev/hummbl-io"

echo "Creating GitHub Labels for HUMMBL..."
echo "Target Repository: $REPO"
echo ""

# Priority labels
echo "Creating priority labels..."
gh label create "priority-high" --color "d73a4a" --description "High priority" --repo "$REPO" 2>/dev/null || echo "  Label 'priority-high' already exists"
gh label create "priority-medium" --color "fbca04" --description "Medium priority" --repo "$REPO" 2>/dev/null || echo "  Label 'priority-medium' already exists"
gh label create "priority-low" --color "0e8a16" --description "Low priority" --repo "$REPO" 2>/dev/null || echo "  Label 'priority-low' already exists"

# Type labels
echo "Creating type labels..."
gh label create "enhancement" --color "a2eeef" --description "New feature or request" --repo "$REPO" 2>/dev/null || echo "  Label 'enhancement' already exists"
gh label create "documentation" --color "0075ca" --description "Improvements or additions to documentation" --repo "$REPO" 2>/dev/null || echo "  Label 'documentation' already exists"
gh label create "testing" --color "1d76db" --description "Testing-related issues" --repo "$REPO" 2>/dev/null || echo "  Label 'testing' already exists"

# Area labels
echo "Creating area labels..."
gh label create "monitoring" --color "5319e7" --description "Monitoring and observability" --repo "$REPO" 2>/dev/null || echo "  Label 'monitoring' already exists"
gh label create "ci-cd" --color "d876e3" --description "CI/CD pipeline" --repo "$REPO" 2>/dev/null || echo "  Label 'ci-cd' already exists"
gh label create "observability" --color "b60205" --description "Logging, tracing, metrics" --repo "$REPO" 2>/dev/null || echo "  Label 'observability' already exists"
gh label create "incident-response" --color "d93f0b" --description "Incident management and recovery" --repo "$REPO" 2>/dev/null || echo "  Label 'incident-response' already exists"
gh label create "architecture" --color "006b75" --description "Architectural decisions" --repo "$REPO" 2>/dev/null || echo "  Label 'architecture' already exists"

# Special labels
echo "Creating special labels..."
gh label create "epic" --color "3e4b9e" --description "Large multi-issue initiative" --repo "$REPO" 2>/dev/null || echo "  Label 'epic' already exists"

echo ""
echo "✅ All labels created successfully!"
echo ""
echo "View labels at: https://github.com/$REPO/labels"
echo ""
echo "Now run: ./scripts/create-issues.sh"
