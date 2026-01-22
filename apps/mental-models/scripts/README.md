# Scripts Directory

This directory contains utility scripts for the HUMMBL project.

## Available Scripts

### `create-labels.sh`

**Purpose:** Create standard GitHub labels for the project

**Prerequisites:**

- [GitHub CLI](https://cli.github.com/) installed
- Authenticated with GitHub (`gh auth login`)

**Usage:**

```bash
./scripts/create-labels.sh
```

**Note:** Run this before `create-issues.sh` to ensure labels exist.

---

### `create-issues.sh`

**Purpose:** Batch-create GitHub issues for DevOps Phase 2 roadmap

**Prerequisites:**

- [GitHub CLI](https://cli.github.com/) installed
- Authenticated with GitHub (`gh auth login`)
- **Labels created** (run `./scripts/create-labels.sh` first)

**Usage:**

```bash
# 1. Create labels first
./scripts/create-labels.sh

# 2. Then create issues
./scripts/create-issues.sh
```

**What it creates:**

1. Issue #1: Integrate Sentry for Error Tracking (priority-high)
2. Issue #2: Document Rollback Procedure (priority-high)
3. Issue #3: Enhance Post-Deploy Smoke Tests (priority-medium)
4. Issue #4: Implement Structured Logging (priority-medium)
5. Issue #5: Add Status Page Integration (priority-low)
6. Issue #6: Establish Architecture Decision Records (priority-low)
7. Issue #7: Optional Enhancements Epic (priority-low)

**Note:** Run this script only once to avoid duplicate issues.

---

### `validate-models.mjs`

**Purpose:** Validate mental models JSON schema

**Usage:**

```bash
node scripts/validate-models.mjs
```

---

### Other Scripts

Additional scripts may be added here for:

- Data validation
- Build automation
- Deployment verification
- Backup operations
