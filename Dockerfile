# Lightweight production image
FROM node:18-alpine

ENV NODE_ENV=production     PORT=8080

# Create app directory
WORKDIR /app

# Only copy package manifest first for better layer caching
COPY package.json ./

# Install only prod deps (none of dev deps needed)
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the app
COPY backend ./backend
COPY frontend ./frontend

# Expose port
EXPOSE 8080

# Healthcheck (optional but handy)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3   CMD wget -qO- http://localhost:8080/ || exit 1

# Start server
CMD ["node", "backend/server.js"]
