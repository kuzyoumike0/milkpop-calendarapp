# Stage 1: Build frontend
FROM node:18-alpine as build
WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend source
COPY index.js ./

# Install and build frontend
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies & code
COPY package*.json ./
RUN npm install --production
COPY index.js ./

# Copy built frontend to public folder
COPY --from=build /app/frontend/build ./public

EXPOSE 5000
CMD ["node", "index.js"]
