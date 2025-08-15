# ベースイメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# フロントエンド依存
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# バックエンド依存
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# フロント・バックコピー
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# フロントビルド
RUN cd frontend && npm run build

# ポート設定
EXPOSE 5000

# サーバ起動
CMD ["node", "backend/index.js"]
