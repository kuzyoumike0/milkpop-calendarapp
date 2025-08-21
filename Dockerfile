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

# 先に package.json だけコピーして依存解決
COPY backend/package*.json ./
RUN npm install

# ソースコピー（←ここ重要！）
COPY backend/ ./

# フロントのビルド成果物を backend 内にコピー
COPY --from=builder /app/frontend/build ./frontend/build

ENV NODE_ENV=production

# デバッグ: index.js が存在するか確認
RUN echo "=== backend contents ===" && ls -R /app/backend

CMD ["node", "index.js"]
