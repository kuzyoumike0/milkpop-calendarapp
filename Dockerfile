# ============================
# 1. フロントエンドをビルド
# ============================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# 依存関係をインストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --production=false

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# ============================
# 2. バックエンドをセットアップ
# ============================
FROM node:18-alpine

WORKDIR /app

# バックエンド依存をインストール
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production=false

# バックエンドのソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public へコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production

# ポートを公開
EXPOSE 5000

# サーバー起動
CMD ["node", "index.js"]
