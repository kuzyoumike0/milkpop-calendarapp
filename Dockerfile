# ===== フロントエンドビルド =====
FROM node:18.20.1-bullseye AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール（キャッシュ活用）
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --legacy-peer-deps

# ビルド
COPY frontend/ ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# ===== バックエンド =====
FROM node:18.20.1-bullseye
WORKDIR /app/backend

# 依存関係インストール（キャッシュ活用）
COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --legacy-peer-deps

# バックエンドコードコピー
COPY backend/ ./

# フロントエンドのビルド成果物を public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放
EXPOSE 8080

# サーバ起動
CMD ["node", "index.js"]
