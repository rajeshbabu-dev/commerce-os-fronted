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
    # API proxy — uses host.docker.internal to reach backend on host machine
    # (the frontend docker-compose is standalone; backend runs separately)
    location /api/ {\n\
        proxy_pass http://host.docker.internal:8080;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
