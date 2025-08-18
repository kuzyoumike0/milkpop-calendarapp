# =============================
# Frontend Build Stage
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と lockファイルをコピー
COPY frontend/package*.json ./

# 依存関係インストール
RUN npm install --legacy-peer-deps

# ソースコードをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =============================
# Backend Stage
# =============================
FROM node:18
WORKDIR /app/backend

# backend依存関係
COPY backend/package*.json ./
RUN npm install

# ソースコピー
COPY backend/ ./

# frontendのbuild成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index
