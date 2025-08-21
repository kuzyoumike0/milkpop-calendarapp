FROM node:18

WORKDIR /app

# ===== Backend =====
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# ===== Frontend =====
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# ===== Copy all sources =====
WORKDIR /app
COPY . .

# ===== Build Frontend =====
WORKDIR /app/frontend
RUN npm run build

# ===== Start Backend =====
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
