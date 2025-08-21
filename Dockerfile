# Node.js 公式イメージ
FROM node:18

WORKDIR /app

# まず全体コピー
COPY . .

# backend install
WORKDIR /app/backend
RUN npm install

# frontend build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 再度 backend を作業ディレクトリに
WORKDIR /app/backend

# 環境変数
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
