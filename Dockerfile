# Stage 1: フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と package-lock.json だけコピー
COPY frontend/package*.json ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# 依存関係インストール
RUN npm ci

# フロントエンドソースをコピー
COPY frontend/ ./

# 本番用ビルド
RUN npm run build

# Stage 2: バックエンド
FROM node:18 AS backend
WORKDIR /app/backend

# バックエンド package.json コピーして依存関係インストール
COPY backend/package*.json ./
RUN npm ci

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# 環境変数
ENV PORT=8080

# ポート公開
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
