# Stage 1: ベースイメージ
FROM node:18 AS base
WORKDIR /app

# Stage 2: バックエンドセットアップ
FROM node:18 AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# Stage 3: フロントビルド済みコピー
# ローカルで npm run build を済ませた dist フォルダをコピー
COPY frontend/dist ../frontend/dist

ENV PORT=8080
CMD ["node", "index.js"]
