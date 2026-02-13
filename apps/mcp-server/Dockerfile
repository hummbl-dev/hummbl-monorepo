# MCP Server - Model Context Protocol Server
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9.14.4

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/mcp-server/package.json ./apps/mcp-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY packages/tsconfig ./packages/tsconfig
COPY packages/eslint-config ./packages/eslint-config
COPY apps/mcp-server ./apps/mcp-server

# Build core package (dependency)
RUN pnpm --filter @hummbl/core build

WORKDIR /app/apps/mcp-server

# Build the MCP server
RUN pnpm build

CMD ["node", "dist/index.js"]
