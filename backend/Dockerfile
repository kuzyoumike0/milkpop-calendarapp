# ===== Node.js ベースイメージ =====
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# ソースコードコピー
COPY . .

# ポート公開
EXPOSE 3000

# サーバー起動
CMD ["node", "index.js"]
