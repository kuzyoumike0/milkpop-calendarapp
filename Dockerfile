# ==== フロントエンドビルド ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係だけ先にコピーしてインストール（react-scripts を含む）
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# フロントソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンド ====
FROM node:18 AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

COPY backend/ ./

# ==== 実行ステージ（統合） ====
FROM node:18
WORKDIR /app

# バックエンド配置
COPY --from=backend-build /app/backend ./backend

# フロント成果物を backend/public へ
COPY --from=frontend-build /app/frontend/build ./backend/public

WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "index.js"]
