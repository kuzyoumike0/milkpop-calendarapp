# Build frontend
FROM node:18 AS fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Backend
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
COPY --from=fe /app/frontend/dist ./public
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
