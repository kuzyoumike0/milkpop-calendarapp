# Frontend build
FROM node:18 AS fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Backend
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
COPY --from=fe /app/backend/public ./public
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
