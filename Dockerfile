# Frontend build
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Backend
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./backend/public
WORKDIR /app/backend
RUN npm install
EXPOSE 8080
CMD ["npm","start"]