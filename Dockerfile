FROM node:18

WORKDIR /app

# ===== backend の依存関係 =====
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# ===== frontend の依存関係 =====
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# ===== ソースコードコピー =====
COPY . .

# ===== frontend ビルド =====
RUN cd frontend && npm run build

# ===== ポート公開 =====
EXPOSE 5000

# ===== サーバー起動 =====
CMD ["node", "backend/index.js"]
