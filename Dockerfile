# =====================
# フロントビルドステージ
# =====================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json を先にコピー（依存関係キャッシュ用）
COPY frontend/package*.json ./

# 安定のためクリーンインストール
RUN npm install react-scripts@5.0.1

# フロントソースコピー
COPY frontend/ ./

# メモリ制限増加（大規模ビルド対応）
ENV NODE_OPTIONS=--max-old-space-size=8192

# React ビルド
RUN npm run build

# =====================
# バックエンドステージ
# =====================
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンド public 配下にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート指定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
