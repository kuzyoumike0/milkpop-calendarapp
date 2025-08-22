# ==========================
# 1. フロントエンドをビルド
# ==========================
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================
# 2. バックエンドをセットアップ
# ==========================
FROM node:18 AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./

# ==========================
# 3. React のビルド成果物をコピー
# ==========================
COPY --from=frontend /app/frontend/build ./frontend/build

# ==========================
# 4. 起動コマンド
# ==========================
CMD ["node", "index.js"]
