# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend
COPY --from=builder /app/frontend/build ./backend/build
WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "index.js"]
