# ===== フロントビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json のみコピーして依存インストール
COPY frontend/package.json ./
RUN npm install

# ソースコードコピー
COPY frontend/ ./

# React ビルド
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# package.json 依存インストール
COPY backend/package.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントビルドを backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# Cloud Run が要求するポート環境変数
ENV PORT=8080
EXPOSE 8080

# バックエンド起動
CMD ["node", "index.js"]
