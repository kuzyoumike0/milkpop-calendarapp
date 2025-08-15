# フロントビルドステージ
FROM node:18 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ ./
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# Nginx 配信ステージ
FROM nginx:alpine
COPY --from=frontend-build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
