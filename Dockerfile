# ===== フロントエンドをビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18 AS backend
WORKDIR /app

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend ./backend

# フロントのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend

# Railway 用ポート設定
ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
