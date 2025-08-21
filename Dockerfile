# ==========================
# フロントエンドのビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ==========================
# バックエンド
# ==========================
FROM node:18
WORKDIR /app

# backend コピー
COPY backend ./backend

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

CMD ["node", "index.js"]
