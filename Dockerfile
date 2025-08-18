# =============================
# 1. フロントエンドビルド
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# =============================
# 2. バックエンド
# =============================
FROM node:18 AS backend
WORKDIR /app/backend

ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係インストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# バックエンドソースコピー
COPY backend/ ./

# フロントエンド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
