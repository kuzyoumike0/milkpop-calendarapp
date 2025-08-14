# ---------------------
# フロントビルドステージ
# ---------------------
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係をコピーしてインストール
COPY frontend/package*.json ./
RUN npm install

# フロントソースコピー
COPY frontend/ ./

# メモリ制限を緩和（大規模ビルド対応）
ENV NODE_OPTIONS=--max-old-space-size=4096

# React ビルド
RUN npm run build

# ---------------------
# バックエンドステージ
# ---------------------
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドの public 配下にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート指定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
