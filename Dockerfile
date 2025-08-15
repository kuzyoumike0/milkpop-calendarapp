# フロントビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./          # ← frontend/package.json をコピー
RUN npm install
COPY frontend/ ./                       # ← src など全体をコピー
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# バックエンドビルドステージ
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./           # ← backend/package.json をコピー
RUN npm install
COPY backend/ ./                        # ← index.js など全体をコピー

# 本番ステージ（Nginx + バックエンド）
FROM nginx:alpine
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html
COPY --from=backend-build /app/backend /app/backend
WORKDIR /app/backend

EXPOSE 80 5000
CMD sh -c "node index.js & nginx -g 'daemon off;'"
