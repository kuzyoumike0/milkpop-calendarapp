# ==========================
# フロントエンドビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係を先にコピーしてインストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==========================
# バックエンド
# ==========================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public に配置
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["npm", "start"]
