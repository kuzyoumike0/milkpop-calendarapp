# フロントエンドビルド
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# バックエンド
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
RUN npm install
EXPOSE 8080
CMD ["npm","start"]
