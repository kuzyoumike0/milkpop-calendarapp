FROM node:18-alpine

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json ./

# devDependencies も含めてインストール（react-scriptsが確実に入るように）
RUN npm install --production=false

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# 本番サーバーとして serve を使用
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
