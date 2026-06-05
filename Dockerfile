# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
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

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
