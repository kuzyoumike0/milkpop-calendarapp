# ============================
# 1. フロントエンドビルドステージ
# ============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json & lock ファイルを先にコピー
COPY frontend/package*.json ./

# 依存関係をインストール
RUN npm install --legacy-peer-deps

# フロントエンドソースをコピー
COPY frontend/ ./

# OpenSSL3 対応: 古いハッシュ関数を許可
ENV NODE_OPTIONS=--openssl-legacy-provider

# React ビルド
RUN npm run build

# ============================
# 2. バックエンドステージ
# ============================
FROM node:18 AS backend
WORKDIR /app/backend

# backend の依存関係をインストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public に配置
COPY --from=frontend-build /app/frontend/build ./public

# ポート設定
ENV PORT=8080
EXPOSE 8080

# アプリ起動
CMD ["node", "index.js"]
