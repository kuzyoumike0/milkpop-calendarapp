# ====== ビルド用ステージ ======
FROM node:18 AS build

# 作業ディレクトリ
WORKDIR /app

# フロントエンド依存関係をコピーしてインストール
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

# バックエンド依存関係をコピーしてインストール
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

# フロントエンドのソースをコピーしてビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ====== 実行ステージ ======
FROM node:18

WORKDIR /app

# バックエンドのみコピー
COPY --from=build /app/backend ./backend

# フロントエンドのビルド成果物を backend/build にコピー
COPY --from=build /app/frontend/build ./backend/build

# バックエンド依存関係（本番用のみ）
WORKDIR /app/backend
RUN npm install --production

# ポートを公開
EXPOSE 3000

# サーバー起動
CMD ["node", "index.js"]
