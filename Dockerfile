# syntax=docker/dockerfile:1.4

# ====== 依存関係インストールステージ ======
FROM node:18-alpine AS deps
WORKDIR /app

# package.json と package-lock.json をコピー
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# npm キャッシュをマウントして依存関係をインストール
RUN --mount=type=cache,target=/root/.npm \
    cd frontend && npm ci --legacy-peer-deps && \
    cd ../backend && npm ci

# ====== フロントエンドビルドステージ ======
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

# ====== バックエンドステージ ======
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./

# フロントビルドをバックエンド public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "index.js"]
