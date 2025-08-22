# ===== React (frontend) build =====
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ===== Backend (Express) =====
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# React のビルド成果物を backend から見える /app/frontend/build にコピー
COPY --from=frontend /app/frontend/build /app/frontend/build

# backend のソースをコピー
COPY backend ./

# 環境変数
ENV NODE_ENV=production

CMD ["node", "index.js"]
