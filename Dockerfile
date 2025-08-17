# build frontend
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# backend
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend ./
COPY --from=frontend /app/frontend/dist ./public
EXPOSE 8080
CMD ["node", "server.js"]
