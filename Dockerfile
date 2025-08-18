# Node.js 18 を利用
FROM node:18

# 作業ディレクトリを設定
WORKDIR /app/frontend

# package.json をコピーして依存関係をインストール
COPY package.json ./
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY . .

# OpenSSL 互換モード（Node17以降のwebpackエラー回避）
ENV NODE_OPTIONS=--openssl-legacy-provider

# Reactビルド
RUN npm run build

# 本番は serve を利用
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]
