# ===========================
# 1. Build Frontend
# ===========================
FROM node:18 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./ 
RUN npm install

COPY frontend ./ 
RUN npm run build


# ===========================
# 2. Setup Backend
# ===========================
FROM node:18

WORKDIR /app

# backend パッケージをコピーしてインストール
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm install

# frontend ビルド成果物を backend 側にコピー
WORKDIR /app
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY backend ./backend

WORKDIR /app/backend

# 環境変数
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
