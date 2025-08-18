# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# メモリ不足対策
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係インストール（段階的にインストールしてメモリ負荷軽減）
COPY frontend/package*.json ./
RUN npm install react-scripts react react-dom --legacy-peer-deps
RUN npm install --legacy-peer-deps

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンドステージ
# =============================
FROM node:18 AS backend
WORKDIR /app/backend

# メモリ不足対策
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係インストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# バックエンドコードコピー
COPY backend/ ./

# フロントのビルド成果物を配置
COPY --from=frontend-build /app/frontend/build ./public

# ポート設定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
