# --- frontend build ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# --- backend ---
FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend ./

# フロントのビルド成果物だけコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

CMD ["npm", "start", "--prefix", "backend"]
# ====== Frontend Build ======
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 依存関係インストール
COPY frontend/package*.json ./
RUN npm install

# ソースコード（public/fonts含む）をコピー
COPY frontend/ ./

# ビルド
RUN npm run build

# ====== Backend ======
FROM node:18 AS backend
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

# frontend/build を backend にコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend
CMD ["node", "index.js"]
