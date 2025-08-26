# Node.js イメージを利用
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install --production

# ソースコードをコピー
COPY . .

# Railway/Heroku などが PORT を注入するので 5000 を指定
EXPOSE 5000

# サーバー起動
CMD ["npm", "start"]
