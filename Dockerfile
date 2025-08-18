# フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps   # ✅ 安定動作のため
COPY frontend/ ./
RUN npm run build
