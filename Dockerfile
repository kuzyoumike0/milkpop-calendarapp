# ======================
# 1. フロントエンドビルドステージ
# ======================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json 先にコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# フロントのソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ======================
# 2. バックエンドステージ
# ======================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポートと起動コマンド
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
