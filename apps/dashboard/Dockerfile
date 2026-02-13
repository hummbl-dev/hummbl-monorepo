# Dashboard - Vite React Development Server
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9.14.4

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/dashboard/package.json ./apps/dashboard/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY packages/ui ./packages/ui
COPY packages/tsconfig ./packages/tsconfig
COPY packages/eslint-config ./packages/eslint-config
COPY apps/dashboard ./apps/dashboard

# Build packages (dependencies)
RUN pnpm --filter @hummbl/core build
RUN pnpm --filter @hummbl/ui build

WORKDIR /app/apps/dashboard

EXPOSE 5174

CMD ["pnpm", "dev", "--host"]
