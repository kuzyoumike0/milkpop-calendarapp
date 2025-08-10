# ベースイメージ（公式Node.js 18を使用）
FROM node:18-alpine

# 作業ディレクトリ作成
WORKDIR /app

# package.json と package-lock.json（ある場合）をコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# コンテナ起動時のコマンド
CMD ["node", "start", "index.js"]

# コンテナが使用するポート番号（Express側の設定に合わせる）
EXPOSE 4000
