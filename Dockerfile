# =====================
# フロントビルドステージ
# =====================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# ビルドメモリ確保
ENV NODE_OPTIONS=--max-old-space-size=4096

# 依存関係インストール（npm ci → npm install に変更）
COPY frontend/package*.json ./
RUN npm install

# フロントソースコピー
COPY frontend/ ./

# React ビルド
RUN npm run build

# =====================
# バックエンドステージ
# =====================
FROM node:18

WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンド public 配下にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境変数
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
