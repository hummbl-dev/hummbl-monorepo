# Workers API - Cloudflare Workers Local Development
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9.14.4

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/workers/package.json ./apps/workers/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY packages/tsconfig ./packages/tsconfig
COPY packages/eslint-config ./packages/eslint-config
COPY apps/workers ./apps/workers

# Build core package (dependency)
RUN pnpm --filter @hummbl/core build

# Install wrangler globally for dev server
RUN npm install -g wrangler

WORKDIR /app/apps/workers

EXPOSE 8787

CMD ["wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
