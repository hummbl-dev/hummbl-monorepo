# Deploy Feature Workflow

This workflow handles the complete deployment cycle for new HUMMBL features.

## Prerequisites
- Feature branch created from main
- Local development tested
- All files staged for commit

## Steps

### 1. Pre-Flight Checks
```bash
# Run all quality checks
pnpm lint
pnpm type-check
pnpm build

# Verify no console.log statements
grep -r "console.log" src/ --exclude-dir=node_modules
```

### 2. Commit & Push
```bash
# Commit with conventional format
git commit -m "feat(scope): description"

# Push to remote
git push origin feature/branch-name
```

### 3. GitHub Actions Validation
- Wait for all CI checks to pass
- Review build logs if failures occur
- Fix issues and push again

### 4. Create Pull Request
- Use descriptive title (same as commit message)
- Fill out PR template:
  - What changed
  - Why it changed
  - Testing performed
  - Screenshots (for UI changes)
  - Which HUMMBL models informed the design

### 5. Merge to Main
```bash
# Squash merge (keeps history clean)
git checkout main
git pull origin main
git merge --squash feature/branch-name
git push origin main
```

### 6. Verify Vercel Deployment
- Check Vercel dashboard for deployment status
- Visit https://hummbl.io to verify changes live
- Test critical user flows
- Check browser console for errors

### 7. Cleanup
```bash
# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name
```

## Emergency Rollback

If production breaks:

```bash
# Revert the last commit on main
git revert HEAD
git push origin main

# Vercel will auto-deploy the rollback
```

## Notes
- Vercel deploys automatically on push to main
- Preview deployments are disabled (main only)
- CI runs on every push (linting, type-checking, build)
- Estimated deploy time: 2-3 minutes
