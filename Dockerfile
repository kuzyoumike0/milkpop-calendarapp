# ===== Frontend build stage =====
FROM node:18-alpine AS frontend
WORKDIR /app/frontend

# 依存関係のみ先にコピー（ビルドキャッシュ最適化）
COPY frontend/package*.json ./
RUN npm ci

# ソースをコピーしてビルド
COPY frontend/ ./
RUN npm run build


# ===== Backend runtime stage =====
FROM node:18-alpine AS backend
WORKDIR /app
ENV NODE_ENV=production

# backend 依存関係（キャッシュ最適化）
COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

# backend ソース
COPY backend ./backend

# フロントのビルド成果物を /app/frontend/build に配置
# （backend/index.js は ../frontend/build を参照）
COPY --from=frontend /app/frontend/build ./frontend/build

# ポート公開
EXPOSE 5000

# 直接 node で起動（npm 経由だと SIGTERM 伝播の挙動が異なるため）
CMD ["node", "backend/index.js"]
