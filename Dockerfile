# 1. Node.js 18 を使用
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. package.json と package-lock.json を先にコピー（キャッシュ活用）
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 4. 依存関係インストール
RUN cd frontend && npm install
RUN cd backend && npm install

# 5. フロントエンドソースコピー＆ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# 6. バックエンドコピー
COPY backend ./backend

# 7. ビルド成果物をバックエンド public に配置
RUN rm -rf backend/public
RUN mv frontend/build backend/public

# 8. 作業ディレクトリをバックエンドに変更
WORKDIR /app/backend

# 9. ポート公開
EXPOSE 8080

# 10. サーバー起動
CMD ["node", "index.js"]
