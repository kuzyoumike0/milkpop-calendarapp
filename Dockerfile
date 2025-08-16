# Stage 1: フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package-lock.json がない場合でもコピー可能にする
COPY frontend/package.json ./

# メモリ不足対策
ENV NODE_OPTIONS=--max_old_space_size=4096

# npm install
RUN npm install --legacy-peer-deps

# フロントエンドソースコピー
COPY frontend/ ./

# 本番ビルド
RUN npm run build

# Stage 2: バックエンド
FROM node:18 AS backend
WORKDIR /app/backend

# package-lock.json がなくても安全にコピー
COPY backend/package.json ./

# npm install
RUN npm install --legacy-peer-deps

# バックエンドソースコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# 環境変数
ENV PORT=8080

# ポート公開
EXPOSE 8080

# サーバー起動
CMD ["node", "index.js"]
