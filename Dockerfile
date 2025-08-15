# ===== フロントエンド依存関係 =====
FROM node:20.17-bullseye AS frontend-deps
WORKDIR /app/frontend

# package.json と package-lock.json のみコピー
COPY frontend/package*.json ./

# BuildKit キャッシュを正しく使用
RUN --mount=type=cache,id=frontend-npm-cache,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/ ./
# 依存関係をコピー
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules

# Node メモリ制限を緩める
ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye AS backend
WORKDIR /app/backend

# package.json と package-lock.json のみコピー
COPY backend/package*.json ./

# BuildKit キャッシュを使用
RUN --mount=type=cache,id=backend-npm-cache,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドの build を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート指定
EXPOSE 8080

# 起動コマンド
CMD ["node", "index.js"]
