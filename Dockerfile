# --- フロントビルドステージ ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# package.json のみコピーしてインストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build

# --- バックエンドステージ ---
FROM node:18
WORKDIR /app/backend

# backend package.json コピーして依存関係インストール
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# backend ソースコピー
COPY backend/ ./

# フロントビルド結果をコピー
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# フロント静的ファイルを配信
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
