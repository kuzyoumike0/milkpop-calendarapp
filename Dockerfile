# 1. Node.js 18 を使用
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# 3. フロントエンド依存関係のみ先にコピーしてインストール（キャッシュ活用）
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# 4. バックエンド依存関係のみ先にコピーしてインストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 5. ソースコード全コピー
COPY frontend ./frontend
COPY backend ./backend

# 6. フロントエンドビルド
RUN cd frontend && npm run build

# 7. ビルドしたフロントエンドを backend/public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# 8. 作業ディレクトリを backend に変更
WORKDIR /app/backend

# 9. ポート公開
EXPOSE 8080

# 10. サーバー起動
CMD ["node", "index.js"]
