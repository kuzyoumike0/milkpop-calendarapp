# ===== Frontend build =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build && ls -l build/index.html

# ===== Backend =====
FROM node:18
WORKDIR /app/backend

# 依存関係インストール
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントエンド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
