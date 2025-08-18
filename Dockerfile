# ================================
# 1. フロントエンド ビルドステージ
# ================================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# package.json と lock ファイルをコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# フロントエンドの全ソースをコピー
COPY frontend/ ./

# React をビルド（静的ファイルを生成）
RUN npm run build


# ================================
# 2. バックエンド セットアップ
# ================================
FROM node:18 AS backend

WORKDIR /app/backend

# package.json と lock ファイルをコピーして依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドの全ソースをコピー
COPY backend/ ./

# フロントのビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
