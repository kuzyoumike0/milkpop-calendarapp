# ==========================
# 1. フロントエンドビルド
# ==========================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm ci --force

# アプリコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max-old-space-size=4096

# Reactビルド
RUN npm run build

# ==========================
# 2. バックエンド
# ==========================
FROM node:18 AS backend

WORKDIR /app/backend

# package.json インストール
COPY backend/package*.json ./
RUN npm ci --force

# バックエンドコードコピー
COPY backend/ ./

# フロントビルドの成果物をバックエンドにコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数をDockerに渡す場合は以下で設定可能
# ENV DATABASE_URL=postgres://user:pass@db:5432/calendar

EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
