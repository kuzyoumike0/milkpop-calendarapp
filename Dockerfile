# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係をコピーしてインストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンドビルド =====
FROM node:18 AS backend
WORKDIR /app

# バックエンド依存関係をコピーしてインストール
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm install

# バックエンドコードをコピー
COPY backend/ ./ 

# ===== 最終ステージ =====
FROM node:18-slim
WORKDIR /app

# PostgreSQL の依存ライブラリ（pg用）
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# バックエンドコピー
COPY --from=backend /app/backend /app/backend

# フロントエンドのビルド成果物をバックエンドに渡す
COPY --from=frontend-build /app/frontend/build /app/backend/public

WORKDIR /app/backend

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "index.js"]
