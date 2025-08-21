# ==== Frontend Build Stage ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# フロントエンドソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== Backend Stage ====
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントのビルド成果物をバックエンドの public にコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 3000
CMD ["node", "index.js"]
