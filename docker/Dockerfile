# ShopFloor AI - Production Dockerfile
# Multi-stage build for optimized production image using Bun

# Stage 1: Dependencies
FROM oven/bun:latest AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:latest AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV=production

# Bun can run the Next.js build script
RUN bun run build

# Stage 3: Runner
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user (Debian-based for oven/bun)
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/public ./public

# Copy standalone output
# output: 'standalone' in next.config.ts is required for this to work
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
