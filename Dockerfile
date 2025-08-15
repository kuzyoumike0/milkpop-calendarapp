# syntax=docker/dockerfile:1.4

# ===== 依存関係インストール =====
FROM node:18-alpine AS deps
WORKDIR /app/frontend

# package.json と package-lock.json をコピー
COPY frontend/package*.json ./

# キャッシュマウントIDにプレフィックスを付与 (例: npm-cache-frontend)
RUN --mount=type=cache,id=npm-cache-frontend,target=/root/.npm \
    npm ci --legacy-peer-deps

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

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
