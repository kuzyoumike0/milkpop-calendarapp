FROM node:18

WORKDIR /app

# バックエンド依存関係
COPY package*.json ./
RUN npm install

# フロントエンドビルド
COPY ../frontend ./frontend
RUN npm run build-frontend

# バックエンドコードコピー
COPY . .

EXPOSE 4000
CMD ["npm", "start"]
