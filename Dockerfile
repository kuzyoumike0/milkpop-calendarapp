# ---------------------
# フロントビルドステージ
# ---------------------
FROM node:18 AS frontend-build
WORKDIR /app

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm ci

# フロントソースコピー
COPY frontend/ ./

# メモリ制限緩和
ENV NODE_OPTIONS=--max-old-space-size=4096

# Reactビルド
RUN npm run build

# ---------------------
# バックエンドステージ
# ---------------------
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm ci

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物を public 配下にコピー
COPY --from=frontend-build /app/build ./public

# ポート指定
ENV PORT 8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
