# ===== ベースイメージ =====
FROM node:18 AS builder

WORKDIR /app

# --- フロントエンドの依存関係インストール＆ビルド ---
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# フロントのソースコード（public/ も含む）
COPY frontend/ ./ 

# ✅ _redirects が public/ に入っていれば build/ にコピーされる
RUN npm run build

# ===== 本番用イメージ =====
FROM node:18

WORKDIR /app

# --- バックエンド依存関係 ---
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# --- ソースコピー（バックエンド + フロントビルド済みファイル） ---
COPY backend/ ./backend/
COPY --from=builder /app/frontend/build ./frontend/build

# バックエンドの作業ディレクトリをセット
WORKDIR /app/backend

# --- 環境変数設定 ---
ENV NODE_ENV=production

# --- サーバー起動 ---
CMD ["node", "index.js"]
