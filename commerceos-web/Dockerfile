# syntax=docker/dockerfile:1
# =============================================================================
# CommerceOS Frontend — Multi-stage Dockerfile
# =============================================================================
# Stage 1: Build the Vite/React application
# Stage 2: Serve with Nginx
#
# npm ci is deterministic and faster than npm install. The npm cache is kept
# on the host's build cache via a BuildKit cache mount, so packages download
# once and are reused across rebuilds.
# =============================================================================

# -- Stage 1: Build -----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source and build
COPY . .
RUN --mount=type=cache,target=/root/.npm npm run build

# -- Stage 2: Serve -----------------------------------------------------------
FROM nginx:alpine AS runtime

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx configuration for SPA routing + API proxy
# IMPORTANT: /api/ must come BEFORE the catch-all / location
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Resolve service names at request time via Docker embedded DNS so nginx\n\
    # starts even when the backend container is not yet available\n\
    resolver 127.0.0.11 valid=10s ipv6=off;\n\
\n\
    # API proxy — uses Docker service name when running in root docker-compose.yml\n\
    location /api/ {\n\
        set $backend_upstream http://backend:8080;\n\
        proxy_pass $backend_upstream;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    # Hashed assets — cache aggressively (Vite adds content hash to filename)\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
        # No-cache for HTML to always get latest index.html with new asset hashes\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Keep nginx in the foreground so Docker sees it as alive
CMD ["nginx", "-g", "daemon off;"]
