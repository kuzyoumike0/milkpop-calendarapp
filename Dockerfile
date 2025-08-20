# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコピー & ビルド
COPY frontend/ ./
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソースコピー
COPY backend/ ./

# フロントエンドビルド成果物をバックエンドの public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# 環境設定
ENV PORT=8080
EXPOSE 8080

# 起動コマンド
CMD ["node", "index.js"]
