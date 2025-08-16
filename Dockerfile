# フロントエンドビルド用
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# バックエンド用
FROM node:18 AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# ビルド済みフロントをバックエンド配信用フォルダにコピー
COPY --from=frontend-build /app/frontend/build ./frontend_build

# 環境変数
ENV PORT=8080

EXPOSE 8080
CMD ["node", "index.js"]
