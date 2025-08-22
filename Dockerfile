# ====== ビルド用ステージ ======
FROM node:18 AS build
WORKDIR /app

# frontend 依存関係インストール
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# フロントエンドのソースをコピー & ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ====== 実行ステージ ======
FROM node:18
WORKDIR /app/backend

# backend の依存関係インストール
COPY backend/package*.json ./
RUN npm ci --only=production

# backend 全体をコピー
COPY backend ./

# フロントエンドのビルド成果物を配置
COPY --from=build /app/frontend/build ./build

EXPOSE 3000
CMD ["node", "index.js"]
