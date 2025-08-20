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

# --- ソースコピー（バックエンドの中身を /app/backend にコピー） ---
COPY backend/ /app/backend/
COPY --from=builder /app/frontend/build /app/frontend/build

# 作業ディレクトリを backend に設定
WORKDIR /app/backend

# --- 環境変数設定 ---
ENV NODE_ENV=production

# --- サーバー起動 ---
CMD ["node", "index.js"]
