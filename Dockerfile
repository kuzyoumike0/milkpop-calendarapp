# ============================
# 1. フロントエンドをビルド
# ============================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --production=false

COPY frontend/ ./
RUN npm run build


# ============================
# 2. バックエンドをセットアップ
# ============================
FROM node:18-alpine

WORKDIR /app

# バックエンド依存をインストール
COPY backend/package.json backend/package-lock.json* ./backend/
RUN npm install --production=false --prefix backend

# バックエンドソースをコピー
COPY backend/ ./backend/

# フロントエンドのビルド成果物を backend 側にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# backend フォルダの package.json を使って起動
CMD ["npm", "start", "--prefix", "backend"]
