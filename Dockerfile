# ========== ビルド用 Node イメージ ==========
FROM node:18 AS build

WORKDIR /app

# ====== フロントエンド ======
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# ソースコピー & ビルド
COPY frontend/ ./
# ✅ CI=false を追加して警告でビルドが止まらないように
RUN CI=false npm run build

# ====== バックエンド ======
WORKDIR /app/backend
COPY backend/package*.json ./ 
RUN npm ci

# ソースコピー
COPY backend/ ./

# ====== フロントエンドのビルド成果物を backend に配置 ======
COPY --from=build /app/frontend/build ./frontend/build

# ====== 本番実行 ======
EXPOSE 5000
CMD ["npm", "start"]
