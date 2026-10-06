# syntax=docker/dockerfile:1.7
# Multi-stage image. Targets:
#   web    — the Next.js server (default)
#   tools  — full toolchain for `prisma migrate deploy` and the notification worker
ARG NODE_VERSION=22.22.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY . .
# SITE_URL is baked into metadata, sitemap and canonical URLs at build time.
ARG SITE_URL=http://localhost:3000
ENV SITE_URL=${SITE_URL}
RUN npm run build

FROM base AS tools
ENV NODE_ENV=production
COPY --from=build /app ./
USER node
CMD ["npm", "run", "notifications:process"]

FROM base AS web
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
