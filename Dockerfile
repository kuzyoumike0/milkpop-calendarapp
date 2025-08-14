# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド + 静的ファイル提供 =====
FROM node:18
WORKDIR /app/backend

# バックエンドの依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドコードをコピー
COPY backend/ ./

# フロントのbuildをpublicへコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV NODE_ENV=production

# 起動
CMD ["node", "index.js"]
