
# 本番用 Dockerfile
FROM node:18 AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
COPY --from=build-frontend /app/frontend/dist ./public
EXPOSE 8080
CMD ["node", "server.js"]
