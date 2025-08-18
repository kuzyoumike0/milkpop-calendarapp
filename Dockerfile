# ==========================
# 1. フロントエンドをビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm install

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ==========================
# 2. バックエンド
# ==========================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# ✅ フロントのビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
