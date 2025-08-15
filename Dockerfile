# syntax=docker/dockerfile:1.5

# ===== フロントエンド依存関係 =====
FROM node:20.17-bullseye AS frontend-deps
WORKDIR /app/frontend

COPY frontend/package*.json ./

# 正しい cache key を付与
RUN --mount=type=cache,target=/root/.npm,id=frontend-npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/ ./
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules

ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド依存関係 =====
FROM node:20.17-bullseye AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./

# 正しい cache key を付与
RUN --mount=type=cache,target=/root/.npm,id=backend-npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== バックエンド =====
FROM node:20.17-bullseye AS backend
WORKDIR /app/backend

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public
COPY --from=backend-deps /app/backend/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "index.js"]
