# =============================
# フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# =============================
# バックエンドステージ
# =============================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドコードコピー
COPY backend/ ./

# フロントビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV PORT=8080
EXPOSE 8080

# 起動
CMD ["node", "index.js"]
