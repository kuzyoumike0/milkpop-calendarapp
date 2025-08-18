# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# メモリ対策
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係を小分けでインストール
COPY frontend/package*.json ./
RUN npm install react react-dom --legacy-peer-deps \
 && npm install react-scripts --legacy-peer-deps \
 && npm install --legacy-peer-deps

# ソースコードコピー & ビルド
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドステージ
# =============================
FROM node:18 AS backend
WORKDIR /app/backend

# メモリ対策
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係インストール（小分け可）
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# バックエンドコードコピー
COPY backend/ ./

# フロントのビルド成果物を配置
COPY --from=frontend-build /app/frontend/build ./public

# ポート設定
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
