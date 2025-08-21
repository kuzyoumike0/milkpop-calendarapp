# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# backend 依存関係
COPY backend/package*.json backend/
WORKDIR /app/backend
RUN npm install

# frontend 依存関係
COPY frontend/package*.json frontend/
WORKDIR /app/frontend
RUN npm install

# プロジェクト全体コピー
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
