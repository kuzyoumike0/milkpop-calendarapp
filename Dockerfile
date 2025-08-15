# ===== フロントビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json のみコピーして依存インストール
COPY frontend/package.json ./
RUN npm install

# フロントソースコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# React ビルド
RUN npm run build

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# バックエンド依存インストール
COPY backend/package.json ./
RUN npm install

# バックエンドコピー
COPY backend/ ./

# フロントの build を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
