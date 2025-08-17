FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "server.js"]
