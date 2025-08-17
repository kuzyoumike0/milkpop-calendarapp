# Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Backend
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
RUN npm install
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
