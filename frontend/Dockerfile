FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Servir con Nginx)
# Usamos una imagen ligera para el resultado final
FROM nginx:stable-alpine
# Copiamos el resultado del build a la carpeta que Nginx servirá
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Exponemos el puerto interno
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]