# ====== Frontend Build ======
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====== Backend ======
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# frontend/build を backend から見た ../frontend/build にコピー
COPY --from=frontend-build /app/frontend/build ../frontend/build

CMD ["node", "index.js"]
