# ステージ1: フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と package-lock.json をコピー
COPY frontend/package*.json ./

# メモリ不足回避
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm install

# ソースコピー
COPY frontend/ ./

# Vite ビルド
RUN npm run build

# ステージ2: バックエンド
FROM node:18
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# フロント dist をバックエンドにコピー
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8080
CMD ["node", "index.js"]
