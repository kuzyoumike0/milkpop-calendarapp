FROM node:18 AS build

WORKDIR /app

# 依存関係のコピー（package-lock.json は任意）
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# バックエンド依存関係
RUN cd backend && npm install

# フロントエンド依存関係
RUN cd frontend && npm install

# フロントエンドソースコピー＆ビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# バックエンドコピー
COPY backend ./backend

# ビルドしたフロントを backend/public に配置
RUN rm -rf backend/public && mv frontend/build backend/public

WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "index.js"]
