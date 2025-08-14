# フロントビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# ビルド時のメモリを 4GB に制限
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build
