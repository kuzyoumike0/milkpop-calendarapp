# ====== ビルド用ステージ ======
FROM node:18 AS build
WORKDIR /app

# frontend をコピーして依存関係インストール & ビルド
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# backend をコピーして依存関係インストール
COPY backend ./backend
RUN cd backend && npm install

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
