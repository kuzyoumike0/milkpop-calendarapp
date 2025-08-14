# 1. Node.jsイメージ
FROM node:18 AS build

# 2. 作業ディレクトリ
WORKDIR /app

# =============================
# バックエンド準備
# =============================
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# =============================
# フロントエンド準備
# =============================
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
# package-lock.json がなければ npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 7. フロントエンドソースコピー
COPY frontend/ ./

# 8. フロントエンドビルド
RUN npm run build

# =============================
# バックエンドと統合
# =============================
WORKDIR /app
COPY backend/ ./backend/
RUN rm -rf backend/public && mv frontend/build backend/public

# =============================
# 最終設定
# =============================
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "index.js"]
