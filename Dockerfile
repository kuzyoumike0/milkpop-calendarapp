# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

# package.json をコピーして依存をインストール
COPY backend/package.json ./
RUN npm install

# バックエンドのソースをコピー
COPY backend/ ./

# フロントの build を backend/public にコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
