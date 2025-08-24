# ========= フロントエンド ビルド =========
FROM node:18 AS frontend-builder

# 作業ディレクトリ
WORKDIR /app/frontend

# package.json と lock ファイルをコピー
COPY frontend/package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY frontend/ ./

# 本番用ビルドを作成
RUN npm run build

# ========= バックエンド 実行 =========
FROM node:18

WORKDIR /app/backend

# backend の依存関係をコピー
COPY backend/package*.json ./
RUN npm install

# backend ソースをコピー
COPY backend/ ./

# frontend のビルド成果物を backend/public にコピー
COPY --from=frontend-builder /app/frontend/build ./public

# ポート
EXPOSE 3000

# サーバー起動
CMD ["npm", "start"]
