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

# ホストでビルド済みのフロントビルドをコピー
COPY frontend/build ./public

# ポート指定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
