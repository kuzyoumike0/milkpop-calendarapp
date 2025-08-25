FROM node:18-alpine

WORKDIR /app

# まず react-scripts を強制インストール
RUN npm install -g react-scripts@5.0.1

# package.json をコピー
COPY package.json ./

# 通常依存をインストール（devDependenciesも含む）
RUN npm install --production=false

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# 静的サーバー serve をインストール
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
