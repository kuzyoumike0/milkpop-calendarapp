# ========== フロントエンドビルド ==========
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm ci

# ソースコードコピー & ビルド
COPY frontend/ ./
RUN CI=false npm run build


# ========== バックエンド ==========
FROM node:18 AS backend
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm ci

# ソースコードコピー
COPY backend/ ./

# ✅ フロントエンドのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ====== 本番実行 ======
EXPOSE 5000
CMD ["npm", "start"]
