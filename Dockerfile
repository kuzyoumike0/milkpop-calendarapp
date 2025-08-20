# ====== フロントエンド ビルドステージ ======
FROM node:18 AS builder

WORKDIR /app

# 依存関係インストール
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# ソースコピー & ビルド
COPY frontend/ ./ 
RUN npm run build


# ====== 本番ランタイム ======
FROM node:18

WORKDIR /app

# --- バックエンド依存関係 ---
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# --- バックエンドソースコピー ---
COPY backend/ ./backend/

# --- フロントのビルド成果物をコピー ---
COPY --from=builder /app/frontend/build ./frontend/build

# --- 環境変数 ---
ENV NODE_ENV=production
ENV PORT=8080

# --- サーバ起動 ---
WORKDIR /app/backend
CMD ["node", "index.js"]
