# -----------------------
# フロントエンドビルド
# -----------------------
FROM node:18-bullseye AS frontend-build
WORKDIR /app/frontend

# 依存関係のみ先にインストール（キャッシュを効かせる）
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコードコピー
COPY frontend/ ./

# ビルド（Vite 4 + React 18 + 安定版 plugin-react）
RUN npm run build

# -----------------------
# バックエンドビルド
# -----------------------
FROM node:18-bullseye AS backend-build
WORKDIR /app/backend

# 依存関係のみ先にインストール
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコードコピー
COPY backend/ ./

# -----------------------
# 実行用コンテナ
# -----------------------
FROM node:18-bullseye
WORKDIR /app

# バックエンド配置
COPY --from=backend-build /app/backend ./backend

# フロントエンドのビルド成果物をバックエンドのpublicディレクトリへコピー
COPY --from=frontend-build /app/frontend/dist ./backend/public

# ポートと起動コマンド
EXPOSE 3000
CMD ["node", "backend/server.js"]
