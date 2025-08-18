# ==== フロントエンドビルドステージ ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係だけ先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンドステージ ====
FROM node:18
WORKDIR /app/backend

# バックエンドの依存関係をインストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY backend/ ./

# フロントエンド成果物を配置
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
