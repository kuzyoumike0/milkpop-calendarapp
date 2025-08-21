FROM node:18

WORKDIR /app

# ===== Backend setup =====
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# ===== Frontend setup =====
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# ===== Copy the rest (ここで tailwind.config.js, postcss.config.js, index.css などが入る) =====
WORKDIR /app
COPY . .

# ===== Frontend build =====
WORKDIR /app/frontend
RUN npm run build

# ===== Backend start =====
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
