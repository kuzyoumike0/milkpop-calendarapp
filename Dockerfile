FROM node:18 AS build

WORKDIR /app

# バックエンド依存関係
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# フロントエンド依存関係
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# フロントエンドソースコピー＆ビルド
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# ビルドしたフロントを backend/public に配置
COPY backend ./backend
RUN rm -rf backend/public && mv frontend/build backend/public

WORKDIR /app/backend
EXPOSE 8080
CMD ["npm", "start"]
