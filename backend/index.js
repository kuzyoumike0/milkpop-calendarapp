# ===== 1. ビルド環境 (フロントエンド) =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と lockファイルをコピー
COPY frontend/package*.json ./
RUN npm install

# フロントのソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# ===== 2. 本番環境 (バックエンド + フロント配信) =====
FROM node:18 AS backend
WORKDIR /app

# バックエンド依存をインストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# バックエンドソースコードをコピー
COPY backend ./backend

# フロントのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./backend/public

# 環境変数
ENV NODE_ENV=production
WORKDIR /app/backend

# ポート解放
EXPOSE 3000

# サーバー起動
CMD ["node", "index.js"]
