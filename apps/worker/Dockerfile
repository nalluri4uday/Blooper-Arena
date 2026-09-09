FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/database/package.json packages/database/
COPY packages/trading-engine/package.json packages/trading-engine/
COPY packages/shared/package.json packages/shared/
COPY tooling/typescript/package.json tooling/typescript/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY tooling/ tooling/
COPY packages/ packages/
COPY apps/worker/ apps/worker/

# Build
RUN pnpm turbo build --filter=@blooper-arena/worker

EXPOSE 3001
CMD ["node", "apps/worker/dist/server.js"]
