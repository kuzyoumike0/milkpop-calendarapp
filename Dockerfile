# =============================
# ベースイメージ: Node.js 20
# =============================
FROM node:20

# 作業ディレクトリ作成
WORKDIR /app

# =============================
# 依存関係インストール
# =============================

# frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# =============================
# ソースコードコピー
# =============================
WORKDIR /app
COPY . .

# =============================
# frontend ビルド
# =============================
WORKDIR /app/frontend
RUN npm run build

# =============================
# サーバー起動
# =============================
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "start"]
