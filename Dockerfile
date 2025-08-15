# =========================
# フロントビルドステージ
# =========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# =========================
# バックエンドビルドステージ
# =========================
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./

# =========================
# 本番ステージ（Nginx + バックエンド）
# =========================
FROM nginx:alpine

# React のビルド成果物を Nginx にコピー
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# バックエンドを同じコンテナにコピー
COPY --from=backend-build /app/backend /app/backend
WORKDIR /app/backend

# ポート設定
EXPOSE 80 5000

# バックエンドと Nginx を同時に起動
CMD sh -c "node index.js & nginx -g 'daemon off;'"
