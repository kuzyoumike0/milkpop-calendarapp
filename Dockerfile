# 1. Node.jsイメージ
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. パッケージコピー（フロントとバック両方）
COPY backend/package*.json ./backend/
COPY backend/package-lock.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/package-lock.json ./frontend/

# 4. 依存関係インストール
RUN cd backend && npm install
RUN cd frontend && npm install

# 5. フロントエンドビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# 6. バックエンドコピー
COPY backend ./backend

# 7. フロントをバックエンド public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# 8. 作業ディレクトリ変更
WORKDIR /app/backend

# 9. ポート公開
EXPOSE 8080

# 10. サーバー起動
CMD ["node", "index.js"]
