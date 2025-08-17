FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY backend ./backend
COPY frontend ./frontend

ENV PORT=8080
EXPOSE 8080
CMD ["node", "backend/server.js"]
