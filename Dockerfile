# 1. React ビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Node サーバー
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
