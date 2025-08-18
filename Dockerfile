# ==========================
# フロントエンドビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# まず package.json をコピーして依存インストール
COPY frontend/package*.json ./
RUN npm install

# その後ソースをコピー
COPY frontend/ ./

# ビルド
RUN npm run build
