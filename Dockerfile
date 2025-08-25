# ====== フロントエンド ======
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# 依存関係インストール（package.json 先コピーでキャッシュ効かせる）
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# ソースをコピー
COPY frontend/ ./

# Node のメモリ上限を増加させてビルド
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build


# ====== バックエンド ======
FROM node:18 AS backend

WORKDIR /app

# package.json をコピーして依存関係をインストール
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps

# ソースコードコピー
COPY backend/ ./

# フロントのビルド成果物を public に配置（Express で配信する想定）
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 3000

CMD ["npm", "start"]
