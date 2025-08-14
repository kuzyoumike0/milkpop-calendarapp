# フロントビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と lock ファイルをコピー
COPY frontend/package*.json ./

# 依存インストール
RUN npm install

# ソースをコピー
COPY frontend/ ./

# メモリ増量
ENV NODE_OPTIONS=--max-old-space-size=8192

# React ビルド
RUN npm run build
