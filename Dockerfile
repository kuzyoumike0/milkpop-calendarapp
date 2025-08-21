# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18 AS backend
WORKDIR /app

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントエンドのビルド成果物を backend から見える ../frontend/build にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 起動
CMD ["node", "index.js"]
