# ==========================
# フロントエンドビルドステージ
# ==========================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# 依存関係を先にコピー
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV NODE_OPTIONS=--max-old-space-size=8192

# React ビルド
RUN npm run build

# ==========================
# バックエンドステージ
# ==========================
FROM node:18

WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドコードとフロントビルドをコピー
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

# ポート設定
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
