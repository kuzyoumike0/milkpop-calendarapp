# ====== ビルド用ステージ ======
FROM node:18 AS build

WORKDIR /app

# frontend
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# backend
COPY backend/package.json ./backend/
RUN cd backend && npm install

# ソースコピー & フロントビルド
COPY frontend ./frontend
RUN cd frontend && npm run build

# ====== 実行ステージ ======
FROM node:18
WORKDIR /app

COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/build ./backend/build

WORKDIR /app/backend
RUN npm install --production

EXPOSE 3000
CMD ["node", "index.js"]
