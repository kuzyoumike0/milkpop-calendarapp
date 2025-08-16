# Frontend Build
FROM node:18-bullseye AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Backend Build
FROM node:18-bullseye AS backend-build
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --legacy-peer-deps
COPY backend/ ./

# Runner
FROM node:18-bullseye
WORKDIR /app
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public
EXPOSE 3000
CMD ["node", "backend/server.js"]
