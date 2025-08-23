# ==============================
# 1. ビルドステージ（フロントエンド）
# ==============================
FROM node:18 AS build-frontend

WORKDIR /app/frontend

# 依存関係をインストール
COPY frontend/package.json ./
RUN npm install

# ソース一式をコピー（craco.config.js も含む）
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
WORKDIR /app/backend
RUN npm install --only=production

# バックエンドのソースをコピー
COPY backend ./backend

# フロントエンドのビルド成果物をコピー
COPY --from=build-frontend /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "index.js"]
