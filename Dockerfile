# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# 依存関係をキャッシュするために package.json だけ先にコピー
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/craco.config.js ./frontend/

# 依存関係インストール
WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

# 🔹 ここで全体コピー
WORKDIR /app
COPY . .

# frontend ビルド
WORKDIR /app/frontend
RUN npm run build

# backend 起動
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npm", "start"]
