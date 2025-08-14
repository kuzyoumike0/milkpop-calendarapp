# ==========================
# フロントビルドステージ
# ==========================
FROM node:18 AS frontend-build

# 作業ディレクトリ
WORKDIR /app/frontend

# 依存関係のみ先にコピーしてインストール（キャッシュ効率）
COPY frontend/package*.json ./
RUN npm install

# フロントソース全体をコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ==========================
# バックエンドステージ
# ==========================
FROM node:18

# 作業ディレクトリ
WORKDIR /app/backend

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソース全体をコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドで配信
COPY --from=frontend-build /app/frontend/build ./public

# ==========================
# 環境変数・ポート
# ==========================
ENV PORT 8080
EXPOSE 8080

# ==========================
# 起動コマンド
# ==========================
CMD ["node", "index.js"]
