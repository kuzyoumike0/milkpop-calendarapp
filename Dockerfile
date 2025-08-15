# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build
WORKDIR /app/frontend

# Node 20 には npm 11 が標準で入っている
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール（キャッシュ破棄 + 再試行）
COPY frontend/package*.json ./
RUN rm -rf /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=10 --fetch-retry-mintimeout=5000

# フロントエンドビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096

COPY backend/package*.json ./
RUN rm -rf /root/.npm \
    && npm install --legacy-peer-deps --fetch-retries=10 --fetch-retry-mintimeout=5000

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
