# ================================
# 1. Frontend build stage
# ================================
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ================================
# 2. Backend build stage
# ================================
FROM node:18 AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# ================================
# 3. Final production image
# ================================
FROM node:18
WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend build output → backend/public に配置
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Expose port
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
