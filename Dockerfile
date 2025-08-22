# ===== フロントエンドのビルド =====
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./

# フロントのビルド成果物をコピー
COPY --from=frontend /app/frontend/build ../frontend/build

EXPOSE 8080
CMD ["node", "index.js"]
