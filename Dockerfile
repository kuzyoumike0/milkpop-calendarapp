# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# ソースコピー
COPY backend/ ./

# フロントのビルド済み成果物をコピー
COPY --from=frontend-build /app/frontend/build ../frontend/build

EXPOSE 8080
CMD ["node", "index.js"]
