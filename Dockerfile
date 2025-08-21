# ===== フロントビルド =====
FROM node:18 AS builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app

# --- バックエンド依存関係 ---
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# --- ソースコピー ---
COPY backend/ ./backend/
COPY --from=builder /app/frontend/build ./frontend/build  # ← 修正！../ をやめる

WORKDIR /app/backend

ENV NODE_ENV=production

# デバッグ用
RUN ls -R /app

CMD ["node", "index.js"]
