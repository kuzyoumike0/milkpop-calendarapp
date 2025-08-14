FROM node:18

WORKDIR /app

# パッケージコピー
COPY package*.json ./
RUN npm install

# フロントビルド
COPY ../frontend ./frontend
RUN npm run build-frontend

# バックエンドコピー
COPY . .

EXPOSE 4000
CMD ["npm", "start"]
