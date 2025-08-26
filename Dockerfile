# ===== Frontend build stage =====
FROM node:18 AS frontend

WORKDIR /app/frontend

# 依存関係をインストール
COPY frontend/package*.json ./
RUN npm install

# ソースコードをコピー & ビルド
COPY frontend/ ./
RUN npm run build


# ===== Backend stage =====
FROM node:18 AS backend

WORKDIR /app

# backend の依存関係インストール
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# backend ソースをコピー
COPY backend/ ./

# frontend のビルド成果物を backend にコピー
COPY --from=frontend /app/frontend/build ../frontend/build

EXPOSE 5000

CMD ["npm", "start"]
