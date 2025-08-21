# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# backend と frontend の依存関係だけ先にコピーして install キャッシュ活用
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

# ここで全ソースをコピー（craco.config.js, tailwind.config.js も含まれる）
WORKDIR /app
COPY . .

# frontend build
WORKDIR /app/frontend
RUN npm run build

# backend に戻って起動設定
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
