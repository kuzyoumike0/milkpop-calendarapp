# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係をコピーしてインストール
COPY frontend/package*.json ./
RUN rm -rf node_modules package-lock.json \
    && npm install --legacy-peer-deps

# フロントエンドソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドビルドステージ
# =============================
FROM node:18 AS backend-build
WORKDIR /app/backend

# 依存関係をコピーしてインストール
COPY backend/package*.json ./
RUN rm -rf node_modules package-lock.json \
    && npm install --legacy-peer-deps

# バックエンドソースをコピー
COPY backend/ ./

# =============================
# 3. 本番ステージ (統合アプリ)
# =============================
FROM node:18
WORKDIR /app

# バックエンドコードをコピー
COPY --from=backend-build /app/backend ./

# フロントエンドのビルド済みファイルを public/ に配置
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# ポートを公開
EXPOSE 8080

# サーバーを起動
CMD ["node", "index.js"]
