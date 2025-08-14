# Node.js ベースイメージ
FROM node:18

WORKDIR /app

# バックエンド依存
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# フロント依存 & ビルド
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && npm run build

# バックエンド & フロントビルドをコピー
COPY backend/ ./backend/
# ビルド成果物を public にコピー
RUN mkdir -p backend/public
COPY frontend/build/ ./backend/public/

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "index.js"]
