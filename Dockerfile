FROM node:18
WORKDIR /app

# フロントセットアップ
COPY frontend/package*.json frontend/
RUN cd frontend && npm install
COPY frontend/ frontend/
RUN cd frontend && npm run build

# バックセットアップ
COPY backend/package*.json backend/
RUN cd backend && npm install
COPY backend/ backend/

# フロントビルドをバックに統合
RUN cp -r frontend/build backend/build

# Railway PostgreSQL 接続
ENV PORT=5000
ENV DATABASE_URL=postgresql://postgres:eJjJplyhHrsYWyTqeOauZwunjRPMFUFv@tramway.proxy.rlwy.net:39592/railway

EXPOSE 5000
WORKDIR /app/backend
CMD ["node", "index.js"]
