# --------------------
# バックエンド
# --------------------
FROM node:18

WORKDIR /app/backend

# package.json インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドコードコピー
COPY backend/ ./

# 事前ビルド済みのフロントをコピー
COPY frontend/build ./public

# ポート設定
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
