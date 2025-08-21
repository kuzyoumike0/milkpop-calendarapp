# ==========================
# 1. フロントエンドのビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にインストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY frontend ./
RUN npm run build


# ==========================
# 2. バックエンド（Express）
# ==========================
FROM node:18
WORKDIR /app/backend

# backend の依存関係
COPY backend/package*.json ./
RUN npm install

# backend ソースをコピー
COPY backend . .

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ../frontend/build

# Railway 用ポート
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
