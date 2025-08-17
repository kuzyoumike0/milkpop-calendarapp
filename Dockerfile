# Frontend build stage
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Backend stage
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public
WORKDIR /app/backend
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]
