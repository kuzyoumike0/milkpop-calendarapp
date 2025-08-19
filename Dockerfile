# =============================
# 1. フロントエンドビルド
# =============================
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# =============================
# 2. バックエンド
# =============================
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY backend/ ./

# フロントエンドのビルド成果物を backend/public に配置
COPY --from=frontend-build /app/frontend/build ./public

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
