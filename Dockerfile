# フロントエンドビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm install
COPY frontend/ ./
RUN npm run build

# バックエンドステージ
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm install
COPY backend/ ./

# 最終ステージ
FROM node:18
WORKDIR /app
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY --from=backend /app/backend ./backend
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
