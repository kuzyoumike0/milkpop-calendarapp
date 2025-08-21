# ===== フロントビルド =====
FROM node:18 AS builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

# ソースコピー
COPY backend ./          # ← backend ディレクトリをそのままコピー
COPY --from=builder /app/frontend/build ./frontend/build

ENV NODE_ENV=production

# デバッグ: backendの中身を確認
RUN echo "=== backend contents ===" && ls -R /app/backend

CMD ["node", "index.js"]  # ← backend/index.js が必ず起動される
