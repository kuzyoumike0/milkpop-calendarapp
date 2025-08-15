# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# 依存関係インストール（package-lock.json なしでも動作）
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# フロントエンドソースをコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# React アプリをビルド
RUN npm run build

# ===== バックエンド =====
FROM node:18

WORKDIR /app/backend

# バックエンド依存インストール
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントのビルド済みファイルを backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# バックエンドポート
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
