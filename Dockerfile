FROM node:18
WORKDIR /app

# バックエンド依存関係
COPY backend/package*.json ./
RUN npm install

# バックエンドソース
COPY backend/ ./

# フロントビルド（ホストで作成済み）
COPY frontend/build ./public

# ポート
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
