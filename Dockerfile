# 1. Node.jsイメージ
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. package.json 全コピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 4. ソースコード全コピー
COPY backend ./backend
COPY frontend ./frontend

# 5. バックエンド依存関係インストール
RUN cd backend && npm install

# 6. フロントエンド依存関係インストール
RUN cd frontend && npm install

# 7. フロントエンドビルド
RUN cd frontend && npm run build

# 8. ビルドしたフロントをバックエンド public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# 9. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 10. ポート公開
EXPOSE 8080

# 11. サーバー起動
CMD ["node", "index.js"]
