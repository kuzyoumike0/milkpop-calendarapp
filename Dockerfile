# Node.js 公式
FROM node:18

WORKDIR /app

# 依存だけ先にコピーしてキャッシュ利用
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

# 🔹 ここで全体をコピーする（tailwind.config.js も含まれる）
WORKDIR /app
COPY . .

# フロントをビルド
WORKDIR /app/frontend
RUN npm run build

# backend 起動
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
