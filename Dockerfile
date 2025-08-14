# ---------------------
# バックエンド + フロント静的配信
# ---------------------
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# 事前にローカルでビルドした React をコピー
# 例: frontend/build ディレクトリが存在すること
COPY frontend/build ./public

# ポート指定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
