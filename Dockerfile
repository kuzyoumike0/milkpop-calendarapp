# ===== Frontend build stage =====
FROM node:18 AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== Backend stage =====
FROM node:18 AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# frontend のビルド成果物を backend にコピー
COPY --from=frontend /app/frontend/build ./frontend/build

EXPOSE 5000

CMD ["node", "index.js"]
