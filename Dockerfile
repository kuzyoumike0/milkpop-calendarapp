# Build stage
FROM node:18 AS build
WORKDIR /app

# Frontend
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Backend
WORKDIR /app/backend
COPY backend ./
RUN npm install

# Runtime stage
FROM node:18
WORKDIR /app
COPY --from=build /app/backend ./
EXPOSE 8080
CMD ["npm", "start"]
