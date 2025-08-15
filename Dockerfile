# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# 依存関係インストール（完全クリーン + 安定インストール）
COPY frontend/package*.json ./
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --fetch-retries=15 --fetch-retry-mintimeout=10000

# フロントエンドコードコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --fetch-retries=15 --fetch-retry-mintimeout=10000

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放 & サーバ起動
EXPOSE 8080
CMD ["node", "index.js"]
