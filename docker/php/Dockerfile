FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# Extensiones necesarias para PostgreSQL
RUN docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY inicio.sh /usr/local/bin/inicio.sh
RUN chmod +x /usr/local/bin/inicio.sh

WORKDIR /var/www

ENTRYPOINT ["inicio.sh"]