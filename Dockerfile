# Stage 1: フロントエンド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: バックエンド
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --legacy-peer-deps
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
