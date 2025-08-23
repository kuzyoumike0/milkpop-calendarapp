# ===============================
# 1. フロントエンド ビルド
# ===============================
FROM node:18 AS frontend-build

WORKDIR /app
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# ===============================
# 2. バックエンド 実行
# ===============================
FROM node:18

WORKDIR /app
COPY backend/package.json ./backend/
RUN cd backend && npm install
COPY backend ./backend

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

ENV NODE_ENV=production

# Railway が自動で PORT を渡すので ENV PORT=5000 は不要
EXPOSE 8080

CMD ["node", "/app/backend/index.js"]
