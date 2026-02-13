# Docker Development Setup

This document describes the Docker setup for local development of the HUMMBL monorepo.

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| workers | 8787 | Cloudflare Workers API (wrangler dev) |
| dashboard | 5174 | Vite React development server |
| mcp-server | - | MCP server (stdio mode, optional) |

## Usage

### Start Specific Services

```bash
# Start only the API
docker-compose up -d workers

# Start only the dashboard
docker-compose up -d dashboard

# Start with MCP server
docker-compose --profile mcp up -d
```

### Development Workflow

1. **Start the workers API:**
   ```bash
   docker-compose up -d workers
   ```
   Access at: http://localhost:8787

2. **Start the dashboard:**
   ```bash
   docker-compose up -d dashboard
   ```
   Access at: http://localhost:5174

3. **View combined logs:**
   ```bash
   docker-compose logs -f
   ```

### Hot Reload

The Docker setup supports hot reloading:
- Changes to `apps/workers/src` automatically restart wrangler
- Changes to `apps/dashboard/src` trigger Vite HMR
- Changes to `packages/*` rebuild the package and reload dependents

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Node environment |
| `WORKER_URL` | http://localhost:8787 | Workers API URL |
| `VITE_API_URL` | http://localhost:8787 | API URL for dashboard |

## Troubleshooting

### Port Already in Use

If ports 8787 or 5174 are already in use:

```bash
# Find and kill the process
lsof -ti:8787 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

Or modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "8788:8787"  # Use port 8788 on host
```

### Rebuild After Dependency Changes

```bash
# Rebuild a specific service
docker-compose build workers
docker-compose up -d workers

# Rebuild all
docker-compose build
docker-compose up -d
```

### Clean Slate

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Production Notes

These Dockerfiles are optimized for **local development only**. For production:

1. Use multi-stage builds with minimal runtime images
2. Use nginx or similar for serving static files
3. Configure proper secrets management
4. Set up health checks and monitoring
5. Use orchestration (Kubernetes, etc.) for scaling

See `Dockerfile` for a reference production build stage.
