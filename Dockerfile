# 1. Node.js イメージを使用
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. バックエンドの package.json をコピーして依存関係インストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 4. フロントエンドの package.json をコピーして依存関係インストール
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# 5. ソースコードコピー
COPY backend ./backend
COPY frontend ./frontend

# 6. フロントエンドビルド
RUN cd frontend && npm run build

# 7. ビルドしたフロントエンドを backend/public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# 8. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 9. ポート公開
EXPOSE 8080

# 10. サーバー起動
CMD ["node", "index.js"]
