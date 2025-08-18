# Node.js 18 をベースに利用
FROM node:18

# 作業ディレクトリ
WORKDIR /app/frontend

# 依存関係を先にコピーしてインストール
COPY package*.json ./

# 依存関係をインストール
# ajv/ajv-keywords のバージョンを固定しているので --legacy-peer-deps で解決
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY . .

# OpenSSL 互換性対策（Node.js v17以降で必要）
ENV NODE_OPTIONS=--openssl-legacy-provider

# React をビルド
RUN npm run build

# 本番用サーバーとして serve を利用
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build"]
