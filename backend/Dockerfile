FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ../frontend ./frontend
RUN npm run build-frontend

COPY . .

EXPOSE 4000
CMD ["npm", "start"]
