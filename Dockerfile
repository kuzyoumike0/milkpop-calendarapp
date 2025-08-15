# ベースイメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# ---------- フロントをビルド ----------
# package.json と package-lock.json をコピー
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

# フロント全コピー
COPY frontend/ frontend/
RUN cd frontend && npm run build

# ---------- バックをセットアップ ----------
COPY backend/package*.json backend/
RUN cd backend && npm install

COPY backend/ backend/

# フロントの build をバックにコピー
RUN cp -r frontend/build backend/build

# 環境変数
ENV PORT=5000
ENV DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/milkpop

EXPOSE 5000

# コンテナ起動
WORKDIR /app/backend
CMD ["node", "index.js"]
