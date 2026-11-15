FROM node:24-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend ci
COPY frontend ./frontend
COPY shared ./shared
RUN npm --prefix frontend run build
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
