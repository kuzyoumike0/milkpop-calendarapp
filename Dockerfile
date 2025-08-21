# Node.js 公式イメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# 依存ファイルコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# backend 依存関係インストール
WORKDIR /app/backend
RUN npm install

# frontend ビルド
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# build成果物を backend で配信する
WORKDIR /app
COPY . .
WORKDIR /app/backend

# 環境変数
ENV NODE_ENV=production
ENV PORT=3000

# サーバー起動
CMD ["npm", "start"]
