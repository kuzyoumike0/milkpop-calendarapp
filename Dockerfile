# ====== フロントエンド ビルド ======
FROM node:18 AS build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====== バックエンド ======
FROM node:18
WORKDIR /app

# backend の依存関係
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# フロントのビルド成果物をコピー
WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build
COPY backend ./backend

WORKDIR /app/backend
CMD ["node", "index.js"]
