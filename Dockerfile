# ── Stage 1: Build Frontend Assets ──
FROM node:20-alpine AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ── Stage 2: PHP Application Environment ──
FROM php:8.3-cli-alpine

# Install system dependencies & PHP extensions for Laravel + SQLite
RUN apk add --no-cache \
    curl \
    git \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo_sqlite \
    bcmath \
    mbstring \
    gd \
    zip \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .
COPY --from=node_builder /app/public/build ./public/build

# Copy manifest to ensure root public/build/manifest.json is available
RUN cp ./public/build/.vite/manifest.json ./public/build/manifest.json 2>/dev/null || true

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set directory permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create sqlite database if not exists
RUN touch /var/www/html/database/database.sqlite \
    && chown www-data:www-data /var/www/html/database/database.sqlite \
    && chmod 775 /var/www/html/database/database.sqlite

# Create deployment startup script
RUN printf '#!/bin/sh\n\
php artisan migrate --force\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
PORT=${PORT:-10000}\n\
echo "Starting FinanceOS on port $PORT..."\n\
php artisan serve --host=0.0.0.0 --port=$PORT\n' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

EXPOSE 10000

CMD ["/entrypoint.sh"]
