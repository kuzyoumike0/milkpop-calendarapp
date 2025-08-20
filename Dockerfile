# =============================
# フロントエンドビルド
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json だけ先にコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# バックエンド
# =============================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数とポート
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
