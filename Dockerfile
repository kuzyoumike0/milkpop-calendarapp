# ==== フロントビルド ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==== バックエンド ====
FROM node:18
WORKDIR /app/backend

# バックエンド依存
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# フロントビルド成果物をバックエンドの public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数を使って起動
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
