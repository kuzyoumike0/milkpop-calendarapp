# =====================
# フロントビルドステージ
# =====================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# package.json と package-lock.json を先にコピーして依存関係インストール
COPY frontend/package*.json ./
RUN npm ci

# フロントソース全コピー
COPY frontend/ ./

# ビルド時メモリ制限を設定（大規模アプリでも安全）
ENV NODE_OPTIONS=--max-old-space-size=4096

# React ビルド
RUN npm run build

# =====================
# バックエンドステージ
# =====================
FROM node:18

WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm ci

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドの public 配下にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV PORT=8080

EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
