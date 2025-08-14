# 1. Node.js ベースイメージ
FROM node:18

# 2. 作業ディレクトリ
WORKDIR /app

# 3. バックエンド依存関係インストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 4. フロントエンド依存関係インストール & ビルド
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && npm run build

# 5. バックエンドとフロントをコピー
COPY backend/ ./backend/
COPY frontend/build/ ./backend/public/

# 6. 環境変数
ENV PORT=4000

# 7. バックエンド起動
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "index.js"]
