FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    postgresql-client

# Extensiones necesarias para PostgreSQL
RUN docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY inicio.sh /usr/local/bin/inicio.sh
RUN chmod +x /usr/local/bin/inicio.sh

WORKDIR /var/www

RUN mkdir -p /var/www/storage/framework/views \
             /var/www/storage/framework/cache \
             /var/www/storage/framework/sessions \
             /var/www/bootstrap/cache

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

ENTRYPOINT ["inicio.sh"]