# ---------------------
# バックエンド + フロント静的配信
# ---------------------
FROM node:18
WORKDIR /app

# バックエンド依存関係インストール
COPY backend/package*.json ./
RUN npm install

# バックエンドコピー
COPY backend/ ./

# ローカルで作った React ビルドをコピー
COPY frontend/build ./public

# ポート指定
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
