# syntax=docker/dockerfile:1.4

# ===== 依存関係インストールステージ =====
FROM node:18-alpine AS deps
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN --mount=type=cache,id=frontend-npm,target=/root/.npm \
    npm install

# ===== ビルドステージ =====
FROM node:18-alpine AS build
WORKDIR /app/frontend

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

# ===== 実行ステージ =====
FROM node:18-alpine AS runner
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドソースとフロントビルドをコピー
COPY backend/ ./
COPY --from=build /app/frontend/build ./public

# 環境変数
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
