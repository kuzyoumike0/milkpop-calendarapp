# ===============================
# 1. ビルドステージ (フロントエンド)
# ===============================
FROM node:18 AS frontend-build

WORKDIR /app

# frontend の依存関係をインストール
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ===============================
# 2. 実行ステージ (バックエンド)
# ===============================
FROM node:18

WORKDIR /app

# backend の依存関係をインストール
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

# backend ソースコピー
COPY backend ./backend

# frontend のビルド成果物を backend にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# 起動コマンド
CMD ["node", "backend/index.js"]
