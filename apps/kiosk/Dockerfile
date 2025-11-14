# Multi-stage build for React Kiosk PWA in Monorepo

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY apps/kiosk/package.json ./apps/kiosk/

# Configure npm for slow/unstable connections + use local cache
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set maxsockets 3

# Install dependencies with better error handling
RUN npm ci --prefer-offline --no-audit --loglevel=verbose || \
    (npm cache clean --force && npm ci --loglevel=verbose)

# Stage 2: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy root workspace config
COPY package.json package-lock.json* ./

# Copy kiosk source code
COPY apps/kiosk ./apps/kiosk

WORKDIR /app/apps/kiosk

# Pass REACT_APP_* environment variables at build time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Disable telemetry
ENV CI=true

# Build React app (react-scripts build)
# Note: NODE_OPTIONS not needed in Alpine Linux
RUN npm run build 2>&1 || (echo "Build failed, trying without NODE_OPTIONS..." && npm run build)

# Stage 3: Runner with nginx
FROM nginx:alpine AS runner

# Copy nginx config for SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://corevisitor-backend:3006; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/apps/kiosk/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
