# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json のみコピー
COPY frontend/package.json ./

# lockファイルを使わない依存インストール
RUN npm install

# ビルド用にソースコピー
COPY frontend/ ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# React ビルド
RUN npm run build

# ===== バックエンド + 静的ファイル提供 =====
FROM node:18
WORKDIR /app/backend

# package.json のみコピー
COPY backend/package.json ./

RUN npm install
COPY backend/ ./

# フロントの build を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

ENV NODE_ENV=production
CMD ["node", "index.js"]
