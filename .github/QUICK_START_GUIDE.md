# Quick Start: GitHub Branch Protection Setup

This is a condensed guide for immediately implementing branch protection rules for the HUMMBL monorepo main branch.

## 🚀 Immediate Implementation (5 minutes)

### Option 1: GitHub Web UI (Recommended)

1. Go to your repository → **Settings** → **Branches**
2. Click **"Add rule"**
3. Branch name pattern: `main`
4. Check these boxes:
   ```
   ☑️ Require a pull request before merging
     ☑️ Require approvals: 1
     ☑️ Dismiss stale pull request approvals when new commits are pushed
     ☑️ Require review from code owners
   ☑️ Require status checks to pass before merging
     ☑️ Require branches to be up to date before merging
     Add these status checks:
       - CI / Format Check
       - CI / Lint
       - CI / Type Check
       - CI / Test
       - CI / Build
       - CodeQL Security Scanning / Analyze
   ☑️ Include administrators
   ☑️ Require conversation resolution before merging
   ☐ Allow force pushes (leave unchecked)
   ☐ Allow deletions (leave unchecked)
   ```
5. Click **"Create"**

### Option 2: GitHub CLI (Power Users)

```bash
gh api repos/:owner/:repo/branches/main/protection --method PUT --field required_status_checks='{"strict": true, "contexts": ["CI / Format Check", "CI / Lint", "CI / Type Check", "CI / Test", "CI / Build", "CodeQL Security Scanning / Analyze"]}' --field enforce_admins=true --field required_pull_request_reviews='{"required_approving_review_count": 1, "dismiss_stale_reviews": true, "require_code_owner_reviews": true}' --field restrictions=null --field allow_deletions=false --field allow_force_pushes=false --field require_conversation_resolution=true
```

## ✅ Verification (2 minutes)

1. Create a test branch and PR
2. Verify these appear in the PR:
   - [ ] All 6 required CI status checks
   - [ ] "Review required" message
   - [ ] "Branch must be up to date" if behind main
3. Verify merge is blocked until checks pass and review is approved

## 🛡️ What This Protects Against

- ❌ Direct pushes to main branch
- ❌ Merging without CI passing
- ❌ Merging without team review
- ❌ Force pushes and branch deletion
- ❌ Bypassing security scans

## 📋 Status Check Names (Copy-Paste Ready)

```
CI / Format Check
CI / Lint
CI / Type Check
CI / Test
CI / Build
CodeQL Security Scanning / Analyze
```

## 🆘 Troubleshooting

**Status checks not appearing?**

- Wait for CI to run once on main branch first
- Check exact names in your workflow files

**Code owner reviews not working?**

- CODEOWNERS file exists at `/Users/others/Developer/hummbl/hummbl-monorepo/.github/CODEOWNERS`
- Team `@hummbl-dev` has repository access

**Need help?**

- See full guide: [BRANCH_PROTECTION_SETUP.md](/Users/others/Developer/hummbl/hummbl-monorepo/.github/BRANCH_PROTECTION_SETUP.md)
- Use checklist: [BRANCH_PROTECTION_CHECKLIST.md](/Users/others/Developer/hummbl/hummbl-monorepo/.github/BRANCH_PROTECTION_CHECKLIST.md)

## 🎯 Next Steps

1. ✅ Set up automatic validation monitoring:
   - Copy `/Users/others/Developer/hummbl/hummbl-monorepo/.github/workflows/validate-branch-protection.yml` to your workflows
   - This will monitor rules daily and alert on drift

2. ✅ Team communication:
   - Announce the change to your team
   - Share this guide for reference

3. ✅ Schedule quarterly reviews of these settings

---

**⚡ Total setup time: ~7 minutes**
**🔒 Protection level: Maximum**
