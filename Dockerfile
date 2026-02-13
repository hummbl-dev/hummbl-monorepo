# HUMMBL Monorepo - Base Development Image
# 
# This is a multi-stage Dockerfile for local development.
# For production builds, use platform-specific Dockerfiles.

FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.14.4

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/
COPY tests/package.json ./tests/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages (required for workspace dependencies)
RUN pnpm --filter @hummbl/core build
RUN pnpm --filter @hummbl/ui build

# Development stage
FROM base AS development

ENV NODE_ENV=development

EXPOSE 5173 5174 8787

CMD ["pnpm", "dev"]

# Production build stage (for reference)
FROM base AS production-build

ENV NODE_ENV=production

RUN pnpm build

# Production runtime (for reference)
FROM nginx:alpine AS production

COPY --from=production-build /app/apps/dashboard/dist /usr/share/nginx/html
COPY --from=production-build /app/apps/chat/dist /usr/share/nginx/html/chat

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
