# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# アプリコピー
COPY frontend/ ./

# Reactビルド
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN npm run build

# ===== バックエンド + 静的ファイル提供 =====
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドコードコピー
COPY backend/ ./

# フロントビルドをバックエンドの public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# フォアグラウンドで Node.js を起動
CMD ["node", "index.js"]
