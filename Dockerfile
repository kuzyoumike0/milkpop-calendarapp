# 1. Node.jsイメージ
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# =============================
# バックエンドの準備
# =============================
# 3. package.json と lock ファイルだけコピー
COPY backend/package*.json ./backend/

# 4. バックエンド依存関係インストール
RUN cd backend && npm install

# =============================
# フロントエンドの準備
# =============================
# 5. package.json と lock ファイルだけコピー
COPY frontend/package*.json ./frontend/

# 6. フロントエンド依存関係インストール
WORKDIR /app/frontend
RUN npm ci

# 7. フロントエンドソースコードコピー
COPY frontend/ ./

# 8. フロントエンドビルド
RUN npm run build

# =============================
# バックエンドと統合
# =============================
WORKDIR /app
# バックエンドソースコードコピー
COPY backend/ ./backend/

# ビルドしたフロントを backend/public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

# =============================
# 最終設定
# =============================
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "index.js"]
