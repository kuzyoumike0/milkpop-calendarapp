# ===== フロントエンドビルド =====
FROM node:18.20.1-bullseye AS frontend-build
WORKDIR /app/frontend

# メモリ上限
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール（キャッシュクリア + 再試行）
COPY frontend/package*.json ./
RUN npm cache clean --force \
    && npm install --legacy-peer-deps --fetch-retries=5 --fetch-retry-mintimeout=2000

# ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18.20.1-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096

COPY backend/package*.json ./
RUN npm cache clean --force \
    && npm install --legacy-peer-deps --fetch-retries=5 --fetch-retry-mintimeout=2000

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
