# マルチステージビルド

# 1. フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. バックエンド
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public

WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
