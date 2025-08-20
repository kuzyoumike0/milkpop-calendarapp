# ==============================
# 1. フロントエンドビルドステージ
# ==============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json をコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# フロントソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==============================
# 2. バックエンドステージ
# ==============================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数とポート設定
ENV PORT=8080
EXPOSE 8080

# アプリ起動
CMD ["node", "index.js"]
