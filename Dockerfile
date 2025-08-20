# ===== ベースイメージ =====
FROM node:18 AS builder

WORKDIR /app

# --- フロントエンドの依存関係インストール＆ビルド ---
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== 本番用イメージ =====
FROM node:18

WORKDIR /app

# --- バックエンド依存関係 ---
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# --- ソースコピー（バックエンド + フロントビルド済みファイル） ---
# ❌ ここが間違いだった
# COPY backend/ ./backend/
# ✅ 正しくは backend/ を /app/backend にコピー
COPY backend/ /app/backend
COPY --from=builder /app/frontend/build /app/frontend/build

# バックエンドの作業ディレクトリをセット
WORKDIR /app/backend

# --- 環境変数設定 ---
ENV NODE_ENV=production

# --- サーバー起動 ---
CMD ["node", "index.js"]
