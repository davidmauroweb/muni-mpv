#!/bin/sh

if [ ! -d "vendor" ]; then
    composer install
fi

# Esperar a que Postgres esté listo (reintento simple)
echo "Esperando a que la base de datos esté lista..."
until curl -s http://db:5432 || [ $? -eq 52 ]; do
  sleep 1
done

echo "Ejecutando Laravel setup..."
php artisan migrate:fresh --seed --force
php artisan jwt:secret --force --skip-if-configured