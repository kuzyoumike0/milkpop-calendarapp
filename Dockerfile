# ====== フロントエンドをビルド ======
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====== バックエンドをセットアップ ======
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./ 

# フロントのビルド成果物を backend 配下にコピー
COPY --from=frontend /app/frontend/build ./frontend/build

CMD ["node", "index.js"]
