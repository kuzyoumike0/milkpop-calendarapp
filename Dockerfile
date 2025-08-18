# ==========================
# 1) Frontend build stage
# ==========================
FROM node:18-bullseye AS frontend-build
WORKDIR /app/frontend

ENV npm_config_loglevel=warn
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# 依存のみ先に入れてキャッシュ活用
COPY frontend/package*.json ./
COPY frontend/craco.config.js ./craco.config.js
RUN npm install --legacy-peer-deps

# ソース投入→ビルド
COPY frontend/ ./
RUN npm run build

# ==========================
# 2) Backend stage
# ==========================
FROM node:18-bullseye AS backend
WORKDIR /app/backend

ENV npm_config_loglevel=warn
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PORT=8080

# 依存
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# ソース
COPY backend/ ./

# フロントのビルド成果物をバックエンドに組み込み
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 8080
CMD ["node", "index.js"]
