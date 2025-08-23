# ==============================
# 1. ビルドステージ（フロントエンド）
# ==============================
FROM node:18 AS build-frontend

WORKDIR /app/frontend

# 依存関係をインストール
COPY frontend/package.json ./
RUN npm install

# ソース一式をコピー
COPY frontend ./

# React ビルド
RUN npm run build

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

# フロントのビルド成果物をコピー
COPY --from=build-frontend /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# ====== ここを修正 ======
# WORKDIR を backend にしてから index.js を起動
WORKDIR /app/backend
CMD ["node", "index.js"]
