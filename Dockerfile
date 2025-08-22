# ====== Stage 1: フロントエンドをビルド ======
FROM node:18 AS frontend-build

# 作業ディレクトリ
WORKDIR /app/frontend

# package.json をコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# ====== Stage 2: バックエンドをセットアップ ======
FROM node:18

# 作業ディレクトリ
WORKDIR /app/backend

# backend の依存関係インストール
COPY backend/package*.json ./
RUN npm install

# backend ソースコードをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public フォルダへコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート公開
EXPOSE 3000

# サーバー起動
CMD ["node", "index.js"]
