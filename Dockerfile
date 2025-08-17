# 1) Build frontend
FROM node:18 AS fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2) Backend
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=fe /app/frontend/dist ./public
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
