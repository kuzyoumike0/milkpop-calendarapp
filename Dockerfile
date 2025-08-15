# ベースイメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# package.json まとめてコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 依存関係インストール
RUN cd backend && npm install
RUN cd frontend && npm install

# フロントビルド
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# バックエンドコピー
COPY backend/ ./backend/

# ポート
EXPOSE 5000

# 起動コマンド
CMD ["node", "backend/index.js"]
