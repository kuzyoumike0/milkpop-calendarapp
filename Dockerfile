# Node.js 公式イメージ
FROM node:18

# 作業ディレクトリを /app に設定
WORKDIR /app

# ルートに置いた package.json があるなら先にコピー
COPY package*.json ./

# backend の package.json をコピー
COPY backend/package*.json ./backend/
# frontend の package.json をコピー
COPY frontend/package*.json ./frontend/

# backend の依存をインストール
WORKDIR /app/backend
RUN npm install

# frontend の依存をインストール & build
WORKDIR /app/frontend
RUN npm install && npm run build

# 残りのソースコードをコピー
WORKDIR /app
COPY . .

# Express サーバーを起動
WORKDIR /app/backend
CMD ["node", "index.js"]
