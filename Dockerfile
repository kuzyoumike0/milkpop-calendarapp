# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド + 静的ファイル提供 =====
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# フロントのbuildをバックエンドのpublicへコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数を使えるようにする
ENV NODE_ENV=production
CMD ["node", "index.js"]
