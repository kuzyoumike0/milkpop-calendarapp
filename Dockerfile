# Simple runtime image (no frontend build needed)
FROM node:18-slim
WORKDIR /app

# Install backend deps
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --production

# Copy sources
COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "server.js"]
