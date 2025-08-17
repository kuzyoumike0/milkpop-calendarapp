FROM node:18

WORKDIR /app

# Backend
COPY backend ./backend
WORKDIR /app/backend
RUN npm install

# Frontend
WORKDIR /app/frontend
COPY frontend ./
RUN npm install && npm run build

# Serve backend
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
