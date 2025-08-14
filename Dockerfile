# ベースイメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# 1. バックエンド依存関係をコピーしてインストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# 2. フロントエンド依存関係をコピーしてビルド
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend
RUN cd frontend && npm run build

# ビルド成果物をバックエンド public にコピー
RUN mkdir -p backend/public
RUN cp -r frontend/build/* backend/public/

# バックエンドコードコピー
COPY backend/ ./backend

# 作業ディレクトリ移動
WORKDIR /app/backend

# ポート公開
EXPOSE 4000

# 起動コマンド
CMD ["npm", "start"]
