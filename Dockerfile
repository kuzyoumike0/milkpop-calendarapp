# ==========================
# ベースイメージ
# ==========================
FROM node:18

# ==========================
# 作業ディレクトリ
# ==========================
WORKDIR /app

# ==========================
# --- フロントエンド ---
# ==========================
WORKDIR /app/frontend

# package.json だけ先にコピーして依存インストール（キャッシュ効率）
COPY frontend/package*.json ./
RUN npm install

# フロントエンドソース全体をコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ==========================
# --- バックエンド ---
# ==========================
WORKDIR /app/backend

# package.json だけ先にコピーして依存インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドソース全体をコピー
COPY backend/ ./

# フロントビルド成果物をバックエンドで配信
COPY --from=0 /app/frontend/build ./public

# ==========================
# 環境変数・ポート
# ==========================
ENV PORT 8080
EXPOSE 8080

# ==========================
# 起動コマンド
# ==========================
CMD ["node", "index.js"]
