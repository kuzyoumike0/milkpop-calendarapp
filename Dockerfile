# Node 18 使用
FROM node:18 AS build

# 作業ディレクトリ
WORKDIR /app

# 依存関係用 package.json 先にコピー
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 依存関係インストール
RUN cd frontend && npm install
RUN cd backend && npm install

# フロントエンドコピー & ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# バックエンドコピー
COPY backend ./backend

# ビルド成果物をバックエンド public に配置
RUN rm -rf backend/public
RUN mv frontend/build backend/public

# 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# ポート公開
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
