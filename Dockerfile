# Node.js ベースイメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# backend の依存関係インストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# frontend の依存関係インストールとビルド
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && npm run build

# ソースコードをコピー
COPY backend ./backend
COPY frontend ./frontend

# backend が frontend/build を配信できるようにする
# → index.js で express.static("../frontend/build") を設定済みのはず
#   （もし未設定なら教えてください。追記コード書きます）

# ポート解放
EXPOSE 5000

# サーバー起動
CMD ["node", "backend/index.js"]
