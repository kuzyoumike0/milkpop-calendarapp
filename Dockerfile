# ==========================
# 1. フロントエンドビルド
# ==========================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# package.json インストール
COPY frontend/package*.json ./

# npm ci --force から npm install に変更
RUN npm install

# アプリコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max-old-space-size=4096

# React ビルド
RUN npm run build

# ==========================
# 2. バックエンド
# ==========================
FROM node:18 AS backend

WORKDIR /app/backend

# package.json インストール
COPY backend/package*.json ./

# npm ci --force から npm install に変更
RUN npm install

# バックエンドコードコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/frontend/build ./public

# サーバー起動ポート
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
