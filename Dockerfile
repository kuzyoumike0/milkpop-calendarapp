# マルチステージビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
# フロントエンドビルド成果物をコピー
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 8080
CMD ["node", "index.js"]