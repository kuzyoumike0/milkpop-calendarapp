# ===== フロントビルド =====
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build   # この時点で /app/frontend/build が生成される

# ===== バックエンド =====
FROM node:18
WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install
COPY backend/ ./

# frontend-build からコピー
COPY --from=frontend-build /app/frontend/build ./public
