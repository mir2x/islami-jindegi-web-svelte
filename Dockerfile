FROM node:22-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nothing is baked in: the site reads these when it starts. The build args only set defaults, so an
# image built by CI still works when run without environment variables.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_NOINDEX
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN pnpm build

# Production dependencies only: the server bundle imports just `adhan` and `sharp` at runtime.
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM node:22-alpine AS runner
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_NOINDEX
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_NOINDEX=$NEXT_PUBLIC_NOINDEX \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 svelte
COPY --from=prod-deps --chown=svelte:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=svelte:nodejs /app/build ./build
COPY --chown=svelte:nodejs package.json ./

USER svelte
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", "build"]
