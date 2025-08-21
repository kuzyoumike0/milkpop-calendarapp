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

# バックエンド依存関係
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
WORKDIR /app

# ソースコピー
COPY backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build

# 環境変数
ENV NODE_ENV=production

# デバッグ: build の中身を確認
RUN ls -R /app/frontend/build

WORKDIR /app/backend
CMD ["node", "index.js"]
