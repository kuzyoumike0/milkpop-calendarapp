# ===== フロントエンド依存関係 =====
FROM node:20.17-bullseye AS frontend-deps
WORKDIR /app/frontend

COPY frontend/package*.json ./

# 正しい cache key 形式に修正
RUN --mount=type=cache,id=cache-frontend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/ ./
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules

ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye AS backend
WORKDIR /app/backend

COPY backend/package*.json ./

# こちらも cache key を付与
RUN --mount=type=cache,id=cache-backend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
