# フロントビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json を先にコピー
COPY frontend/package*.json ./

# 安定のためクリーンインストール
RUN npm ci

COPY frontend/ ./

# メモリ増加
ENV NODE_OPTIONS=--max-old-space-size=4096

# ビルド時に react-scripts のバージョンを明示
RUN npm install react-scripts@5.0.1
RUN npm run build

# バックエンドステージ
FROM node:18
WORKDIR /app

COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# ビルド済みフロントコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
