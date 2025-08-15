FROM node:18
WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install
COPY backend/ ./

# ローカルでビルドしたフロントをコピー
COPY frontend/build ./public

EXPOSE 8080
CMD ["node", "index.js"]
