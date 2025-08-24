# ========== フロントエンドのビルド ==========
FROM node:18 AS builder
WORKDIR /app/frontend

# package.json をコピーして依存関係インストール（lock ファイルがなくてもOK）
COPY frontend/package.json ./
RUN npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend ./ 
RUN npm run build

# ========== バックエンドの実行 ==========
FROM node:18
WORKDIR /app/backend

# backend の依存関係をインストール
COPY backend/package.json ./
RUN npm install

# ソースコードをコピー
COPY backend ./ 
# フロントエンドのビルド成果物をコピー
COPY --from=builder /app/frontend/build ./../frontend/build

# サーバー起動
CMD ["node", "index.js"]
