#!/bin/sh

if [ ! -d "vendor" ]; then
    composer install
fi

# Esperar a que Postgres esté listo (reintento simple)
echo "Esperando a que la base de datos esté lista..."
until pg_isready -h db -p 5432 -U user || [ $? -eq 52 ]; do
  sleep 1
done

echo "Ejecutando Laravel setup..."
php artisan migrate:fresh --seed
php artisan jwt:secret

echo "Iniciando PHP-FPM..."
exec php-fpm