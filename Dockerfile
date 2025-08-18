# ==== フロントエンドビルド ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json をコピー
COPY frontend/package*.json ./

# 依存関係をクリーンに入れる
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps --omit=dev

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンド ====
FROM node:18
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
