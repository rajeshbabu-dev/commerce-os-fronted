# =============================================================================
# CommerceOS Frontend — Multi-stage Dockerfile
# =============================================================================
# Stage 1: Build the Vite/React application
# Stage 2: Serve with Nginx
# =============================================================================

# -- Stage 1: Build -----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

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
    # API proxy — uses Docker service name when running in root docker-compose.yml\n\
    location /api/ {\n\
        proxy_pass http://backend:8080;\n\
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

CMD ["nginx", "-g", "daemon off;"]
