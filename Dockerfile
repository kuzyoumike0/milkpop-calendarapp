# === フロントエンドビルドステージ ===
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# === バックエンドステージ ===
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# フロントエンドのビルド済みファイルを backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数とポート
ENV PORT=8080
EXPOSE 8080

# 起動コマンド
CMD ["node", "index.js"]
