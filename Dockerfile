# ==============================
# 1. ビルドステージ（フロントエンド）
# ==============================
FROM node:18 AS build-frontend

WORKDIR /app

# フロントエンド依存関係をインストール
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ==============================
# 2. 本番ステージ（バックエンド + フロント配信）
# ==============================
FROM node:18

WORKDIR /app

# バックエンド依存関係をインストール
COPY backend/package.json ./backend/
RUN cd backend && npm install --only=production

# バックエンドのソースをコピー
COPY backend ./backend

# フロントのビルド済みファイルをコピー
COPY --from=build-frontend /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

# ポート公開
EXPOSE 5000

# バックエンド起動（Reactビルドを配信）
CMD ["node", "backend/index.js"]
