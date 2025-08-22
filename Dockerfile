# ====== Frontend Build ======
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ソースコードをコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ====== Backend ======
FROM node:18 AS backend
WORKDIR /app

# backend の依存関係
COPY backend/package*.json ./backend/
RUN cd backend && npm install --legacy-peer-deps

# backend ソースコードコピー
COPY backend/ ./backend/

# frontend/build を backend にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend
CMD ["node", "index.js"]
