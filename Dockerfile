# Node.js 18 を利用
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# frontend ディレクトリの package.json をコピー
COPY frontend/package.json ./frontend/

# 依存関係インストール
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY frontend ./ 

# OpenSSL 互換モード（Node17以降のwebpackエラー回避）
ENV NODE_OPTIONS=--openssl-legacy-provider

# Reactビルド
RUN npm run build

# 本番は serve を利用
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]
