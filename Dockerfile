# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096

# npm キャッシュを Docker 内に分離
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# 依存関係インストール用 package.json コピー
COPY frontend/package*.json ./

# node_modules とキャッシュを完全削除して安定インストール
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --force --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# フロントエンドコードコピー
COPY frontend/ ./

# フロントエンドビルド
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --force --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放 & サーバ起動
EXPOSE 8080
CMD ["node", "index.js"]
