# --- ビルドステージ（フロントエンド） ---
FROM node:18 AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# --- 実行ステージ（バックエンド + 静的ファイル） ---
FROM node:18 AS backend

WORKDIR /app

# backend の package.json をコピー
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# backend のソースコード
COPY backend/ ./ 

# frontend のビルド成果物を backend/public に配置
WORKDIR /app
COPY --from=frontend-build /app/frontend/build ./frontend/build

# サーバーの起動ポート
EXPOSE 8080

# backend/index.js を実行
CMD ["node", "backend/index.js"]
