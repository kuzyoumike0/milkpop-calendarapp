# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# 依存関係インストール用の package.json コピー
COPY frontend/package*.json ./

# キャッシュ削除 & 安定インストール
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --fetch-retries=15 --fetch-retry-mintimeout=10000 || \
       (cat /root/.npm/_logs/* && exit 1)

# フロントエンドコードコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN rm -rf node_modules /tmp/npm-cache \
    && npm install --legacy-peer-deps --prefer-offline=false --fetch-retries=15 --fetch-retry-mintimeout=10000 || \
       (cat /root/.npm/_logs/* && exit 1)

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放 & サーバ起動
EXPOSE 8080
CMD ["node", "index.js"]
