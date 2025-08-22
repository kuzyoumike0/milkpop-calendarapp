# ====== ビルド用ステージ ======
FROM node:18 AS build

WORKDIR /app

# frontend 依存関係インストール
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# backend 依存関係インストール
COPY backend/package.json ./backend/
RUN cd backend && npm install

# フロントエンドのソースをコピー & ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ====== 実行ステージ ======
FROM node:18
WORKDIR /app

# backend 全体をコピー
COPY backend ./backend

# フロントエンドのビルド成果物を backend/build に配置
COPY --from=build /app/frontend/build ./backend/build

# 本番用依存関係インストール
WORKDIR /app/backend
RUN npm install --production

EXPOSE 3000
CMD ["node", "index.js"]
