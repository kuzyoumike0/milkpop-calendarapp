# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# package.json を先にコピーしてキャッシュを効かせる
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# backend インストール
WORKDIR /app/backend
RUN npm install

# frontend インストール
WORKDIR /app/frontend
RUN npm install

# 全ソースをコピー（ここで craco.config.js, tailwind.config.js も入る）
WORKDIR /app
COPY . .

# frontend build
WORKDIR /app/frontend
RUN npm run build

# backend 起動用
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
