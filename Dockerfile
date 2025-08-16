# Multi-stage build for frontend + backend

# --- Frontend build ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# --- Backend build ---
FROM node:18 AS backend
WORKDIR /app/backend

# Install backend deps
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend ./

# Copy frontend build into backend public
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
CMD ["node", "server.js"]
