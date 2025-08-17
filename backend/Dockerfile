# Backend + Frontend をまとめて Railway で動かす
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
