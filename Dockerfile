FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm ci --force

# アプリコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max-old-space-size=4096

# ビルド
RUN npm run build
