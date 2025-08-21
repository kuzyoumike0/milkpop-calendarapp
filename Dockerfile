# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# backend 依存関係インストール
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# frontend 依存関係インストール
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# ここで残り全部をコピー（craco.config.js含む）
WORKDIR /app
COPY . .

# frontend ビルド
WORKDIR /app/frontend
RUN npm run build

# backend に戻って成果物を配信
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
