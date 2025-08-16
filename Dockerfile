# unified Dockerfile (no frontend build, serve static files)
FROM node:18-alpine

WORKDIR /app

# backend deps
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --only=prod

# copy source
COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "backend/server.js"]
