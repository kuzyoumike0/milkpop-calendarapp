# ========== ビルド用 Node イメージ ==========
FROM node:18 AS build

# 作業ディレクトリ
WORKDIR /app

# ====== フロントエンド ======
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# フロントエンドのソースをコピーしてビルド
COPY frontend/ ./
# ✅ CI=false を追加して警告で止まらないように
RUN CI=false npm run build

# ====== バックエンド ======
WORKDIR /app/backend
COPY backend/package*.json ./ 
RUN npm ci

# バックエンドのソースをコピー
COPY backend/ ./

# ====== フロントエンドのビルド成果物をバックエンドにコピー ======
COPY --from=build /app/frontend/build ./frontend/build

# ====== 本番実行 ======
EXPOSE 5000
CMD ["npm", "start"]
