# ===== Stage 1: frontend build =====
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# 依存関係のみ先に入れてキャッシュを効かせる
COPY frontend/package*.json ./
# craco / tailwind 等があるなら lockfile に従って
RUN npm ci

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ===== Stage 2: backend runtime =====
FROM node:20-alpine AS backend
WORKDIR /app/backend

# 依存関係のみ先に
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ソースをコピー
COPY backend/ ./

# フロントの build をバックエンドの親ディレクトリに配置
# backend/index.js は ../frontend/build を配信するため、このパスに置く
COPY --from=frontend-build /app/frontend/build ../frontend/build

# 環境変数（必要に応じて）
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
