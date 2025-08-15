# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール（キャッシュ破棄 + 再試行）
COPY frontend/package*.json ./
RUN rm -rf /app/frontend/node_modules /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=15 --fetch-retry-mintimeout=10000

# フロントエンドビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN rm -rf /app/backend/node_modules /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=15 --fetch-retry-mintimeout=10000

# バックエンドコードコピー
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
