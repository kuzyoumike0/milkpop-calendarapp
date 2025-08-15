# 1. フロントビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. バックエンドと統合
FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./backend
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 8080
CMD ["node", "backend/index.js"]
