# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と package-lock.json（存在する場合）をコピー
COPY frontend/package.json frontend/package-lock.json* ./

# 依存関係インストール
RUN npm install

# フロントのソースコードをコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# React ビルド
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# package.json と package-lock.json（存在する場合）をコピー
COPY backend/package.json backend/package-lock.json* ./

# 依存関係インストール
RUN npm install

# バックエンドのソースコードをコピー
COPY backend/ ./

# フロントのビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポートを公開
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
