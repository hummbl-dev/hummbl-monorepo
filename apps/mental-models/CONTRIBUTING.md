# Contributing to HUMMBL

Welcome! Thank you for your interest in contributing to the HUMMBL Cognitive Framework project. This guide will help you get started with development and understand our workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [CI/CD Workflows](#cicd-workflows)
- [Security Guidelines](#security-guidelines)
- [GitHub Actions Best Practices](#github-actions-best-practices)

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x (required)
- **npm**: 10.x or higher
- **Git**: Latest version

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/hummbl-dev/hummbl-io.git
   cd hummbl-io
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to see your changes live.

4. **Run tests**

   ```bash
   npm test              # Run tests once
   npm test -- --watch   # Run tests in watch mode
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview       # Preview production build
   ```

### Project Structure

```
hummbl-io/
├── .github/workflows/   # CI/CD workflows
├── public/              # Static assets and data files
│   ├── data/           # JSON data (narratives, models, etc.)
│   └── models.json     # Mental models dataset
├── src/
│   ├── components/     # React components
│   │   ├── mental-models/  # Mental models display
│   │   └── narratives/     # Narratives display
│   ├── services/       # Data fetching services
│   ├── utils/          # Utility functions
│   └── __tests__/      # Test files
└── scripts/            # Build and validation scripts
```

---

## Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm test              # Run all tests
   npm run build         # Ensure build succeeds
   ```

4. **Commit with a descriptive message**

   ```bash
   git add .
   git commit -m "feat: add new mental model filtering feature"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Guidelines

- **TypeScript**: Use proper typing, avoid `any` when possible
- **Testing**: Maintain or improve code coverage
- **Accessibility**: Ensure UI changes are accessible (proper contrast, ARIA labels)
- **Performance**: Consider performance impact of changes
- **Documentation**: Update README or docs for significant changes

---

## CI/CD Workflows

Our project uses several GitHub Actions workflows to ensure code quality and deployment reliability:

### Main Workflows

#### 1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)

**Triggers:** Push to `main` or `develop`, Pull Requests  
**Purpose:** Run tests, build, and deploy to Vercel  
**Jobs:**

- `test` - Runs Vitest test suite with coverage
- `build` - Builds production bundle and deploys to Vercel

#### 2. **CI - Phase3 Enhanced** (`.github/workflows/ci-phase3.yml`)

**Triggers:** Push to `main`, Pull Requests  
**Purpose:** Comprehensive validation and quality checks  
**Jobs:**

- Validates mental models schema
- Runs Lighthouse performance audits
- Runs Axe accessibility audits
- Collects telemetry metrics

#### 3. **Pre-Deploy Verification** (`.github/workflows/pre-deploy-verification.yml`)

**Triggers:** Pull Requests to `main`  
**Purpose:** Verify build integrity before deployment  
**Jobs:**

- Validates build process
- Checks data integrity
- Comments verification results on PR

#### 4. **Post-Deploy Verification** (`.github/workflows/post-deploy-verification.yml`)

**Triggers:** Push to `main` or `develop`  
**Purpose:** Verify production deployment health  
**Jobs:**

- Validates production data integrity
- Generates compliance reports
- Uploads verification artifacts

#### 5. **Scheduled Integrity Check** (`.github/workflows/scheduled-integrity-check.yml`)

**Triggers:** Daily at 3 AM UTC  
**Purpose:** Continuous production monitoring  
**Jobs:**

- Verifies production data hasn't been tampered with
- Alerts on integrity failures

### Current Implementation Status

#### ✅ Already Implemented

- [x] Secrets stored in GitHub Secrets (`VERCEL`, `FG_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `CODECOV_TOKEN`)
- [x] Node.js 20.x specified across all workflows
- [x] npm dependency caching enabled (`actions/setup-node@v4` with `cache: 'npm'`)
- [x] `continue-on-error` for non-blocking checks (audits, deployments)
- [x] Descriptive job names and step annotations
- [x] Test coverage reporting to Codecov
- [x] Artifact uploads for audit reports and compliance data
- [x] All workflows use GitHub Actions v4

#### 🔄 In Progress / To Consider

- [ ] Pin third-party actions to commit SHA
- [ ] Add OIDC for Vercel deployments
- [ ] Add workflow-level timeouts
- [ ] Add concurrency controls for deployments
- [ ] Establish artifact attestations

---

## Security Guidelines

### **CRITICAL: Never Commit Secrets**

❌ **DO NOT commit:**

- API tokens or credentials
- `.env` files with real secrets
- Private keys or certificates
- Personal access tokens

✅ **DO:**

- Use GitHub Secrets for sensitive values
- Use `.env.example` as a template (no real values)
- Store tokens in a secure password manager locally
- Rotate credentials regularly

### Secrets Configuration

**Required GitHub Secrets:**

- `VERCEL` - Vercel deployment token
- `FG_TOKEN` - Fine-grained GitHub personal access token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `CODECOV_TOKEN` - Codecov upload token (optional)

**To add secrets:**

1. Go to `https://github.com/hummbl-dev/hummbl-io/settings/secrets/actions`
2. Click "New repository secret"
3. Enter name and value
4. Click "Add secret"

**See also:** [SECURITY_CLEANUP.md](./SECURITY_CLEANUP.md) for detailed security guidelines.

---

## GitHub Actions Best Practices

This checklist ensures our CI/CD workflows remain secure, efficient, and maintainable.

### Security (Highest Priority)

- [x] Store sensitive values in GitHub Secrets
- [ ] Use least privilege: restrict token scopes and cloud roles; rotate credentials regularly
- [ ] Never print secrets in logs
- [ ] Use OpenID Connect (OIDC) for cloud auth instead of long-lived credentials
- [ ] Pin third-party actions to a specific commit SHA (avoid floating refs)
- [ ] Establish provenance and artifact attestations for critical builds

### Workflow Design & Reliability

- [x] Keep jobs small and single-purpose
- [x] Add descriptive job names and use step-level `name:` fields
- [ ] Use reusable workflows and composite actions to reduce duplication
- [ ] Use `concurrency` to prevent conflicting runs for deployments
- [ ] Add job-level and workflow-level timeouts

### Performance, Cost Control & Caching

- [x] Cache dependencies with `actions/setup-node` cache
- [x] Limit triggers: configure branch/path filters
- [ ] Reuse runners where it makes sense
- [ ] Choose hosted vs self-hosted based on cost/performance

### Secrets, Artifacts & Observability

- [x] Store secrets in GitHub Secrets
- [x] Upload logs and debug artifacts on failures
- [x] Use `continue-on-error:` for non-blocking checks
- [ ] Enable and monitor Actions usage metrics and failure trends

### Deployment Hardening

- [ ] Use least-privilege cloud roles and OIDC for deployment workflows
- [ ] Use protected branches and required checks for production
- [ ] Require manual approvals for sensitive production jobs

### Operational Tips & Workflow Hygiene

- [x] Test workflows iteratively in branches before merging to main
- [x] Break workflows into smaller, composable pieces
- [ ] Document workflow purpose, inputs, outputs in workflow file headers
- [ ] Add retries where appropriate

---

## Quick Links

**GitHub Documentation:**

- [Actions Security Guide](https://docs.github.com/actions/security-guides)
- [Reusable Workflows](https://docs.github.com/actions/using-workflows/reusing-workflows)
- [Concurrency Controls](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
- [Dependency Caching](https://docs.github.com/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

**Project Resources:**

- [Live Site](https://www.hummbl.io)
- [GitHub Repository](https://github.com/hummbl-dev/hummbl-io)
- [GitHub Actions](https://github.com/hummbl-dev/hummbl-io/actions)

---

## Questions or Issues?

- **Bug reports:** Open an issue on GitHub
- **Feature requests:** Open an issue with the `enhancement` label
- **Questions:** Start a discussion in GitHub Discussions

Thank you for contributing to HUMMBL! 🚀
