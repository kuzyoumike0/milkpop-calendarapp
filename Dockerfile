# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Run server
FROM node:18-alpine
WORKDIR /app
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend-dist

ENV PORT=3000
EXPOSE 3000
WORKDIR /app/backend
CMD ["npm","start"]
