# ===== フロントエンド依存関係ステージ =====
FROM node:20.17-bullseye AS frontend-deps
WORKDIR /app/frontend

# npm キャッシュを BuildKit キャッシュに置き換え
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit --fetch-retries=10 --fetch-retry-mintimeout=5000

# ===== フロントエンドビルドステージ =====
FROM frontend-deps AS frontend-build
COPY frontend/ ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンドステージ =====
FROM node:20.17-bullseye AS backend
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit --fetch-retries=10 --fetch-retry-mintimeout=5000

# バックエンドコード
COPY backend/ ./

# フロントエンド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放
EXPOSE 8080

# サーバ起動
CMD ["node", "index.js"]
