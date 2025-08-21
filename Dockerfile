# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコピーしてビルド
COPY frontend/ ./
RUN npm run build   # ✅ ここで /app/frontend/build が生成される

# ===== バックエンド =====
FROM node:18 AS backend
WORKDIR /app

# backend の依存関係
COPY backend/package*.json ./
RUN npm install

# backend のソースをコピー
COPY backend/ ./

# フロントエンドの build をコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

CMD ["node", "index.js"]
