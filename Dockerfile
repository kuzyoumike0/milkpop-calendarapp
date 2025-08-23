# ==============================
# 1. ビルドステージ（フロントエンド）
# ==============================
FROM node:18 AS build-frontend

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# ==============================
# 2. 本番ステージ（バックエンド + フロント配信）
# ==============================
FROM node:18

WORKDIR /app

# バックエンドの依存関係をインストール
COPY backend/package.json ./backend/
RUN cd backend && npm install --only=production

# バックエンドのソースをコピー
COPY backend ./backend

# フロントのビルド済みファイルをコピー
COPY --from=build-frontend /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# ====== backend を WORKDIR にして起動 ======
WORKDIR /app/backend
CMD ["node", "index.js"]
