# =============================
# 1. Frontend Build Stage
# =============================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# package.json と lock をコピーして依存解決
COPY frontend/package*.json ./
COPY frontend/craco.config.js ./
RUN npm install

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# =============================
# 2. Backend Stage
# =============================
FROM node:20-alpine AS backend

WORKDIR /app

# backend の依存関係をインストール
COPY backend/package*.json ./
RUN npm install

# backend ソースをコピー
COPY backend/ ./

# frontend の build 出力をコピーして static として配信
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 環境変数（Railway / Docker Compose で上書きする想定）
ENV NODE_ENV=production
ENV PORT=5000

# 公開ポート
EXPOSE 5000

# 起動コマンド
CMD ["node", "index.js"]
