# ========== フロントエンドビルド ==========
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install   # ← 変更

COPY frontend/ ./
RUN CI=false npm run build


# ========== バックエンド ==========
FROM node:18 AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install   # ← 変更

COPY backend/ ./

COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 5000
CMD ["npm", "start"]
