# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app

# バックエンド依存関係
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# ソースコードコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドのpublicに配置
COPY --from=frontend-build /app/frontend/build ./public

# ポート
EXPOSE 8080

# 実行
CMD ["node", "index.js"]
