# ビルド用イメージ
FROM node:18 AS build

WORKDIR /app

# フロントエンド依存関係を先にコピー
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# フロントエンドビルド
COPY frontend/ ./frontend
RUN cd frontend && npm run build

# バックエンド用
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# ビルド済みフロントをバックエンドの公開フォルダにコピー
COPY --from=build /app/frontend/build ./frontend/build

# 環境変数
ENV PORT=8080

EXPOSE 8080
CMD ["node", "index.js"]
