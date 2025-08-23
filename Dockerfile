FROM node:18

WORKDIR /app

# まず backend と frontend の package.json をコピーして依存関係インストール
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

# プロジェクト全体をコピー（craco.config.js なども含まれる）
COPY . .

# frontend をビルド
RUN cd frontend && npm run build

# ポート解放
EXPOSE 5000

# サーバー起動
CMD ["node", "backend/index.js"]
