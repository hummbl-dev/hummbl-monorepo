# @hummbl/workers

Cloudflare Workers REST API for the HUMMBL Base120 mental models framework.

## Quick Start

### Prerequisites

- Node.js ≥18
- Cloudflare account with Workers enabled
- Wrangler CLI (`npm install -g wrangler`)

### Setup

```bash
# Install dependencies
pnpm install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create hummbl-models
# Copy the database_id to wrangler.toml

# Create KV namespace
wrangler kv:namespace create CACHE
# Copy the id to wrangler.toml

# Create R2 bucket
wrangler r2 bucket create hummbl-assets
```

### Development

```bash
# Run locally
pnpm dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy
```

## Architecture

- **Result Pattern** – Every handler returns `Result<T, ApiError>` from `@hummbl/core`. Successful responses are wrapped as `{ ok: true, value }`, while failures produce `{ ok: false, error }` with `code`, `message`, and `status`. All consumers should handle both branches explicitly.
- **Validation** – Query params, path params, and payloads are validated via shared Zod schemas (`ModelFilterSchema`, `ModelCodeSchema`, `TransformationParamSchema`). Invalid inputs never reach the database.
- **Cache Cascade** – Requests flow through in-memory cache → Workers Cache (`caches.open('hummbl-workers')`) → KV namespace (`CACHE`). TTL defaults:
  - Models list: memory 60 s, Workers 5 min, KV 1 h
  - Model detail: memory 60 s, Workers 5 min, KV 1 h
  - Relationships and transformation detail: memory 2 min, Workers 10 min, KV 2 h
  - Transformations list: memory 5 min, Workers 10 min, KV 4 h
    Cache misses hit D1 via prepared statements; cache writes occur after successful DB fetches.
- **Error Handling** – Internal errors log diagnostics but only expose structured ApiError responses to clients.

## API Endpoints

### Models

- `GET /v1/models` – List mental models with filters `transformation`, `search`. Returns cached Result payload.
- `GET /v1/models/:code` – Validates code, returns specific model.
- `GET /v1/models/:code/relationships` – Returns relationships with cache tiering.
- `POST /v1/models/recommend` – Validates body `{ problem: string }`, prioritizes deterministic keyword matching.

### Transformations

- `GET /v1/transformations` – Cached list of Base120 transformations.
- `GET /v1/transformations/:type` – Validates transformation, returns details plus DB-driven models list.

### Health

- `GET /` – API metadata for checks
- `GET /health` – Timestamped heartbeat

## Database Schema

The API expects a D1 database with the following schema:

```sql
CREATE TABLE mental_models (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transformation TEXT NOT NULL,
  definition TEXT NOT NULL,
  whenToUse TEXT NOT NULL,
  example TEXT,
  priority INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_relationships (
  id TEXT PRIMARY KEY,
  source_code TEXT NOT NULL,
  target_code TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  confidence TEXT,
  evidence TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_code) REFERENCES mental_models(code),
  FOREIGN KEY (target_code) REFERENCES mental_models(code)
);
```

## Environment Variables

Set in `wrangler.toml`:

- `ENVIRONMENT` - "production" or "staging"
- `API_VERSION` - API version string (default: "v1")

## Bindings

- **DB** (D1Database) - Mental models database
- **CACHE** (KVNamespace) - Response caching
- **ASSETS** (R2Bucket) - Static assets storage
