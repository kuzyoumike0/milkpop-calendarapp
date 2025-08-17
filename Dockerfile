FROM node:18-alpine

ENV NODE_ENV=production     PORT=8080

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY backend ./backend
COPY frontend ./frontend

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3   CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["node", "backend/server.js"]
