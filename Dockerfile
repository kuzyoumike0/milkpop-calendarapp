# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# package.jsonだけ先にコピーして依存関係をキャッシュ
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

# 🔴 ここで全体をコピーしないとCSS設定ファイルが入らない
WORKDIR /app
COPY . .

# frontend build
WORKDIR /app/frontend
RUN npm run build

# backend 起動
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
