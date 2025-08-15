# =====================
# 1. フロントエンドビルドステージ
# =====================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.jsonとlockファイルだけ先にコピー
COPY frontend/package*.json ./

# BuildKitキャッシュを利用（Railway対応）
RUN --mount=type=cache,id=myapp-frontend-npm-cache,target=/root/.npm \
    npm ci

# ソースコピー
COPY frontend/ ./

# メモリ上限回避用
ENV NODE_OPTIONS=--max-old-space-size=4096

# ビルド
RUN npm run build

# =====================
# 2. バックエンドビルドステージ
# =====================
FROM node:18 AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./

RUN --mount=type=cache,id=myapp-backend-npm-cache,target=/root/.npm \
    npm ci

COPY backend/ ./

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

# 本番起動コマンド
CMD ["npm", "start"]
