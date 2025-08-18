# ==========================
# フロントエンドビルド
# ==========================
FROM node:18 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./ 
RUN npm run build

# ==========================
# バックエンド
# ==========================
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./ 
# フロントエンドのビルド成果物を public に配置
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["npm", "start"]
