# ===== 基本イメージ =====
FROM node:18-alpine

# ===== ワークディレクトリ作成 =====
WORKDIR /app

# ===== package.json をコピーして依存関係をインストール =====
COPY package.json ./
# package-lock.json があるなら一緒にCOPYして npm ci を使うのがベスト
# COPY package*.json ./
# RUN npm ci
RUN npm install

# ===== ソースコード全体をコピー =====
COPY . .

# ===== ビルド =====
RUN npm run build

# ===== 本番サーバーとして serve を使用 =====
# 静的ファイルを配信するために serve を入れる
RUN npm install -g serve

# ===== ポート設定 =====
EXPOSE 3000

# ===== 起動コマンド =====
CMD ["serve", "-s", "build", "-l", "3000"]
