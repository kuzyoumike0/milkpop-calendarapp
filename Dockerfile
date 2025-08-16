# Stage 1: Frontend build
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Stage 2: Backend setup
FROM node:18
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install
COPY backend ./

# Copy frontend build to backend public dir
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 8080
CMD ["npm", "start"]
