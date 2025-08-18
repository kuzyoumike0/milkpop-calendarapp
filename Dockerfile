# ==== フロントエンドビルドステージ ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係のみ先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# フロントエンドソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンドステージ ====
FROM node:18 AS backend
WORKDIR /app/backend

# 依存関係をインストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# バックエンドソースをコピー
COPY backend/ ./

# フロントエンドのビルド済みファイルを配置
COPY --from=frontend-build /app/frontend/build ./public

# ポート設定と起動コマンド
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
