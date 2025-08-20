# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json コピーして依存インストール
COPY frontend/package*.json ./

# ajv v6 を強制的に入れる
RUN npm install --legacy-peer-deps

# ソースコードコピー & ビルド
COPY frontend/ ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# =============================
# 2. バックエンドステージ
# =============================
FROM node:18
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# frontend のビルド成果物を public に配置
COPY --from=frontend-build /app/frontend/build ./public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
