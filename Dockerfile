# 1) Frontend build
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Backend runtime
FROM node:18
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./

# Copy built frontend to backend/public
COPY --from=frontend-build /app/frontend/dist ./public

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
