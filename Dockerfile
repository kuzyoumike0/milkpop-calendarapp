# 1. Node.jsベースイメージ
FROM node:18 AS build

WORKDIR /app

# 2. バックエンド依存関係インストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 3. フロントエンド依存関係インストール
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# 4. フロントエンドソースコピー＆ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# 5. バックエンドソースコピー
COPY backend ./backend

# 6. ビルドしたフロントを backend/public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# 7. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 8. ポート公開
EXPOSE 8080

# 9. サーバー起動
CMD ["npm", "start"]
