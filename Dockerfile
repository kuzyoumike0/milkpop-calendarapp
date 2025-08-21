# ===== Frontend Build =====
FROM node:18 AS builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== Backend =====
FROM node:18
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build
COPY --from=builder /app/frontend/build ./frontend/build

WORKDIR /app/backend

ENV NODE_ENV=production

# Debug: check files exist
RUN ls -R /app

CMD ["node", "index.js"]
