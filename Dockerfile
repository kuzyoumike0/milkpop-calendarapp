# ==== フロントエンドビルド ====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json だけコピーして依存関係をインストール
COPY frontend/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ==== バックエンドステージ ====
FROM node:18
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
