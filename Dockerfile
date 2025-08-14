# ==========================
# 1. バックエンド用 Node
# ==========================
FROM node:18

WORKDIR /app

# 依存関係インストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# バックエンドコードコピー
COPY backend/ ./backend/

# フロントビルド済みファイルをコピー
# ローカルで npm run build した frontend/build を使用
COPY frontend/build ./backend/public

# ポート設定
EXPOSE 8080

# サーバー起動
WORKDIR /app/backend
CMD ["node", "index.js"]
