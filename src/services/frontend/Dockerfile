FROM node:22-alpine AS frontend

WORKDIR /frontend

COPY src/services/frontend/package*.json ./
RUN npm ci

COPY src/services/frontend/index.html ./index.html
COPY src/services/frontend/vite.config.js ./vite.config.js
COPY src/services/frontend/src/ ./src/
COPY src/services/frontend/static/ ./static/
RUN npm run build

FROM nginx:alpine

ENV NGINX_ENVSUBST_FILTER=^(CHAT_SERVICE_URL|DASHBOARD_SERVICE_URL|INGESTION_SERVICE_URL)$

COPY src/services/frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=frontend /frontend/dist/ /usr/share/nginx/html/

EXPOSE 80
