# =============================
# フロントエンド ビルドステージ
# =============================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# フロントエンドソースコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# =============================
# バックエンド ステージ
# =============================
FROM node:18

WORKDIR /app/backend

# 依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV PORT 8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
