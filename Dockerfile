# =====================
# 1. フロントエンドビルド
# =====================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json だけ先にコピーして依存インストール
COPY frontend/package*.json ./
RUN npm install

# 残りのフロントソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =====================
# 2. バックエンド用
# =====================
FROM node:18
WORKDIR /app/backend

# backend の package.json をコピーして依存インストール
COPY backend/package*.json ./
RUN npm install

# backend のソースをコピー
COPY backend/ ./

# フロントビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート公開 & 起動
EXPOSE 4000
CMD ["node", "index.js"]
