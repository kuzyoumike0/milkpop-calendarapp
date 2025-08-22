# ====== Frontend Build ======
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコードコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ====== Backend ======
FROM node:18 AS backend
WORKDIR /app/backend

# backend の依存関係インストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# backend ソースコピー
COPY backend/ ./

# frontend/build を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# アプリ実行
CMD ["node", "index.js"]
