# Build stage
FROM node:18 AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY --from=builder /app/frontend/build ./build
EXPOSE 5000
CMD ["node", "index.js"]
