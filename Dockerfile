# ============================
# 1. フロントエンドをビルド
# ============================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --production=false

# ソースコピーしてビルド
COPY frontend/ ./
RUN npm run build


# ============================
# 2. バックエンドをセットアップ
# ============================
FROM node:18-alpine

WORKDIR /app

# バックエンド依存インストール
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production=false

# バックエンドのソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を backend 側にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

# ポート公開
EXPOSE 5000

# サーバー起動
CMD ["npm", "start", "--prefix", "backend"]
