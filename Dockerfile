# --- Frontend Build ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Backend ---
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

COPY --from=frontend-build /app/frontend/dist ./public
COPY backend/ ./

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
