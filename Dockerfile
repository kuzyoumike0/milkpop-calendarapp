# 1. Node.jsイメージを使用
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. パッケージインストール用のコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 4. バックエンド依存関係インストール
RUN cd backend && npm install

# 5. フロントエンド依存関係インストール（react-router-dom含む）
RUN cd frontend && npm install && npm install react-router-dom

# 6. フロントエンドソースコードコピー＆ビルド
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 7. バックエンドソースコードコピー
COPY backend/ ./backend/

# 8. ビルドしたフロントをバックエンド public に配置
RUN rm -rf backend/public
RUN mv frontend/build backend/public

# 9. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 10. ポートを公開
EXPOSE 8080

# 11. サーバー起動
CMD ["node", "index.js"]
