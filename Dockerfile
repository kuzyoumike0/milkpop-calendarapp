# ===== Frontend build stage =====
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== Backend stage =====
FROM node:18 AS backend
#WORKDIR /app/backend
WORKDIR /app

# ===== backend 依存 =====
#COPY backend/package*.json ./
#RUN npm install --production
#COPY backend/ ./
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --production
COPY backend ./backend

# frontend のビルド成果物を backend/public にコピー
#COPY --from=frontend /app/frontend/build ./public
COPY --from=frontend /app/frontend/build ./frontend/build

WORKDIR /app/backend

EXPOSE 5000
CMD ["npm", "start"]

