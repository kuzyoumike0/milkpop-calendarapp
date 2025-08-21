# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# 依存関係キャッシュ用
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/craco.config.js ./frontend/

# backend install
WORKDIR /app/backend
RUN npm install

# frontend install
WORKDIR /app/frontend
RUN npm install

# 🔴 ここで全体コピー（CSSやsrcを含める）
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
