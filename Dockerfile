# ==== フロントエンドビルド ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係だけコピーしてインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンドステージ ====
FROM node:18
WORKDIR /app/backend

# 依存関係だけコピーしてインストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を配置
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
