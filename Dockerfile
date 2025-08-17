# Frontend build
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Backend
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
COPY --from=frontend /app/frontend/dist ./public
EXPOSE 8080
CMD ["node", "index.js"]
