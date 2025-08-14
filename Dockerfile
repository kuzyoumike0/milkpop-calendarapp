# 1. フロントビルド専用
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. バックエンド + 静的ファイル用
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# フロントビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 4000
CMD ["node", "index.js"]
