# フロントビルド
FROM node:18 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# バックエンド
FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY --from=frontend-build /app/build ./public
ENV PORT 8080
EXPOSE 8080
CMD ["node", "index.js"]
