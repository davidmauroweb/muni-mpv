# muni-mpv
## Arquitectura
La arquitectura utilizada esta basada en contenedores donde se ejecutan los distintos servicios:
* DB: Utiliza Postgres 16 para la persistencia de datos.
* Backend: Donde se encuentra la lógica desarrollada en laravel que atiende las solicitudes de nginx para resolverlas con el acceso a la base de datos y validación de roles de utuarios.
* Nginx: Servicio web que conecta el front en React con el backend.
* Frontend: Interfaz en React.

## Decisión Técnica
El backend se desarrolla utilizando Laravel por su robustez y escalabilidad publicando los endpoints para poder ser utilizado desde diversas plataformas autenticando usuarios y manteniendo los roles a travez de JWT.

## Correr el proyecto
El proyecto se descarga desde GIT con :

`git clone https://github.com/davidmauroweb/muni-mpv`

`cd muni-mpv`

`cp backend/.env.example backend/.env`

`docker compose up`

Al iniciar los contenedores éstos realizan automaticamente las migraciones con los seeders de prueba (backend/database/seeders/DatabaseSeeder.php)

## Permisos y roles:
Los roles están filtrado por ruta.  En (backend/routes/api.php)

## Ajustes
En frontend/services/api.ts colocar el dominio en baseURL: "http://localhost:8000/api"<br>
En frontend/vite.config.ts colocar agregar debajo de host:0.0.0.0<br>
        hmr: {<br>
          host: 'dominio.com',<br>
          protocol: 'wss', // Para utilizar Https<br>
        }