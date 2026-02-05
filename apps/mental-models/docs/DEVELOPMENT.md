# hummbl-io Development Guide

## 📋 Project Overview

hummbl-io is a monorepo built with:

- **Package Manager:** pnpm (required)
- **Build Tool:** Vite
- **Framework:** React 19 + TypeScript
- **Deployment:** Vercel
- **Node Version:** 20.x

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x
- pnpm (will be installed automatically)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/hummbl-dev/hummbl-io.git
cd hummbl-io

# Install pnpm globally (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Verify setup
pnpm run typecheck
pnpm run build
```

---

## 📁 Monorepo Structure

```
hummbl-io/
├── shared/           # Shared utilities and types
├── server/           # Backend services
├── infrastructure/   # Infrastructure code
├── mobile/          # Mobile app code
├── src/             # Main application source
└── pnpm-workspace.yaml  # Workspace configuration
```

---

## 🛠️ Common Commands

### Development

```bash
# Start dev server
pnpm run dev

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Format code
pnpm run format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:dev

# Run with coverage
pnpm run test:coverage
```

### Building

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Build types only
pnpm run build:types
```

### Cleaning

```bash
# Remove all build artifacts and dependencies
pnpm run clean
```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Run type checking: `pnpm run typecheck`
- Run tests: `pnpm test`

### 3. Commit Changes

Git hooks will automatically run:

- **Pre-commit:** Linting and formatting on staged files
- **Pre-push:** (Tests currently disabled due to memory optimization)

```bash
git add .
git commit -m "feat: your feature description"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### 5. Merge to Main

Once approved, merge your PR. **Only `main` branch deploys to production.**

---

## 🚢 Deployment

### Automatic Deployment

**Production deployments happen automatically:**

- Push to `main` → Vercel builds → Deploys to hummbl.io
- **Preview deployments are disabled** to avoid build failures on feature branches

### Build Process

When you push to `main`, Vercel:

1. Runs `pnpm install --frozen-lockfile`
2. Executes `pnpm run build:types` (prebuild)
3. Runs `pnpm run build` (Vite build)
4. Deploys `dist/` folder

### Manual Deployment

```bash
# Deploy to production (requires Vercel access)
vercel --prod

# View deployment logs
vercel logs --follow
```

---

## ⚙️ Configuration Files

### pnpm Configuration

**`pnpm-workspace.yaml`** - Defines workspace packages

```yaml
packages:
  - 'shared'
  - 'server'
  - 'infrastructure'
  - 'mobile'
```

**`.npmrc`** - pnpm settings

```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
prefer-frozen-lockfile=false
resolution-mode=highest
node-linker=isolated
```

### Vercel Configuration

**`vercel.json`** - Deployment settings

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "outputDirectory": "dist"
}
```

---

## 🔧 Troubleshooting

### "This project requires pnpm"

**Solution:** Install pnpm globally

```bash
npm install -g pnpm
```

### Lockfile conflicts

**Solution:** Regenerate lockfile

```bash
rm pnpm-lock.yaml
pnpm install
```

### Git hooks not running

**Solution:** Reinstall hooks

```bash
pnpm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### Build fails locally

**Solution:** Clean install

```bash
pnpm run clean
pnpm install
pnpm run build
```

### TypeScript errors

**Solution:** Rebuild types

```bash
pnpm run build:types
```

---

## 📝 Code Standards

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring

**Examples:**

```
feat: add user authentication
fix: resolve login redirect issue
chore: update dependencies
docs: update API documentation
```

### Code Style

- **Linting:** ESLint (runs automatically on commit)
- **Formatting:** Prettier (runs automatically on commit)
- **Type Checking:** TypeScript strict mode

---

## 🏗️ Architecture

### Build Pipeline

```
Source Code
    ↓
Type Checking (tsc)
    ↓
Linting (ESLint)
    ↓
Testing (Vitest)
    ↓
Build (Vite)
    ↓
Deploy (Vercel)
```

### Package Management

- **pnpm** provides faster installs and better disk efficiency
- **Workspaces** allow sharing code between packages
- **Frozen lockfile** ensures reproducible builds

---

## 🔐 Environment Variables

### Local Development

Create `.env.local` (gitignored):

```env
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=your-sentry-dsn
```

### Production

Configure in Vercel Dashboard:

- Project Settings → Environment Variables
- Add production values

---

## 📚 Additional Resources

### Documentation

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [pnpm Documentation](https://pnpm.io)
- [TypeScript Documentation](https://www.typescriptlang.org)

### Internal

- Architecture docs: `/docs/architecture.md`
- API docs: `/docs/api.md`
- Deployment guide: `/docs/deployment.md`

---

## 🆘 Getting Help

### Common Issues

1. Check this guide's Troubleshooting section
2. Search closed issues on GitHub
3. Ask in team Slack/Discord

### Reporting Bugs

Create an issue with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

---

## 📊 Key Metrics

### Build Performance

- **Average build time:** ~25 seconds
- **Bundle size:** ~428 KB (gzipped: ~122 KB)
- **Dependencies:** ~1,749 packages

### Development Stats

- **Node version:** 20.x
- **pnpm version:** 10.x
- **TypeScript version:** 5.x
- **React version:** 19.x

---

## ✅ Checklist for New Developers

- [ ] Clone repository
- [ ] Install pnpm globally
- [ ] Run `pnpm install`
- [ ] Verify build: `pnpm run build`
- [ ] Run tests: `pnpm test`
- [ ] Create feature branch
- [ ] Make a test commit (hooks should run)
- [ ] Review this documentation
- [ ] Join team communication channels

---

## 🎯 Next Steps

After setup:

1. Review the codebase structure
2. Run the app locally (`pnpm run dev`)
3. Pick your first issue/task
4. Follow the development workflow above
5. Create your first PR

**Welcome to the team!** 🚀
