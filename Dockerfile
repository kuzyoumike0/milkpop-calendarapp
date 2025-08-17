# フロントエンドビルド
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# バックエンド
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 8080
CMD ["npm", "start"]
