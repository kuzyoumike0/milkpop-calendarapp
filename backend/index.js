FROM node:18

WORKDIR /app

# backend 依存関係
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# frontend 依存関係
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# プロジェクト全体コピー（craco.config.js など含む）
COPY . .

# frontend ビルド
RUN cd frontend && npm run build

# ポート公開
EXPOSE 5000

# backend サーバー起動
CMD ["node", "backend/index.js"]
