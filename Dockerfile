# ===== フロントエンドビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# ビルド失敗時に強制終了する安全装置
RUN npm run build || { echo "❌ Frontend build failed"; exit 1; }

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# フロントエンド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
