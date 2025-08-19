# =============================
# 1. フロントエンドビルド
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にインストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドセットアップ
# =============================
FROM node:18 AS backend
WORKDIR /app/backend

# 依存関係を先にインストール
COPY backend/package*.json ./
RUN npm install

# ソースコードをコピー
COPY backend/ ./

# フロントのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

# =============================
# 3. 本番実行
# =============================
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
