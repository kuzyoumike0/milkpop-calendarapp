# ====== Stage 1: React をビルド ======
FROM node:18 AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====== Stage 2: Node.js Backend ======
FROM node:18

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# backend コードコピー
COPY backend/ ./

# React build の成果物を backend にコピー
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 3000
CMD ["node", "index.js"]
