# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18 AS backend
WORKDIR /app/backend

# 依存関係インストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコピー
COPY backend/ ./

# フロントのビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
