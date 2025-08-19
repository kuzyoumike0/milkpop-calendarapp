# =============================
# 1. フロントエンドビルド
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドセットアップ
# =============================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係をインストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコードコピー
COPY backend/ ./

# フロントのビルド済みファイルを backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数とポート
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
