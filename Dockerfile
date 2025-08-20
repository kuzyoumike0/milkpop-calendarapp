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

# --- ソースコピー ---
COPY backend/ /app/backend
COPY --from=builder /app/frontend/build /app/frontend/build

WORKDIR /app/backend

ENV NODE_ENV=production

CMD ["node", "index.js"]
