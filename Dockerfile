# ビルド用
FROM node:18 AS builder
WORKDIR /app
COPY frontend ./frontend
COPY backend ./backend
WORKDIR /app/frontend
RUN npm install && npm run build

# 実行用
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build
WORKDIR /app/backend
RUN npm install
CMD ["node", "index.js"]
