# =============================
# Frontend Build Stage
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係だけコピー
COPY frontend/package*.json ./

# 環境変数とメモリ設定
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# Backend Stage
# =============================
FROM node:18
WORKDIR /app/backend

# backend依存関係インストール
COPY backend/package*.json ./
RUN npm install

# ソースコピー
COPY backend/ ./

# フロントのビルド済みファイルを backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "index.js"]
