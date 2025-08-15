# ===== フロントエンドビルド =====
FROM node:18.20.1-bullseye AS frontend-build
WORKDIR /app/frontend

# npm を最新安定版に更新
RUN npm install -g npm@11.5.2

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール（キャッシュ破棄 + 再試行）
COPY frontend/package*.json ./
RUN rm -rf /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=10 --fetch-retry-mintimeout=5000

# フロントエンドビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18.20.1-bullseye
WORKDIR /app/backend

# npm 最新安定版
RUN npm install -g npm@11.5.2

# Node メモリ増加
ENV NODE_OPTIONS=--max_old_space_size=4096

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN rm -rf /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=10 --fetch-retry-mintimeout=5000

# バックエンドコードコピー
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
