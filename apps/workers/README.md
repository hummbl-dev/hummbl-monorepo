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

## API Endpoints

### Models

- `GET /v1/models` - List all mental models
  - Query params: `?transformation=P|IN|CO|DE|RE|SY`
- `GET /v1/models/:code` - Get specific model (e.g., `/v1/models/P1`)
- `GET /v1/models/:code/relationships` - Get model relationships
- `POST /v1/recommend` - Get recommendations based on problem description
  ```json
  { "problem": "I need to simplify a complex system" }
  ```

### Transformations

- `GET /v1/transformations` - List all 6 transformations
- `GET /v1/transformations/:type` - Get transformation details with models

### Health

- `GET /` - API info
- `GET /health` - Health check

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
