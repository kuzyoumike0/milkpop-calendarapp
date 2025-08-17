
FROM node:18-alpine

WORKDIR /app

# backend deps
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --production

# app files
COPY backend ./backend
COPY frontend ./frontend

ENV PORT=8080
EXPOSE 8080

WORKDIR /app/backend
CMD ["node", "server.js"]
