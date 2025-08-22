# ===== Frontend Build =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係をインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコードコピー
COPY frontend/ ./

# フロントエンドをビルド
RUN npm run build

# ===== Backend =====
FROM node:18 AS backend
WORKDIR /app

# 依存関係をインストール
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# バックエンドソースコードをコピー
COPY backend/ ./backend/

# frontend のビルド成果物を backend 配下へコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 作業ディレクトリを backend に
WORKDIR /app/backend

# バックエンド起動コマンド
CMD ["node", "index.js"]
