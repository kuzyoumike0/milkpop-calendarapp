# =============================
# 1. フロントエンドビルドステージ
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール用に package.json をコピー
COPY frontend/package*.json ./

# ajv v6 + ajv-keywords v3 を固定解決 (--legacy-peer-deps)
RUN npm install --legacy-peer-deps

# ソースコードをコピーしてビルド
COPY frontend/ ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# =============================
# 2. バックエンドステージ
# =============================
FROM node:18
WORKDIR /app/backend

# backend の依存関係をインストール
COPY backend/package*.json ./
RUN npm install

# backend ソースコードをコピー
COPY backend/ ./

# frontend のビルド成果物を public に配置
COPY --from=frontend-build /app/frontend/build ./public

# =============================
# 3. 環境設定 & 起動
# =============================
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
