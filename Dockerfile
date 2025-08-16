# =========================
# Stage 1: フロントエンドビルド
# =========================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# メモリ不足対策
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係をコピーしてインストール
COPY frontend/package*.json ./
RUN npm install

# フロントエンドソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# =========================
# Stage 2: バックエンド
# =========================
FROM node:18

WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# バックエンド用環境変数（例）
ENV PORT=8080

# バックエンドサーバーを起動
CMD ["node", "index.js"]
