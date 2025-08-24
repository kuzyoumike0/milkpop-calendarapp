# ========== フロントエンドのビルド ==========
FROM node:18 AS builder
WORKDIR /app

# 依存関係のインストール
COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend ./ 
RUN npm run build

# ========== バックエンドの実行 ==========
FROM node:18
WORKDIR /app

# backend の依存関係をインストール
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm install

# ソースコードをコピー
COPY backend ./ 
# フロントエンドのビルド成果物をコピー
COPY --from=builder /app/frontend/build ./../frontend/build

# サーバー起動
CMD ["node", "index.js"]
