# =====================
# フロントエンドビルド
# =====================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json と package-lock.json をコピーして依存インストール
COPY frontend/package*.json ./
RUN npm install

# フロントエンドソースをコピー
COPY frontend/ ./

# React ビルド
RUN npm run build

# =====================
# バックエンド + フロント統合
# =====================
FROM node:18
WORKDIR /app/backend

# バックエンド依存インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースをコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドの public フォルダにコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート公開
EXPOSE 8080

# 起動コマンド
CMD ["node", "index.js"]
