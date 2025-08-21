FROM node:18

WORKDIR /app

# まず backend, frontend の package.json をコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# backend install
WORKDIR /app/backend
RUN npm install

# frontend install
WORKDIR /app/frontend
RUN npm install

# 🔹 ここで tailwind.config.js, postcss.config.js, craco.config.js を含めて全コピー
WORKDIR /app
COPY . .

# frontend build
WORKDIR /app/frontend
RUN npm run build

# backend 起動設定
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
