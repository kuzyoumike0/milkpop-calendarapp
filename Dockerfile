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
COPY backend/ ./
COPY --from=builder /app/frontend/build ../frontend/build

ENV NODE_ENV=production

RUN ls -R /app/backend   # デバッグ: index.js があるか確認

CMD ["node", "index.js"]
