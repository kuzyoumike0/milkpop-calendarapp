# ===== フロントエンドビルド =====
FROM node:20.17-bullseye AS frontend-build

# 作業ディレクトリ
WORKDIR /app/frontend

# npm メモリ拡張
ENV NODE_OPTIONS=--max_old_space_size=8192

# package.json と package-lock.json をコピー
COPY frontend/package*.json ./

# npm install（キャッシュ削除 & 強制）
RUN rm -rf /tmp/npm-cache && npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# フロントエンドソースをコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ===== バックエンド =====
FROM node:20.17-bullseye

WORKDIR /app/backend

# backend package.json / package-lock.json コピー
COPY backend/package*.json ./

# npm install
RUN rm -rf /tmp/npm-cache && npm ci --legacy-peer-deps --force --prefer-offline=false --no-audit --fetch-retries=20 --fetch-retry-mintimeout=10000

# backend ソースコピー
COPY backend/ ./

# frontend のビルド成果物を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

# ポート解放
EXPOSE 8080

# サーバ起動
CMD ["node", "index.js"]
