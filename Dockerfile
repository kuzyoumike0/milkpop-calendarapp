# ===== フロントエンド依存関係 =====
FROM node:20.17-bullseye AS frontend-deps
WORKDIR /app/frontend

# package.json だけ先にコピー
COPY frontend/package*.json ./

# npm キャッシュを利用して依存関係インストール
RUN --mount=type=cache,id=cache-frontend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/ ./

# 依存関係をコピー（キャッシュ済み）
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules

ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye AS backend
WORKDIR /app/backend

# package.json だけ先にコピー
COPY backend/package*.json ./

# npm キャッシュを利用して依存関係インストール
RUN --mount=type=cache,id=cache-backend-npm,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit \
    --fetch-retries=10 --fetch-retry-mintimeout=5000

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放
EXPOSE 8080

# サーバ起動
CMD ["node", "index.js"]
