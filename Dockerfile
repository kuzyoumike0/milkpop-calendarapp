# === Frontend Build ===
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# === Backend ===
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public
EXPOSE 8080
CMD ["node", "index.js"]
