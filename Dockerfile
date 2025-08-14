# ベース
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# --- フロント ---
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- バック ---
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# フロントのビルド成果物をバックエンドで配信
COPY --from=0 /app/frontend/build ./public

# 環境変数
ENV PORT 8080

# ポート開放
EXPOSE 8080

# 起動
CMD ["node", "index.js"]
