# ==== フロントエンドビルドステージ ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と package-lock.json を先にコピー
COPY frontend/package*.json ./

# react-scripts を含む依存関係を必ずインストール
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンドステージ ====
FROM node:18 AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

COPY backend/ ./

# ==== 本番用ステージ ====
FROM node:18
WORKDIR /app

# バックエンドをコピー
COPY --from=backend-build /app/backend ./backend

# フロントエンドのビルド成果物を配置
COPY --from=frontend-build /app/frontend/build ./backend/public

WORKDIR /app/backend

EXPOSE 8080
CMD ["node", "index.js"]
