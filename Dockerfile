# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# Single source of truth: package.json version (override with --build-arg APP_VERSION if needed)
ARG APP_VERSION
RUN if [ -n "$APP_VERSION" ]; then \
      export NEXT_PUBLIC_APP_VERSION="$APP_VERSION"; \
    else \
      export NEXT_PUBLIC_APP_VERSION="$(node -p "require('./package.json').version")"; \
    fi && \
    npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV PORT=80
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 80"]
