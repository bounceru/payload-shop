# Use a base Node 18 Alpine image
FROM node:18-alpine AS base

# Install build dependencies (only if you use canvas or sharp)
FROM base AS deps
RUN apk add --no-cache \
    python3 make g++ pkgconfig \
    pixman pixman-dev cairo cairo-dev pango pango-dev \
    libjpeg-turbo-dev giflib-dev \
    libc6-compat

WORKDIR /app

# Install dependencies based on available lockfile
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild source when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Final production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 stagepass

# Copy build outputs
COPY --from=builder /app/public ./public
RUN mkdir .next && chown stagepass:nodejs .next
COPY --from=builder --chown=stagepass:nodejs /app/.next/standalone ./
COPY --from=builder --chown=stagepass:nodejs /app/.next/static ./.next/static

USER stagepass

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
