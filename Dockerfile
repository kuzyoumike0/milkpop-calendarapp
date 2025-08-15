# ===== フロントエンドビルド =====
FROM node:18.20.1-bullseye AS frontend-build
WORKDIR /app/frontend

# メモリ上限を増やす
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18.20.1-bullseye
WORKDIR /app/backend

ENV NODE_OPTIONS=--max_old_space_size=4096

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
