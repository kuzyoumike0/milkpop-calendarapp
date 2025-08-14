# 1. Node.jsイメージを使用
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. パッケージインストール用のコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 4. バックエンド・フロントエンド依存関係インストール
RUN cd backend && npm install
RUN cd frontend && npm install

# 5. フロントエンドをビルド
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 6. バックエンドファイルをコピー
COPY backend/ ./backend/

# 7. ビルドしたフロントをバックエンド public に配置
RUN rm -rf backend/public
RUN mv frontend/build backend/public

# 8. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 9. ポートを公開
EXPOSE 8080

# 10. サーバー起動
CMD ["node", "index.js"]
