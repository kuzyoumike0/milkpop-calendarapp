# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# npm を最新安定版にアップデート
RUN npm install -g npm@11.5.2

# package.json と package-lock.json だけ先にコピー
COPY frontend/package*.json ./

# node_modules とキャッシュを完全削除して再インストール
RUN rm -rf node_modules /tmp/npm-cache \
    && npm ci --legacy-peer-deps --force --prefer-offline=false \
       --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# フロントエンドコードコピー
COPY frontend/ ./

# フロントエンドビルド
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# npm を最新安定版にアップデート
RUN npm install -g npm@11.5.2

# バックエンド依存関係コピー
COPY backend/package*.json ./
RUN rm -rf node_modules /tmp/npm-cache \
    && npm ci --legacy-peer-deps --force --prefer-offline=false \
       --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放 & サーバ起動
EXPOSE 8080
CMD ["node", "index.js"]
