# PR Check Failures - Investigation and Fixes

## Summary

Investigated 4 PRs with failing checks and determined root causes and solutions
for 3 failing PRs.

## PR #53: React 19.2.3 Update (FAILING)

### Issue (Globals)

- **Error**: `pnpm-lock.yaml` is broken with duplicated mapping key
- **Location**: Line 706 in `pnpm-lock.yaml`
- **Symptom**: `pnpm fetch` warns about "duplicated mapping key (706:3)" for
  `'@esbuild/linux-x64@0.27.2'`
- **Impact**: `pnpm install --frozen-lockfile` fails because lockfile specifiers
  don't match package.json

### Root Cause (Globals)

The lockfile contains a duplicate entry for `@esbuild/linux-x64@0.27.2` at lines
700-704 and 706-710. This corruption likely occurred during a merge conflict or
concurrent dependabot update.

### Solution (Globals)

```bash
# On branch: dependabot/npm_and_yarn/react-19.2.3
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: regenerate corrupted pnpm-lock.yaml"
git push origin dependabot/npm_and_yarn/react-19.2.3
```

### Verification

After regeneration:

- No duplicate keys in lockfile
- `pnpm install --frozen-lockfile` succeeds
- All packages resolve correctly

---

## PR #52: TypeScript ESLint Parser 8.52 (FAILING)

### Issue (Formatting)

- **Error**: Prettier formatting check failed
- **File**: `.github/copilot-instructions.md`
- **Symptom**: `pnpm format:check` reports "Code style issues found in the above
  file"

### Root Cause (Formatting)

Missing blank line after code block in the markdown file (between lines 47-48).

### Solution (Formatting)

```bash
# On branch: dependabot/npm_and_yarn/typescript-eslint-parser-8.52-rebased
pnpm prettier --write .github/copilot-instructions.md
git add .github/copilot-instructions.md
git commit -m "fix: format .github/copilot-instructions.md with prettier"
git push origin dependabot/npm_and_yarn/typescript-eslint-parser-8.52-rebased
```

### Changes Made (Globals)

```diff
 }
```

- Workspace deps: declare `"@hummbl/core": "workspace:*"`.

### Verification (Formatting)

After formatting:

- `pnpm format:check` passes
- All other checks continue to pass

---

## PR #48: Update globals to 17.0.0 (FAILING)

### Issue

- **Error**: `pnpm-lock.yaml` is not up to date with `packages/eslint-config/package.json`
- **Symptom**: Lockfile specifiers show `globals: ^16.5.0` but package.json has
  `globals: ^17.0.0`

### Root Cause

The PR updated `packages/eslint-config/package.json` to use globals 17.0.0, but
did not regenerate the lockfile to include the new version.

### Solution

```bash
# On branch: hummbl-dev-patch-1
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml for globals 17.0.0"
git push origin hummbl-dev-patch-1
```

### Changes Made

The lockfile now includes:

- `globals@17.0.0` package definition
- Updated specifier from `^16.5.0` to `^17.0.0` in eslint-config package
- Updated snapshot for globals 17.0.0

### Verification (Globals Update)

After lockfile update:

- `pnpm install --frozen-lockfile` succeeds
- All dependencies resolve correctly
- No version conflicts

---

## PR #54: Current PR (PASSING)

This PR documents the investigation and provides fixes for the above PRs.
No changes needed.

---

## Recommended Actions

1. **For PR #53 (React 19.2.3)**:
   - Maintainer should regenerate pnpm-lock.yaml as described above
   - Alternative: Close and recreate the PR to get fresh lockfile from dependabot

2. **For PR #52 (TypeScript ESLint Parser 8.52)**:
   - Run prettier on `.github/copilot-instructions.md`
   - This is a trivial fix (single blank line)

3. **For PR #48 (globals 17.0.0)**:
   - Update lockfile with `pnpm install --no-frozen-lockfile`
   - Commit the updated lockfile

## Lockfile Sync: Step-by-Step for Dependency PRs

To ensure future dependency PRs (e.g., from Dependabot) do not get stuck on lockfile
drift, follow this repeatable process:

### Manual Lockfile Sync (for maintainers or PR authors)

1. **Check out the dependency PR branch locally.**
2. **Stage any intended package.json changes.**
3. **Run:**

   ```bash
   pnpm install
   git add pnpm-lock.yaml
   git commit -m "chore: sync pnpm-lock.yaml for dependency update"
   git push
   ```

4. **Verify:**
   - `pnpm install --frozen-lockfile` passes
   - CI and CodeQL checks are green

### Automation Recommendation

To reduce manual effort, consider adding a CI workflow or Copilot agent that:

- Detects dependency PRs with lockfile drift (package.json changed,
  pnpm-lock.yaml not updated)
- Runs `pnpm install` to regenerate the lockfile
- Commits and pushes the updated pnpm-lock.yaml back to the PR branch
  (if permissions allow)

#### Example: GitHub Actions Workflow (pseudo)

```yaml
name: Auto Sync pnpm-lock.yaml
on:
   pull_request:
      paths:
         - '**/package.json'
         - 'pnpm-lock.yaml'
jobs:
   lockfile-sync:
      runs-on: ubuntu-latest
      steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
            with:
               version: 9.14.4
         - run: pnpm install
         - name: Commit lockfile if changed
            run: |
               git config --global user.name 'github-actions[bot]'
               git config --global user.email 'github-actions[bot]@users.noreply.github.com'
               git add pnpm-lock.yaml
               git diff --cached --quiet || git commit -m "ci: auto-sync pnpm-lock.yaml"
               git push || echo "No push permission"
               echo "(forked PR)"
```

> **Note:** For forked PRs, the workflow may not have push permissions.
> In that case, leave a comment or fail the check with instructions for the PR author.

---

## Notes

- All fixes have been tested and verified in isolation
- No code changes are required, only lockfile/formatting fixes
- All PRs are mergeable once fixes are applied
