# GitHub Branch Protection Rules Setup Guide

This document provides comprehensive instructions for implementing branch protection rules for the HUMMBL monorepo's main branch.

## Overview

The branch protection rules enforce security and quality standards by requiring:

- All CI checks to pass before merging
- Code owner reviews for all changes
- Up-to-date branches before merging
- Dismissal of stale reviews when new commits are pushed

## Required Status Checks

Based on the existing CI workflows, the following status checks must pass:

### CI Workflow Checks (`.github/workflows/ci.yml`)

- `CI / Format Check` - Ensures code formatting standards
- `CI / Lint` - Validates code quality and style
- `CI / Type Check` - Verifies TypeScript type safety
- `CI / Test` - Runs all test suites
- `CI / Build` - Confirms successful project build

### Security Checks (`.github/workflows/codeql.yml`)

- `CodeQL Security Scanning / Analyze` - Scans for security vulnerabilities

## Implementation Methods

### Method 1: GitHub Web Interface

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Select "Branches" from the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule" or "Add branch protection rule"
   - Enter `main` in the "Branch name pattern" field

3. **Configure Protection Settings**

   #### General Settings
   - ☑️ Restrict pushes that create files larger than 100 MB
   - ☑️ Require a pull request before merging
     - ☑️ Require approvals: 1
     - ☑️ Dismiss stale pull request approvals when new commits are pushed
     - ☑️ Require review from code owners
     - ☑️ Restrict pushes that create files larger than 100 MB (if available)

   #### Status Checks
   - ☑️ Require status checks to pass before merging
   - ☑️ Require branches to be up to date before merging
   - Search and add these required status checks:
     - `CI / Format Check`
     - `CI / Lint`
     - `CI / Type Check`
     - `CI / Test`
     - `CI / Build`
     - `CodeQL Security Scanning / Analyze`

   #### Additional Restrictions
   - ☑️ Include administrators
   - ☑️ Require conversation resolution before merging
   - ☐ Allow force pushes (keep unchecked)
   - ☐ Allow deletions (keep unchecked)

4. **Save Changes**
   - Click "Create" to apply the branch protection rule

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Other platforms: https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Navigate to your repository directory
cd /path/to/hummbl-monorepo

# Create branch protection rule
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{
    "strict": true,
    "contexts": [
      "CI / Format Check",
      "CI / Lint",
      "CI / Type Check",
      "CI / Test",
      "CI / Build",
      "CodeQL Security Scanning / Analyze"
    ]
  }' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  }' \
  --field restrictions=null \
  --field allow_deletions=false \
  --field allow_force_pushes=false \
  --field require_conversation_resolution=true
```

### Method 3: REST API with curl

```bash
# Set your GitHub token and repository details
GITHUB_TOKEN="your_personal_access_token"
OWNER="hummbl-dev"
REPO="hummbl-monorepo"

curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$OWNER/$REPO/branches/main/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "CI / Format Check",
        "CI / Lint",
        "CI / Type Check",
        "CI / Test",
        "CI / Build",
        "CodeQL Security Scanning / Analyze"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "require_last_push_approval": false
    },
    "restrictions": null,
    "allow_deletions": false,
    "allow_force_pushes": false,
    "require_conversation_resolution": true
  }'
```

## Verification Steps

After implementing the branch protection rules, verify they are working correctly:

1. **Check Protection Status**

   ```bash
   gh api repos/:owner/:repo/branches/main/protection
   ```

2. **Test with a Pull Request**
   - Create a test branch and make a small change
   - Open a pull request to main
   - Verify that all required status checks appear
   - Verify that merge is blocked until checks pass and review is provided

3. **Verify Code Owner Requirements**
   - Ensure that changes to files covered by CODEOWNERS require review from specified teams
   - Test that non-code-owner reviews don't satisfy the requirement

## Status Check Names Reference

The following table shows the exact status check names as they appear in GitHub:

| Workflow File | Job Name   | GitHub Status Check Name             |
| ------------- | ---------- | ------------------------------------ |
| `ci.yml`      | format     | `CI / Format Check`                  |
| `ci.yml`      | lint       | `CI / Lint`                          |
| `ci.yml`      | type-check | `CI / Type Check`                    |
| `ci.yml`      | test       | `CI / Test`                          |
| `ci.yml`      | build      | `CI / Build`                         |
| `codeql.yml`  | analyze    | `CodeQL Security Scanning / Analyze` |

## Troubleshooting

### Common Issues

1. **Status checks not appearing**
   - Ensure the workflow has run at least once on the main branch
   - Check that the job names match exactly (case-sensitive)
   - Verify workflow files are in the correct location

2. **Code owner reviews not required**
   - Verify CODEOWNERS file exists in `.github/` directory
   - Check that the file follows the correct format
   - Ensure code owners are valid GitHub users/teams

3. **Administrators can still push directly**
   - Verify "Include administrators" option is enabled
   - Note that repository owners may still have override capabilities

### Getting Status Check Names

To find the exact names of status checks:

```bash
# List recent check runs for main branch
gh api repos/:owner/:repo/commits/main/check-runs

# Or check a recent pull request
gh pr view <pr-number> --json statusCheckRollup
```

## CODEOWNERS Integration

The repository includes a CODEOWNERS file at `/Users/others/Developer/hummbl/hummbl-monorepo/.github/CODEOWNERS` with the following key assignments:

- **Global**: `@hummbl-dev` owns all files by default
- **Backend/Infrastructure**: `/apps/workers/`, `/apps/mcp-server/`
- **Frontend**: `/apps/web/`, `/packages/ui/`
- **Core Packages**: `/packages/core/`, configuration files
- **Security**: `/SECURITY.md`, `/.github/agent-policy.yaml`

## Best Practices

1. **Regular Review**: Review and update branch protection rules quarterly
2. **Documentation**: Keep this guide updated when workflows change
3. **Testing**: Test protection rules with non-administrative accounts
4. **Monitoring**: Monitor for bypassed rules or failed enforcement
5. **Team Training**: Ensure all team members understand the protection requirements

## Support

For issues with branch protection setup:

1. Check GitHub's branch protection documentation
2. Verify team permissions and access levels
3. Test with different user accounts to ensure rules apply correctly
4. Contact repository administrators for permission-related issues
