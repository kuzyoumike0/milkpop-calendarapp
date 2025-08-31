# ===== Stage 1: frontend build =====
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# 依存関係を先に入れる（lockfile が無い場合は npm install にする）
COPY frontend/package*.json ./
# npm ci は lockfile が無いと失敗するため npm install を使う
RUN npm install --no-audit --no-fund

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ===== Stage 2: backend runtime =====
FROM node:20-alpine AS backend
WORKDIR /app/backend

# 依存関係を先に入れる（本番は dev を除外）
COPY backend/package*.json ./
# こちらも lockfile が無い可能性があるので npm install を利用
RUN npm install --omit=dev --no-audit --no-fund

# ソースをコピー
COPY backend/ ./

# フロントの build をバックエンドの親ディレクトリに配置
# backend/index.js は ../frontend/build を参照するため、このパスに置く
COPY --from=frontend-build /app/frontend/build ../frontend/build

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "index.js"]
