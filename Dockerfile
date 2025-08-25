# ============================
# 1. フロントエンドをビルド
# ============================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --production=false

COPY frontend/ ./
RUN npm run build


# ============================
# 2. バックエンドをセットアップ
# ============================
FROM node:18-alpine AS backend

WORKDIR /app

# バックエンドの依存関係をインストール
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production=false

# バックエンドソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# Express サーバーを起動
EXPOSE 3000
CMD ["npm", "start"]
