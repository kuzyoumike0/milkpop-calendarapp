# ================================
# フロントエンドビルドステージ
# ================================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係だけコピーして先にインストール（キャッシュ効率化）
COPY frontend/package*.json ./
RUN npm install

# ソース全体をコピーしてビルド
COPY frontend/ ./
RUN npm run build

# ================================
# バックエンドステージ
# ================================
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ../frontend/build

# 環境変数とポート設定
ENV PORT=8080
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
