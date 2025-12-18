# HUMMBL Quick Start Guide

## 🚀 One-Command Setup

### Start Everything

```bash
pnpm dev:all
```

Launches all services with color-coded logs:

- 🔵 MCP Server (port 3001)
- 🟢 Web App (port 5173)
- 🟡 Workers (port 8787)

### Validate Environment

```bash
pnpm env-check
```

Checks Node.js, pnpm, Git, files, dependencies, and build status.

## 📊 Daily Workflow

### Morning

```bash
pnpm env-check        # Validate setup
pnpm enhanced-report  # Review metrics
pnpm dev:all         # Start development
```

### Evening

```bash
pnpm enhanced-report  # See accomplishments
pnpm benchmark       # Track performance
```

## 🛠 Development Commands

| Command         | Purpose                          |
| --------------- | -------------------------------- |
| `pnpm dev:all`  | Start all services (recommended) |
| `pnpm dev`      | Start with Turbo (parallel)      |
| `pnpm build`    | Build all packages               |
| `pnpm test`     | Run all tests                    |
| `pnpm validate` | Full quality check               |

## 📈 Analytics Commands

| Command                | Purpose                  |
| ---------------------- | ------------------------ |
| `pnpm enhanced-report` | Complete daily analytics |
| `pnpm benchmark`       | Performance baseline     |
| `pnpm auto-report`     | Git-based progress       |
| `pnpm report`          | Manual template          |

## 🔧 Environment Setup

1. **Copy environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Validate setup**:

   ```bash
   pnpm env-check
   ```

4. **Start development**:
   ```bash
   pnpm dev:all
   ```

## 🎯 Service URLs

- **Web App**: http://localhost:5173
- **Workers API**: http://localhost:8787
- **MCP Server**: Stdio transport (no HTTP)

## 💡 Tips

- Use `Ctrl+C` to stop all services
- Check `reports/` for daily analytics
- Run `pnpm benchmark` weekly for trends
- Environment variables in `.env` override defaults

---

_Updated: 2025-12-18_
