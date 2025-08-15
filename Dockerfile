# 1. Node でビルド
FROM node:18 AS build
WORKDIR /app

# package.json のみコピー
COPY frontend/package.json ./

# lock ファイルなしで依存インストール
RUN npm install

# ソースコードコピー
COPY frontend/ ./

# React ビルド
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# 2. nginx で静的ファイル提供
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# デフォルトの nginx 設定で 80 ポート
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
